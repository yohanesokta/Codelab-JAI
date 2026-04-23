'use server';

import { db } from '@/db';
import { submissions, problems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getProblemById } from './problem';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { ChildProcess } from 'child_process';

// Global map to track active processes for manual termination
const activeProcesses = new Map<string, ChildProcess>();

// Helper to run python code locally using child_process
async function runPythonCode(
  code: string, 
  input?: string, 
  executionId?: string
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  const tmpFilePath = path.join(os.tmpdir(), `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}.py`);

  try {
    await writeFile(tmpFilePath, code, 'utf-8');

    const result = await new Promise<{ stdout: string; stderr: string; exitCode: number | null }>((resolve) => {
      const pyProcess = spawn('python3', [tmpFilePath]);
      
      if (executionId) {
        activeProcesses.set(executionId, pyProcess);
      }

      let stdout = '';
      let stderr = '';
      
      pyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pyProcess.on('close', (exitCode) => {
        if (executionId) activeProcesses.delete(executionId);
        resolve({ stdout, stderr, exitCode });
      });

      if (input) {
        pyProcess.stdin.write(input);
      }
      pyProcess.stdin.end();
      
      const timeout = setTimeout(() => {
        pyProcess.kill();
        if (executionId) activeProcesses.delete(executionId);
        resolve({ stdout, stderr: stderr + '\nExecution timed out (5s)', exitCode: -1 });
      }, 5000);

      pyProcess.on('exit', () => clearTimeout(timeout));
    });

    return result;
  } finally {
    try {
      await unlink(tmpFilePath);
    } catch (e) { }
  }
}

export async function runCode(data: { code: string; executionId: string }) {
    try {
        const result = await runPythonCode(data.code, undefined, data.executionId);
        return { success: true, ...result };
    } catch (error) {
        return { success: false, error: 'Execution failed' };
    }
}

export async function stopCode(executionId: string) {
    const process = activeProcesses.get(executionId);
    if (process) {
        process.kill();
        activeProcesses.delete(executionId);
        return { success: true };
    }
    return { success: false, message: 'Process not found' };
}

export async function runTests(data: { problemId: number; code: string }) {
  try {
    const problem = await getProblemById(data.problemId);
    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return { success: false, error: 'Problem not found or has no test cases' };
    }

    const testResults = [];
    let allPassed = true;

    for (const testCase of problem.testCases) {
      let passed = false;
      let actualOutput = '';
      let error = '';

      if (testCase.type === 'script') {
        const combinedCode = `${data.code}\n\n# --- Test Script ---\n${testCase.testScript}`;
        const result = await runPythonCode(combinedCode);
        passed = result.exitCode === 0;
        actualOutput = result.stdout;
        error = result.stderr;
      } else {
        const result = await runPythonCode(data.code, testCase.input || '');
        actualOutput = result.stdout;
        error = result.stderr;

        if (result.exitCode === 0) {
          passed = result.stdout.trim() === (testCase.expectedOutput || '').trim();
        } else {
          passed = false;
        }
      }

      if (!passed) allPassed = false;

      testResults.push({
        id: testCase.id,
        passed,
        actualOutput,
        error,
        type: testCase.type
      });
    }

    return { success: true, allPassed, testResults };
  } catch (error) {
    console.error('Test execution failed:', error);
    return { success: false, error: 'Failed to run tests' };
  }
}

export async function submitCode(data: { nim: string; problemId: number; code: string }) {
  try {
    const problem = await getProblemById(data.problemId);
    if (!problem) return { success: false, error: 'Problem not found' };

    // Check timing constraints
    const now = new Date();
    if (problem.startTime && now < new Date(problem.startTime)) {
      return { success: false, error: 'Problem is not available yet' };
    }
    if (problem.endTime && now > new Date(problem.endTime)) {
      return { success: false, error: 'Problem submission period has ended' };
    }

    const testResult = await runTests({ problemId: data.problemId, code: data.code });
    if (!testResult.success) return { success: false, error: testResult.error };

    const finalStatus = testResult.allPassed ? 'pass' : 'fail';

    await db.insert(submissions).values({
      nim: data.nim,
      problemId: data.problemId,
      code: data.code,
      status: finalStatus,
    });

    revalidatePath('/admin/dashboard');

    return { success: true, status: finalStatus, allPassed: testResult.allPassed };
  } catch (error) {
    console.error('Submission failed:', error);
    return { success: false, error: 'Execution failed due to server error' };
  }
}

export async function getSubmissions() {
  // Join query to get submissions with problem titles
  const result = await db.select({
    id: submissions.id,
    nim: submissions.nim,
    code: submissions.code,
    status: submissions.status,
    createdAt: submissions.createdAt,
    problemId: submissions.problemId,
    problemTitle: problems.title
  })
    .from(submissions)
    .leftJoin(problems, eq(submissions.problemId, problems.id))
    .orderBy(submissions.createdAt);

  return result;
}
