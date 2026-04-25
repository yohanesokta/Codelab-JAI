'use client';

import { useState, useEffect } from "react";
import { getGlobalNotification, updateGlobalNotification, GlobalNotification } from "@/app/actions/settings";

export default function NotificationManager() {
  const [data, setData] = useState<GlobalNotification>({
    enabled: false,
    header: "",
    message: "",
    imageUrl: "",
    link: ""
  });
  const [isSaving, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetch() {
      const res = await getGlobalNotification();
      if (res) setData(res);
    }
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await updateGlobalNotification(data);
    if (res.success) {
      setMessage({ type: 'success', text: "Pengaturan notifikasi berhasil disimpan!" });
    } else {
      setMessage({ type: 'error', text: res.error || "Gagal menyimpan pengaturan." });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#2d2d2d] border border-[#333333] rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-[#333333] pb-4">
        <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined">campaign</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Global Broadcast</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Kirim pesan ke seluruh pengguna platform</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-900/20 border border-green-900 text-green-400' : 'bg-red-900/20 border border-red-900 text-red-500'
        }`}>
          <span className="material-symbols-outlined text-sm">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-[#1e1e1e] border border-[#333333] rounded-lg">
          <div>
            <p className="text-white font-bold text-sm">Aktifkan Notifikasi</p>
            <p className="text-zinc-500 text-xs">Pesan akan langsung muncul di pojok kanan atas layar pengguna.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.enabled}
              onChange={(e) => setData({...data, enabled: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Header Pesan</label>
              <input
                type="text"
                value={data.header || ""}
                onChange={(e) => setData({...data, header: e.target.value})}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-blue-600"
                placeholder="Contoh: Pengumuman Maintenance"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">URL Gambar (Opsional)</label>
              <input
                type="text"
                value={data.imageUrl || ""}
                onChange={(e) => setData({...data, imageUrl: e.target.value})}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-blue-600"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Link Tindakan / CTA (Opsional)</label>
              <input
                type="text"
                value={data.link || ""}
                onChange={(e) => setData({...data, link: e.target.value})}
                className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-blue-600"
                placeholder="https://example.com/learn-more"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Isi Pesan</label>
            <textarea
              rows={5}
              value={data.message || ""}
              onChange={(e) => setData({...data, message: e.target.value})}
              className="w-full bg-[#1e1e1e] border border-[#333333] text-white rounded p-3 text-sm focus:outline-none focus:border-blue-600 resize-none"
              placeholder="Tulis pesan lengkap Anda di sini..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#333333] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {isSaving ? 'Menyimpan...' : 'Update Notifikasi'}
          </button>
        </div>
      </form>
    </div>
  );
}
