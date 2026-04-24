'use client';

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="bg-[#252526] border border-[#333333] p-8 rounded-lg max-w-sm w-full text-center shadow-2xl">
      <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Autentikasi Gagal</h1>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
        {error === "Configuration" && "Terjadi kesalahan pada konfigurasi server."}
        {error === "AccessDenied" && "Akses ditolak oleh penyedia layanan."}
        {error === "Verification" && "Token verifikasi telah kedaluwarsa atau sudah digunakan."}
        {!error && "Terjadi kesalahan saat mencoba masuk ke akun Anda."}
      </p>
      <Link 
        href="/auth/login"
        className="block w-full bg-[#007acc] text-white py-3 rounded font-bold hover:bg-[#005f9e] transition-all"
      >
        Coba Lagi
      </Link>
      <Link href="/" className="block mt-4 text-xs text-zinc-500 hover:text-zinc-300">Kembali ke Beranda</Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
         <ErrorContent />
      </Suspense>
    </div>
  );
}
