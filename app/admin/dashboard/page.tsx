import { getAllProblemsAdmin } from "@/app/actions/problem";
import { redirect } from "next/navigation";
import ProblemsList from "./ProblemsList";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth as getAuth } from "@/auth";
import { isAuthEnabled } from "@/lib/config";

export const dynamic = 'force-dynamic';


export default async function AdminDashboard() {
  const authEnabled = isAuthEnabled();
  
  if (authEnabled) {
    const session = await getAuth();
    if (!session || (session.user as any).role !== 'admin') {
      redirect('/admin');
    }
  } else {
    const cookieStore = await cookies();
    const legacyAuth = cookieStore.get('admin_auth');
    if (!legacyAuth) {
      redirect('/admin');
    }
  }


  const problems = await getAllProblemsAdmin();

  return (
    <div className="min-h-screen bg-[#1e1e1e] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dasbor Administrator</h1>
            <p className="text-zinc-500">Kelola soal dan pantau tantangan yang sedang berjalan.</p>
          </div>
          <div className="flex gap-4">
            {authEnabled && (
              <Link href="/admin/requests" className="px-4 py-2 bg-amber-600/20 text-amber-500 rounded border border-amber-600/30 hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">group_add</span>
                Permintaan Moderator
              </Link>
            )}
            <Link href="/" className="px-4 py-2 bg-[#2d2d2d] text-white rounded border border-[#333333] hover:bg-[#3d3d3d]">
              Lihat Situs
            </Link>

            <Link href="/admin/problem/new" className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005f9e]">
              + Soal Baru
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <ProblemsList problems={problems as any} />
        </div>
      </div>
    </div>
  );
}
