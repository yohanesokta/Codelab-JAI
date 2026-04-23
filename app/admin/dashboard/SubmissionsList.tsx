'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface Submission {
    id: number;
    nim: string;
    code: string;
    status: string;
    createdAt: Date;
    problemId: number;
    problemTitle: string | null;
}

interface SubmissionsListProps {
    submissions: Submission[];
}

export default function SubmissionsList({ submissions }: SubmissionsListProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    return (
        <div className="bg-[#252526] border border-[#333333] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#333333] text-zinc-500 text-sm">
                            <th className="pb-3 font-semibold">NIM</th>
                            <th className="pb-3 font-semibold">Problem</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold">Time</th>
                            <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]">
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-zinc-500">No submissions yet.</td>
                            </tr>
                        ) : (
                            submissions.map(s => (
                                <tr key={s.id} className="text-zinc-300 hover:bg-[#2d2d2d] transition-colors group">
                                    <td className="py-3 font-mono text-sm">{s.nim}</td>
                                    <td className="py-3">{s.problemTitle || `Problem ${s.problemId}`}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${s.status === 'pass' ? 'bg-green-900/40 text-green-400 border border-green-900/50' : 'bg-red-900/40 text-red-500 border border-red-900/50'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-xs text-zinc-500">
                                        {new Date(s.createdAt).toLocaleString()}
                                    </td>
                                    <td className="py-3 text-right">
                                        <button 
                                            onClick={() => setSelectedSubmission(s)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-[#007acc] hover:text-[#005f9e] transition-colors"
                                        >
                                            View Code
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Code Viewer Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="bg-[#252526] px-6 py-4 border-b border-[#333333] flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Submission Details</h3>
                                <div className="flex gap-4 text-xs text-zinc-500 mt-1">
                                    <span>NIM: <span className="text-zinc-300">{selectedSubmission.nim}</span></span>
                                    <span>Problem: <span className="text-zinc-300">{selectedSubmission.problemTitle}</span></span>
                                    <span>Status: <span className={selectedSubmission.status === 'pass' ? 'text-green-400' : 'text-red-400'}>{selectedSubmission.status.toUpperCase()}</span></span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedSubmission(null)}
                                className="bg-[#333333] text-white p-2 rounded-full hover:bg-[#444444] transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                theme="vs-dark"
                                value={selectedSubmission.code}
                                options={{
                                    readOnly: true,
                                    fontSize: 14,
                                    minimap: { enabled: true },
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16 },
                                    fontFamily: "'Fira Code', 'Courier New', monospace",
                                }}
                            />
                        </div>
                        <div className="bg-[#252526] px-6 py-3 border-t border-[#333333] text-right">
                             <button 
                                onClick={() => setSelectedSubmission(null)}
                                className="px-6 py-2 bg-[#007acc] text-white rounded font-bold hover:bg-[#005f9e]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
