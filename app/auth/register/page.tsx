'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nim: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setLoading(true);

    const fData = new FormData();
    fData.append("name", formData.name);
    fData.append("email", formData.email);
    fData.append("password", formData.password);
    fData.append("nim", formData.nim);

    try {
      const res = await registerUser(fData);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#333333] p-8 rounded-lg max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-white tracking-tighter">CodeLab JAI</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Buat Akun Baru</h1>
          <p className="text-zinc-400 text-sm mt-1">Daftar untuk mulai menyimpan kemajuan pengerjaan soal Anda.</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 p-3 rounded mb-4 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Nama Lengkap</label>
              <input 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc]"
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">NIM</label>
              <input 
                name="nim"
                required
                value={formData.nim}
                onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc]"
                placeholder="Contoh: 2501..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Email</label>
            <input 
              name="email"
              type="email" 
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc]"
              placeholder="nama@email.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Kata Sandi</label>
              <input 
                name="password"
                type="password" 
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Konfirmasi</label>
              <input 
                name="confirmPassword"
                type="password" 
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-[#007acc]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#007acc] text-white py-3 rounded font-bold hover:bg-[#005f9e] transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-xs">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-[#007acc] hover:underline font-bold">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
