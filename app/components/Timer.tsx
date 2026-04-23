'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  endTime?: Date | null;
  onExpire?: () => void;
}

export default function Timer({ endTime, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) return;

    const target = new Date(endTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (!endTime) return null;

  return (
    <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333333] px-3 py-1 rounded text-[#007acc] font-mono text-lg font-bold">
      <span className="material-symbols-outlined text-sm">schedule</span>
      {timeLeft}
    </div>
  );
}
