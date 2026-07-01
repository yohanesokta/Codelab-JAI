'use client';

import { useState, useEffect } from "react";
import { getProblemById } from "@/app/actions/problem";
import { getSubmissions, getSubmissionsForExport } from "@/app/actions/submission";
import { useParams } from "next/navigation";
import Link from "next/link";
import SubmissionsList from "../../../dashboard/SubmissionsList";

export default function ProblemResults() {
  const params = useParams();
  const id = params.id as string;

  const [problem, setProblem] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [problemData, submissionData] = await Promise.all([
        getProblemById(id),
        getSubmissions(id)
      ]);
      
      setProblem(problemData);
      setSubmissions(submissionData);
      setIsLoading(false);
    }
    fetchData();
  }, [id]);

  const handleShare = () => {
    const url = `${window.location.origin}/problem/${id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportMarkdown = async () => {
    try {
      setIsExporting(true);
      const submissionsData = await getSubmissionsForExport(id);
      
      if (!submissionsData || submissionsData.length === 0) {
        alert('Tidak ada riwayat pengerjaan untuk soal ini.');
        return;
      }

      // Group submissions by NIM
      const submissionsByNim: { [nim: string]: typeof submissionsData } = {};
      submissionsData.forEach(sub => {
        if (!submissionsByNim[sub.nim]) {
          submissionsByNim[sub.nim] = [];
        }
        submissionsByNim[sub.nim].push(sub);
      });

      // Generate Markdown content
      let md = `# Laporan Hasil Pengerjaan Soal: ${problem.title}\n\n`;
      md += `- **ID Soal**: \`${problem.id}\`\n`;
      md += `- **Tipe Solusi**: \`${problem.solutionType}\`\n`;
      md += `- **Waktu Ekspor**: ${new Date().toLocaleString('id-ID')}\n\n`;
      md += `## Ringkasan Hasil Pengerjaan Mahasiswa\n\n`;
      md += `| NIM | Nama | Email | Status Akhir | Total Percobaan | Percobaan Terakhir |\n`;
      md += `| :--- | :--- | :--- | :--- | :---: | :--- |\n`;

      let detailedHistory = `## Detail Riwayat Kode per Mahasiswa\n\n`;

      Object.entries(submissionsByNim).forEach(([nim, subs]) => {
        // Sort submissions by createdAt ascending for chronological history
        const sortedSubs = [...subs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const latestSub = sortedSubs[sortedSubs.length - 1];
        const hasPassed = sortedSubs.some(s => s.status === 'pass');
        const finalStatus = hasPassed ? 'PASS' : 'FAIL';
        const studentName = latestSub.userName || '-';
        const studentEmail = latestSub.userEmail || '-';
        const totalAttempts = sortedSubs.length;
        const lastAttemptTime = new Date(latestSub.createdAt).toLocaleString('id-ID');

        md += `| \`${nim}\` | ${studentName} | ${studentEmail} | **${finalStatus}** | ${totalAttempts} | ${lastAttemptTime} |\n`;

        // Detailed History
        detailedHistory += `### ${studentName} (NIM: \`${nim}\`)\n`;
        detailedHistory += `- **Email**: ${studentEmail}\n`;
        detailedHistory += `- **Status Akhir**: **${finalStatus}**\n`;
        detailedHistory += `- **Total Percobaan**: ${totalAttempts}\n\n`;

        sortedSubs.forEach((sub, index) => {
          const subTime = new Date(sub.createdAt).toLocaleString('id-ID');
          detailedHistory += `#### Percobaan #${index + 1} (${sub.status.toUpperCase()} - ${subTime})\n`;
          detailedHistory += `\`\`\`python\n${sub.code}\n\`\`\`\n\n`;
        });
        
        detailedHistory += `---\n\n`;
      });

      md += `\n` + detailedHistory;

      // Create file and download
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Clean filename
      const safeTitle = problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      link.href = url;
      link.setAttribute('download', `hasil_soal_${safeTitle}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Gagal mengekspor hasil:', error);
      alert('Gagal mengekspor hasil pengerjaan.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center text-white">Loading results...</div>;
  }

  if (!problem) {
    return <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center text-white">Problem not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Results: {problem.title}</h1>
            <div className="flex gap-4 items-center">
                <Link href="/admin/dashboard" className="text-[#007acc] hover:underline text-sm">&larr; Back to Dashboard</Link>
                <span className="text-zinc-600 text-xs">|</span>
                <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Problem ID: {problem.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
               onClick={handleShare}
               className={`flex items-center gap-2 px-4 py-2 rounded border border-[#333333] transition-all font-bold text-xs uppercase tracking-widest ${isCopied ? 'bg-green-600 text-white border-green-500' : 'bg-[#252526] text-zinc-400 hover:text-white hover:border-zinc-500'}`}
            >
                <span className="material-symbols-outlined text-sm">{isCopied ? 'check_circle' : 'share'}</span>
                {isCopied ? 'Link Disalin!' : 'Bagikan Soal'}
            </button>
            <button
               onClick={handleExportMarkdown}
               disabled={isExporting}
               className="flex items-center gap-2 px-4 py-2 rounded border border-[#333333] bg-[#252526] text-zinc-400 hover:text-white hover:border-zinc-500 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            >
                <span className={`material-symbols-outlined text-sm ${isExporting ? 'animate-spin' : ''}`}>
                  {isExporting ? 'sync' : 'download'}
                </span>
                {isExporting ? 'Mengekspor...' : 'Ekspor Hasil (MD)'}
            </button>
            <div className="flex bg-[#252526] border border-[#333333] rounded px-4 py-2 gap-6 h-full">
                  <div className="text-center">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Pass</p>
                      <p className="text-green-500 font-bold">{submissions.filter(s => s.status === 'pass').length}</p>
                  </div>
                  <div className="text-center">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Fail</p>
                      <p className="text-red-500 font-bold">{submissions.filter(s => s.status === 'fail').length}</p>
                  </div>
                  <div className="text-center border-l border-[#333333] pl-6">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Total</p>
                      <p className="text-white font-bold">{submissions.length}</p>
                  </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
            <SubmissionsList submissions={submissions} />
        </div>
      </div>
    </div>
  );
}
