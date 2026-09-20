import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  switch (status) {
    case 'MENUNGGU_VERIFIKASI':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 text-white shadow-2xs", className)}>
          <Clock className="w-3.5 h-3.5" />
          <span>Menunggu Verifikasi</span>
        </span>
      );
    case 'DIPROSES_TU':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 text-white shadow-2xs", className)}>
          <Clock className="w-3.5 h-3.5" />
          <span>Diproses TU</span>
        </span>
      );
    case 'DISETUJUI':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-2xs", className)}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Disetujui</span>
        </span>
      );
    case 'DITOLAK':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-600 text-white shadow-2xs", className)}>
          <XCircle className="w-3.5 h-3.5" />
          <span>Ditolak</span>
        </span>
      );
    case 'DIBATALKAN':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700", className)}>
          <Ban className="w-3.5 h-3.5" />
          <span>Dibatalkan</span>
        </span>
      );
    default:
      return null;
  }
}

export default StatusBadge;
