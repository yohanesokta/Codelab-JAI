'use client';

import { useState, useEffect, useRef } from "react";
import { getGlobalNotification, GlobalNotification } from "@/app/actions/settings";
import { usePathname } from "next/navigation";

export default function NotificationBanner() {
  const [notification, setNotification] = useState<GlobalNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosedManually, setIsClosedManually] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getGlobalNotification();
      if (data && data.enabled) {
        setNotification(data);
        setIsVisible(true);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isVisible && !isClosedManually && !isHovered) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsVisible(false);
            return 0;
          }
          return prev - 1; // 1% every 100ms = 10 seconds
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, isClosedManually, isHovered]);

  // Only show on the main dashboard (/)
  if (pathname !== "/") return null;

  if (!isVisible || !notification || isClosedManually) return null;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-16 right-6 z-[60] animate-in slide-in-from-right-full duration-500"
    >
      <div className="bg-[#252526] border border-blue-500/30 rounded-xl shadow-2xl w-80 overflow-hidden flex flex-col backdrop-blur-md relative">
        {notification.imageUrl && (
          <div className="h-32 w-full overflow-hidden bg-zinc-900">
            <img 
              src={notification.imageUrl} 
              alt="Notification" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}
        
        <div className="p-4 relative">
          <button 
            onClick={() => setIsClosedManually(true)}
            className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-500 text-lg">campaign</span>
            <h4 className="text-white font-bold text-sm tracking-tight">{notification.header}</h4>
          </div>
          
          <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
            {notification.message}
          </p>

          {notification.link && (
            <a 
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              Buka Tautan
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}
          
          <div className="mt-3 pt-3 border-t border-[#333333] flex justify-between items-center">
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              {isHovered ? 'Waktu Dijeda' : 'Informasi Sistem'}
            </span>
            <span className={`w-2 h-2 rounded-full bg-blue-500 ${isHovered ? '' : 'animate-pulse'}`}></span>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-blue-600/20 w-full">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
