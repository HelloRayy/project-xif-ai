import React from 'react';
import { FileText, Clock, CheckCircle2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminKpiCards({
  totalIzinMasuk,
  waitingTeacherCount,
  approvedTotal,
  totalStudents
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Laporan Masuk</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{totalIzinMasuk}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Laporan izin siswa kelas XI-A s/d XI-F</p>
      </Card>

      <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Menunggu Verifikasi Wali</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{waitingTeacherCount}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Antrean verifikasi oleh Wali Kelas</p>
      </Card>

      <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Izin Terverifikasi</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{approvedTotal}</p>
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Telah disetujui Wali Kelas</p>
      </Card>

      <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Siswa Binaan</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{totalStudents}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Siswa terdaftar kelas XI-A s/d XI-F</p>
      </Card>
    </div>
  );
}
