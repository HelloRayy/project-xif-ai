import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';

export default function TeacherKpiCards({
  totalClassStudents,
  totalClassSakit,
  totalClassIzin,
  totalClassDisp,
  totalNeedAttention
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <Card className="p-3.5 bg-card border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Siswa Binaan</span>
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
          {totalClassStudents} <span className="text-xs font-normal text-slate-500">Siswa</span>
        </p>
      </Card>

      <Card className="p-3.5 bg-card border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Sakit (S)</span>
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        </div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
          {totalClassSakit} <span className="text-xs font-normal text-slate-500">Hari</span>
        </p>
      </Card>

      <Card className="p-3.5 bg-card border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Izin (I)</span>
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        </div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
          {totalClassIzin} <span className="text-xs font-normal text-slate-500">Hari</span>
        </p>
      </Card>

      <Card className="p-3.5 bg-card border border-border shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Dispensasi (D)</span>
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        </div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
          {totalClassDisp} <span className="text-xs font-normal text-slate-500">Hari</span>
        </p>
      </Card>

      <Card className="p-3.5 bg-card border border-border shadow-xs col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Perlu Perhatian</span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
          {totalNeedAttention} <span className="text-xs font-normal text-slate-500">Siswa (≥2 Hari)</span>
        </p>
      </Card>
    </div>
  );
}
