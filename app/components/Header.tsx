import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex justify-between items-center h-12 w-full px-4 sticky top-0 z-50 bg-zinc-900 border-b border-[#333333]">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-white tracking-tighter">CodeLab</span>
        <nav className="hidden md:flex items-center h-12 gap-4">
          <Link className="text-white border-b-2 border-[#007acc] h-full flex items-center px-1" href="/">
            Dashboard
          </Link>
          <Link className="text-zinc-400 hover:text-zinc-200 transition-colors h-full flex items-center px-1" href="/admin">
            Admin Panel
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-[#333333] bg-zinc-800 flex items-center justify-center text-xs text-white">
          S
        </div>
      </div>
    </header>
  );
}
