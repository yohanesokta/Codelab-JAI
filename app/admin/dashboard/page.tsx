import { getProblems } from "@/app/actions/problem";
import { getSubmissions } from "@/app/actions/submission";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  
  if (!auth) {
    redirect('/admin');
  }

  const [problems, submissions] = await Promise.all([
    getProblems(),
    getSubmissions()
  ]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-zinc-500">Manage problems and monitor submissions.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-[#2d2d2d] text-white rounded border border-[#333333] hover:bg-[#3d3d3d]">
              View Site
            </Link>
            <Link href="/admin/problem/new" className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005f9e]">
              + New Problem
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problems List */}
          <div className="bg-[#252526] border border-[#333333] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Problems List</h2>
            <div className="space-y-4">
              {problems.length === 0 ? (
                <p className="text-zinc-500">No problems created yet.</p>
              ) : (
                problems.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-[#1e1e1e] border border-[#333333] rounded">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white font-bold">{p.title}</h3>
                      <div className="flex gap-4 text-[10px] uppercase font-bold text-zinc-500">
                        <span>ID: {p.id}</span>
                        {p.startTime && <span>Start: {new Date(p.startTime).toLocaleString()}</span>}
                        {p.endTime && <span>End: {new Date(p.endTime).toLocaleString()}</span>}
                        {p.duration && <span>Duration: {p.duration}m</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submissions List */}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-zinc-500">No submissions yet.</td>
                    </tr>
                  ) : (
                    submissions.map(s => (
                      <tr key={s.id} className="text-zinc-300">
                        <td className="py-3 font-mono text-sm">{s.nim}</td>
                        <td className="py-3">{s.problemTitle || s.problemId}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${s.status === 'pass' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-500'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-zinc-500">
                          {new Date(s.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
