'use client';

import { useState } from "react";
import { createProblem } from "@/app/actions/problem";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TestCase {
  type: 'standard' | 'script';
  input?: string;
  expectedOutput?: string;
  testScript?: string;
}

export default function NewProblem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [timingMode, setTimingMode] = useState<'scheduled' | 'manual'>('scheduled');
  const [isPublic, setIsPublic] = useState(true);
  const [testCases, setTestCases] = useState<TestCase[]>([{ type: 'standard', input: "", expectedOutput: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddTestCase = () => {
    setTestCases([...testCases, { type: 'standard', input: "", expectedOutput: "" }]);
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...testCases];
    (newTestCases[index] as any)[field] = value;
    setTestCases(newTestCases);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await createProblem({ 
        title, 
        description, 
        startTime: timingMode === 'scheduled' ? (startTime || null) : null,
        endTime: timingMode === 'scheduled' ? (endTime || null) : null,
        duration: duration ? parseInt(duration) : null,
        timingMode,
        isPublic,
        testCases 
      });
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        alert("Failed to create problem: " + res.error);
      }
    } catch (e) {
      alert("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Problem</h1>
            <Link href="/admin/dashboard" className="text-[#007acc] hover:underline">&larr; Back to Dashboard</Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#252526] border border-[#333333] rounded-lg p-6 space-y-8 shadow-xl">
          {/* Basic Info */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-[#333333] pb-2">Problem Info</h2>
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
                placeholder="e.g. Array Manipulation"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Description / Instructions (Markdown)</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
                placeholder="Describe the problem..."
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-[#333333] pb-2">Timing & Scheduling</h2>
            
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setTimingMode('scheduled')}
                className={`flex-1 py-3 px-4 rounded border text-sm font-bold transition-all ${timingMode === 'scheduled' ? 'bg-[#007acc]/20 border-[#007acc] text-[#007acc]' : 'bg-[#252526] border-[#333333] text-zinc-500'}`}
              >
                Scheduled (Date & Time)
              </button>
              <button
                type="button"
                onClick={() => setTimingMode('manual')}
                className={`flex-1 py-3 px-4 rounded border text-sm font-bold transition-all ${timingMode === 'manual' ? 'bg-purple-900/20 border-purple-600 text-purple-400' : 'bg-[#252526] border-[#333333] text-zinc-500'}`}
              >
                Manual Start (Admin Control)
              </button>
            </div>

            {timingMode === 'scheduled' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Duration (Optional Minutes)</label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
                    placeholder="e.g. 60"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-4 mb-6">
                  <span className="material-symbols-outlined text-purple-400">info</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In <strong>Manual Mode</strong>, guests can open the problem and write code immediately, but they can only "Run" their code. 
                    The "Run Tests" and "Submit" buttons will be disabled until you click <strong>"Start Challenge"</strong> from the Admin Dashboard. 
                    The countdown will begin for everyone at that moment.
                  </p>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Challenge Duration (Minutes)</label>
                  <input 
                    required
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#252526] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-purple-600"
                    placeholder="e.g. 60"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Visibility Info */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-[#333333] pb-2">Visibility</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-3 px-4 rounded border text-sm font-bold transition-all ${isPublic ? 'bg-[#007acc]/20 border-[#007acc] text-[#007acc]' : 'bg-[#252526] border-[#333333] text-zinc-500'}`}
              >
                Public (Visible on Home)
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-3 px-4 rounded border text-sm font-bold transition-all ${!isPublic ? 'bg-orange-900/20 border-orange-600 text-orange-400' : 'bg-[#252526] border-[#333333] text-zinc-500'}`}
              >
                Private (URL Only)
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 italic">Private challenges will not appear in the public list but can still be accessed via their specific ID link.</p>
          </section>

          {/* Test Cases */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#333333] pb-2">
              <h2 className="text-xl font-bold text-white">Test Cases</h2>
              <button 
                type="button"
                onClick={handleAddTestCase}
                className="bg-[#007acc] hover:bg-[#005f9e] text-white text-xs font-bold px-4 py-2 rounded transition-colors"
              >
                + Add Test Case
              </button>
            </div>
            
            <div className="space-y-6">
              {testCases.map((tc, index) => (
                <div key={index} className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 relative shadow-inner">
                  <div className="absolute top-4 right-4">
                    {testCases.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveTestCase(index)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Validation Type</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleTestCaseChange(index, 'type', 'standard')}
                        className={`flex-1 py-3 px-4 rounded border text-sm font-bold transition-all ${tc.type === 'standard' ? 'bg-[#007acc]/20 border-[#007acc] text-[#007acc]' : 'bg-[#252526] border-[#333333] text-zinc-500'}`}
                      >
                        Input / Output
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestCaseChange(index, 'type', 'script')}
                        className={`flex-1 py-3 px-4 rounded border text-sm font-bold transition-all ${tc.type === 'script' ? 'bg-purple-900/20 border-purple-600 text-purple-400' : 'bg-[#252526] border-[#333333] text-zinc-500'}`}
                      >
                        Custom Script (Unit Test)
                      </button>
                    </div>
                  </div>

                  {tc.type === 'standard' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Stdin Input</label>
                        <textarea 
                          required
                          value={tc.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          rows={4}
                          className="w-full bg-[#252526] border border-[#333333] text-white rounded p-3 text-sm font-mono focus:outline-none focus:border-[#007acc]"
                          placeholder="What the program reads..."
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Expected Stdout</label>
                        <textarea 
                          required
                          value={tc.expectedOutput}
                          onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                          rows={4}
                          className="w-full bg-[#252526] border border-[#333333] text-white rounded p-3 text-sm font-mono focus:outline-none focus:border-[#007acc]"
                          placeholder="What the program should print..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-2">Test Script (Python)</label>
                      <p className="text-[10px] text-zinc-600 mb-3 italic">This code will be appended to the student's code. Use `assert` statements to validate.</p>
                      <textarea 
                        required
                        value={tc.testScript}
                        onChange={(e) => handleTestCaseChange(index, 'testScript', e.target.value)}
                        rows={8}
                        className="w-full bg-[#252526] border border-[#333333] text-purple-200 rounded p-4 text-sm font-mono focus:outline-none focus:border-purple-600"
                        placeholder="sol = Solution()\nassert sol.add(2, 3) == 5\nprint('Test Passed')"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="pt-8 border-t border-[#333333] flex justify-end gap-4">
            <Link href="/admin/dashboard" className="px-6 py-3 text-zinc-500 hover:text-white transition-colors">Cancel</Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#007acc] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#005f9e] transition-all disabled:opacity-50 shadow-lg shadow-[#007acc]/20"
            >
              {isSubmitting ? 'Creating Challenge...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
