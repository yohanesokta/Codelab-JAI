'use client';

import { useState } from "react";
import { submitCode } from "@/app/actions/submission";
import { useRouter } from "next/navigation";

export default function EditorClient({ problemId }: { problemId: number }) {
  const [code, setCode] = useState("def solve():\n    # Write your python code here\n    pass\n");
  const [nim, setNim] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean; status?: string; error?: string} | null>(null);
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      
      // Move cursor after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleSubmit = async () => {
    if (!nim) {
      alert("Please enter your NIM");
      return;
    }
    
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const res = await submitCode({ nim, problemId, code });
      setResult(res);
      if (res.success) {
        setTimeout(() => {
           setShowModal(false);
           router.push('/');
        }, 3000);
      }
    } catch (e) {
      setResult({ success: false, error: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex bg-[#252526] border-b border-[#333333] px-4 py-2 items-center justify-between">
        <div className="flex gap-2">
          <span className="text-white text-sm font-mono bg-[#1e1e1e] border border-[#333333] px-3 py-1 rounded">main.py</span>
        </div>
        <div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#007acc] text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-[#005f9e] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            Submit Code
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
          spellCheck="false"
        />
      </div>

      {/* NIM Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#252526] border border-[#333333] rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Submit Solution</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-zinc-400 text-sm mb-2">Student ID (NIM)</label>
              <input 
                type="text" 
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                autoFocus
                placeholder="e.g. 2501928392"
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc] font-mono"
              />
            </div>

            {result && (
              <div className={`p-3 rounded mb-4 text-sm font-bold ${result.success ? (result.status === 'pass' ? 'bg-green-900/40 text-green-400 border border-green-900' : 'bg-red-900/40 text-red-500 border border-red-900') : 'bg-red-900/40 text-red-500 border border-red-900'}`}>
                {result.success ? `Execution Completed: ${result.status?.toUpperCase()}` : `Error: ${result.error}`}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !nim}
                className="bg-[#007acc] text-white px-6 py-2 rounded font-semibold hover:bg-[#005f9e] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Running Tests...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
