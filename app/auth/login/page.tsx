'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#252526] border border-[#333333] p-8 rounded-lg max-w-sm w-full shadow-2xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4">
          <span className="text-2xl font-bold text-white tracking-tighter">CodeLab JAI</span>
        </Link>
        <h1 className="text-xl font-bold text-white">Selamat Datang Kembali</h1>
        <p className="text-zinc-400 text-sm mt-1">Masuk untuk melihat profil dan riwayat Anda.</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-500 p-3 rounded mb-4 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc] transition-colors"
            placeholder="nama@email.com"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Kata Sandi</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc] transition-colors"
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#007acc] text-white py-3 rounded font-bold hover:bg-[#005f9e] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-[#333333]"></div>
        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Atau</span>
        <div className="flex-1 h-[1px] bg-[#333333]"></div>
      </div>

      <button 
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full mt-6 bg-[#333333] text-white py-3 rounded font-bold hover:bg-[#444444] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Masuk dengan Google
      </button>

      <p className="mt-8 text-center text-zinc-500 text-xs">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="text-[#007acc] hover:underline font-bold">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500">Loading auth...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

