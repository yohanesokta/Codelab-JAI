'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { submitCode, runTests, runCode, stopCode } from "@/app/actions/submission";
import { useRouter } from "next/navigation";
import Timer from "../../components/Timer";

interface EditorClientProps {
  problemId: number;
  endTime?: Date | null;
  duration?: number | null;
}

export default function EditorClient({ problemId, endTime, duration }: EditorClientProps) {
  const [code, setCode] = useState("def solve():\n    # Write your python code here\n    pass\n\nsolve()\n");
  const [nim, setNim] = useState("");
  const [tempNim, setTempNim] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [effectiveEndTime, setEffectiveEndTime] = useState<Date | null>(endTime || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<{stdout: string, stderr: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');
  const [executionError, setExecutionError] = useState<string | null>(null);
  
  const router = useRouter();
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleOutput]);

  // Reload warning
  useEffect(() => {
    if (!isLocked) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Warning: Reloading the page might cause you to lose progress. Are you sure?";
        return e.returnValue;
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isLocked]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleStartChallenge = () => {
    if (!tempNim.trim()) {
      alert("Please enter your Student ID (NIM)");
      return;
    }

    if (duration && !endTime) {
      const newEndTime = new Date();
      newEndTime.setMinutes(newEndTime.getMinutes() + duration);
      setEffectiveEndTime(newEndTime);
    }

    setNim(tempNim);
    setIsLocked(false);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setActiveTab('tests');
    setExecutionError(null);
    try {
      const res = await runTests({ problemId, code });
      if (res.success) {
        setTestResults(res.testResults || []);
        setAllTestsPassed(res.allPassed || false);
      } else {
        setExecutionError(res.error || "Failed to run tests");
      }
    } catch (e) {
      setExecutionError("Network error occurred while running tests");
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRunCode = async () => {
    const id = `exec-${Date.now()}`;
    setExecutionId(id);
    setIsExecuting(true);
    setActiveTab('console');
    setConsoleOutput({ stdout: 'Running code...', stderr: '' });
    
    try {
      const res = await runCode({ code, executionId: id });
      if (res.success) {
        const successRes = res as { stdout: string; stderr: string };
        setConsoleOutput({ stdout: successRes.stdout || '', stderr: successRes.stderr || '' });
      } else {
        const errorRes = res as { error: string };
        setConsoleOutput({ stdout: '', stderr: errorRes.error || 'Execution failed' });
      }
    } catch (e) {
      setConsoleOutput({ stdout: '', stderr: 'Network error occurred' });
    } finally {
      setIsExecuting(false);
      setExecutionId(null);
    }
  };

  const handleStopCode = async () => {
    if (!executionId) return;
    try {
      await stopCode(executionId);
      setConsoleOutput(prev => ({
        stdout: (prev?.stdout || '') + '\n[Execution Stopped by User]',
        stderr: prev?.stderr || ''
      }));
    } catch (e) {
      console.error("Failed to stop code", e);
    } finally {
      setIsExecuting(false);
      setExecutionId(null);
    }
  };

  const handleSubmit = async () => {
    if (!allTestsPassed) {
      alert("Please pass all test cases before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await submitCode({ nim, problemId, code });
      if (res.success) {
        alert("Submission successful! Redirecting to dashboard...");
        router.push('/');
      } else {
        alert("Submission failed: " + res.error);
      }
    } catch (e) {
      alert("Network error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeExpire = useCallback(() => {
    setIsLocked(true);
    alert("Time is up! Your session has been locked.");
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      {/* NIM Entry Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#1e1e1e]/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-[#252526] border border-[#333333] rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Start?</h2>
            <p className="text-zinc-400 mb-8">Enter your Student ID (NIM) to unlock the workspace and start the challenge.</p>
            
            <div className="mb-6 text-left">
              <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Student ID (NIM)</label>
              <input 
                type="text" 
                value={tempNim}
                onChange={(e) => setTempNim(e.target.value)}
                autoFocus
                placeholder="e.g. 2501928392"
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded-lg p-4 focus:outline-none focus:border-[#007acc] font-mono text-lg"
              />
            </div>

            <button 
              onClick={handleStartChallenge}
              className="w-full bg-[#007acc] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#005f9e] transition-all shadow-lg hover:shadow-[#007acc]/20"
            >
              Start Challenge
            </button>
            <p className="mt-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Workspace will be locked on start</p>
          </div>
        </div>
      )}

      {/* Header / Toolbar */}
      <div className="flex bg-[#252526] border-b border-[#333333] px-4 py-2 items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="text-white text-xs font-mono bg-[#1e1e1e] border border-[#333333] px-3 py-1 rounded">main.py</span>
          </div>
          <div className="h-6 w-[1px] bg-[#333333]"></div>
          {nim && <div className="text-xs text-zinc-500 font-mono">NIM: <span className="text-zinc-300">{nim}</span></div>}
        </div>
        
        <div className="flex items-center gap-3">
          <Timer endTime={effectiveEndTime} onExpire={handleTimeExpire} />
          
          <div className="flex gap-1 bg-[#1e1e1e] p-1 rounded border border-[#333333]">
            {isExecuting ? (
                <button 
                    onClick={handleStopCode}
                    className="bg-red-600/20 text-red-500 px-3 py-1 rounded text-xs font-bold hover:bg-red-600/30 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">stop</span>
                    Stop
                </button>
            ) : (
                <button 
                    onClick={handleRunCode}
                    disabled={isRunningTests || isSubmitting}
                    className="bg-[#333333] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#444444] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    Run
                </button>
            )}
            
            <button 
                onClick={handleRunTests}
                disabled={isRunningTests || isSubmitting || isExecuting}
                className="bg-[#333333] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#444444] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                <span className="material-symbols-outlined text-sm">fact_check</span>
                {isRunningTests ? 'Testing...' : 'Run Tests'}
            </button>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={!allTestsPassed || isSubmitting || isRunningTests || isExecuting}
            className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${allTestsPassed ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20' : 'bg-[#1e1e1e] text-zinc-600 border border-[#333333] cursor-not-allowed'}`}
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
      
      {/* Editor & Results Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative">
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={isRunningTests || isSubmitting || isExecuting}
            className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-6 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
            spellCheck="false"
          />
        </div>

        {/* Bottom Panel */}
        <div className="h-1/3 min-h-[150px] bg-[#1e1e1e] border-t border-[#333333] flex flex-col">
            {/* Tabs */}
            <div className="bg-[#252526] px-2 flex items-center border-b border-[#333333] justify-between">
                <div className="flex">
                    <button 
                        onClick={() => setActiveTab('tests')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tests' ? 'text-[#007acc] border-b-2 border-[#007acc]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Test Cases {(testResults.length > 0) && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
                    </button>
                    <button 
                        onClick={() => setActiveTab('console')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'console' ? 'text-[#007acc] border-b-2 border-[#007acc]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Console {isExecuting && <span className="inline-block w-2 h-2 bg-[#007acc] rounded-full ml-1 animate-pulse"></span>}
                    </button>
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <button 
                        onClick={() => { setTestResults([]); setConsoleOutput(null); }}
                        className="text-zinc-500 hover:text-white"
                        title="Clear all"
                    >
                        <span className="material-symbols-outlined text-sm">block</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {activeTab === 'tests' ? (
                    <div className="p-4">
                        {executionError && (
                            <div className="bg-red-900/20 border border-red-900 text-red-500 p-3 rounded mb-4 font-mono text-xs whitespace-pre-wrap">
                                {executionError}
                            </div>
                        )}
                        
                        {(testResults.length === 0 && !executionError) && (
                            <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm py-8">
                                No test results to show. Click "Run Tests" to begin.
                            </div>
                        )}

                        <div className="grid gap-3">
                            {testResults.map((result, idx) => (
                                <div key={idx} className={`border rounded p-3 ${result.passed ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-white">Test Case #{idx + 1} ({result.type})</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${result.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                            {result.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                    {result.error && (
                                        <div className="text-[11px] font-mono text-red-400 bg-black/40 p-2 rounded mt-2 overflow-x-auto">
                                            {result.error}
                                        </div>
                                    )}
                                    {!result.passed && result.actualOutput && (
                                    <div className="mt-2">
                                        <span className="text-[10px] text-zinc-500 block mb-1">Actual Output:</span>
                                        <div className="text-[11px] font-mono text-zinc-300 bg-black/40 p-2 rounded overflow-x-auto whitespace-pre">
                                            {result.actualOutput}
                                        </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-black/20 h-full font-mono text-sm p-4 text-zinc-300 overflow-y-auto">
                        {!consoleOutput && (
                             <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm py-4">
                                Console is empty. Click "Run" to see output.
                            </div>
                        )}
                        {consoleOutput && (
                            <div className="whitespace-pre-wrap break-all">
                                {consoleOutput.stdout && <div className="text-zinc-100">{consoleOutput.stdout}</div>}
                                {consoleOutput.stderr && <div className="text-red-400 mt-2">{consoleOutput.stderr}</div>}
                                <div ref={consoleEndRef} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
