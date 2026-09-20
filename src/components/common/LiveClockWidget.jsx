import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LiveClockWidget({ className }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted/50 dark:bg-zinc-900/60", className)}>
      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[11px] font-medium text-muted-foreground leading-none">
          {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
        <span className="font-sans text-xs sm:text-sm font-bold text-foreground leading-tight mt-0.5 tracking-tight">
          {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
        </span>
      </div>
    </div>
  );
}
