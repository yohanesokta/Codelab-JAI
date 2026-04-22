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

// Helper to run python code locally using child_process
async function runPythonCode(code: string, input: string): Promise<string> {
  const tmpFilePath = path.join(os.tmpdir(), `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}.py`);
  
  try {
    await writeFile(tmpFilePath, code, 'utf-8');
    
    return new Promise((resolve, reject) => {
      const pyProcess = spawn('python3', [tmpFilePath]);
      
      let stdout = '';
      let stderr = '';
      
      pyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pyProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || 'Process exited with non-zero code'));
        } else {
          resolve(stdout);
        }
      });

      // Write testcase input to python's stdin
      if (input) {
        pyProcess.stdin.write(input);
      }
      pyProcess.stdin.end();
      
      // Auto timeout after 5 seconds to prevent infinite loops
      setTimeout(() => {
        pyProcess.kill();
        reject(new Error('Execution timed out'));
      }, 5000);
    });
  } finally {
    // Cleanup the temp file
    try {
      await unlink(tmpFilePath);
    } catch(e) {
      // ignore unlink errors
    }
  }
}

export async function submitCode(data: { nim: string; problemId: number; code: string }) {
  try {
    // Get problem and test cases
    const problem = await getProblemById(data.problemId);
    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return { success: false, error: 'Problem not found or has no test cases' };
    }

    let allPassed = true;
    let failReason = '';

    // Run against each test case locally
    for (const testCase of problem.testCases) {
      try {
        const output = await runPythonCode(data.code, testCase.input);
        
        // Simple string comparison (ignoring trailing whitespace/newlines differences)
        if (output.trim() !== testCase.expectedOutput.trim()) {
          allPassed = false;
          failReason = 'Wrong Answer';
          break; // Stop testing if one fails
        }
      } catch (err: any) {
        allPassed = false;
        failReason = err.message || 'Error occurred';
        break;
      }
    }

    const finalStatus = allPassed ? 'pass' : 'fail';

    // Save to DB
    await db.insert(submissions).values({
      nim: data.nim,
      problemId: data.problemId,
      code: data.code,
      status: finalStatus,
    });

    revalidatePath('/admin/dashboard');

    return { success: true, status: finalStatus, error: failReason };
  } catch (error) {
    console.error('Submission failed:', error);
    // Record error state
    await db.insert(submissions).values({
      nim: data.nim,
      problemId: data.problemId,
      code: data.code,
      status: 'error',
    });
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
