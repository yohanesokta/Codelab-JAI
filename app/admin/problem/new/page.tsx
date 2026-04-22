'use client';

import { useState } from "react";
import { createProblem } from "@/app/actions/problem";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProblem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await createProblem({ title, description, testCases });
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

        <form onSubmit={handleSubmit} className="bg-[#252526] border border-[#333333] rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-white font-bold mb-2">Problem Title</label>
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
            <label className="block text-white font-bold mb-2">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
              placeholder="Describe the problem, input format, output format..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-white font-bold">Test Cases</label>
              <button 
                type="button"
                onClick={handleAddTestCase}
                className="text-sm bg-[#333333] hover:bg-[#444444] text-white px-3 py-1 rounded"
              >
                + Add Test Case
              </button>
            </div>
            
            <div className="space-y-4">
              {testCases.map((tc, index) => (
                <div key={index} className="bg-[#1e1e1e] border border-[#333333] rounded p-4 relative">
                  <div className="absolute top-2 right-2 flex items-center">
                    {testCases.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveTestCase(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Input</label>
                      <textarea 
                        required
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        rows={3}
                        className="w-full bg-[#252526] border border-[#333333] text-white rounded p-2 text-sm font-mono focus:outline-none focus:border-[#007acc]"
                        placeholder="e.g. 5\n1 2 3 4 5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Expected Output</label>
                      <textarea 
                        required
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        rows={3}
                        className="w-full bg-[#252526] border border-[#333333] text-white rounded p-2 text-sm font-mono focus:outline-none focus:border-[#007acc]"
                        placeholder="e.g. 15"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#333333] flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#007acc] text-white px-6 py-2 rounded font-semibold hover:bg-[#005f9e] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
