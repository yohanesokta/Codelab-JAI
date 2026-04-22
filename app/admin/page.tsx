'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded logic for minimal viable implementation
    if (username === "admin" && password === "admin") {
      // Setup simple cookie or localStorage based session if needed, but for simplicity we rely on routing
      document.cookie = "admin_auth=true; path=/";
      router.push("/admin/dashboard");
    } else {
      alert("Invalid credentials. Try admin / admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#333333] p-8 rounded-lg max-w-sm w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#007acc] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-zinc-400 text-sm">Please sign in to manage challenges.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 focus:outline-none focus:border-[#007acc]"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#007acc] text-white py-3 rounded font-semibold hover:bg-[#005f9e] transition-colors mt-6 block text-center"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
