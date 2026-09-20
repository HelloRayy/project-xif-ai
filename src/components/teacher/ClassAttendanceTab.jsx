import React from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';
import TeacherKpiCards from './TeacherKpiCards';

export default function ClassAttendanceTab({
  teacherClass,
  selectedClass,
  setSelectedClass,
  students,
  filteredStudents,
  studentSearch,
  setStudentSearch,
  statusFilter,
  setStatusFilter,
  totalClassStudents,
  totalClassSakit,
  totalClassIzin,
  totalClassDisp,
  totalNeedAttention,
  onShowPrintModal,
  onExportExcel,
  onSelectStudentDetail
}) {
  return (
    <div className="space-y-6">
      {/* Header Title & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Daftar Siswa Binaan & Rekap Presensi
          </h1>
          <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
            Monitoring kehadiran, akumulasi izin, dan riwayat presensi siswa kelas <span className="font-semibold text-foreground">{teacherClass}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowPrintModal}
            className="gap-2 text-xs font-medium h-9 border-blue-300 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Cetak Rekap Presensi (PDF)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="gap-2 text-xs font-medium h-9 border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Excel (.xlsx)</span>
          </Button>
        </div>
      </div>

      {/* 1. KPI Summary Cards */}
      <TeacherKpiCards
        totalClassStudents={totalClassStudents}
        totalClassSakit={totalClassSakit}
        totalClassIzin={totalClassIzin}
        totalClassDisp={totalClassDisp}
        totalNeedAttention={totalNeedAttention}
      />

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Cari nama siswa..."
            className="pl-9 h-9 text-xs bg-background border-slate-300 dark:border-zinc-700"
          />
        </div>

        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="h-9 w-[130px] text-xs font-medium">
            <SelectValue placeholder="Pilih Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XI-A">Kelas XI-A</SelectItem>
            <SelectItem value="XI-B">Kelas XI-B</SelectItem>
            <SelectItem value="XI-C">Kelas XI-C</SelectItem>
            <SelectItem value="XI-D">Kelas XI-D</SelectItem>
            <SelectItem value="XI-E">Kelas XI-E</SelectItem>
            <SelectItem value="XI-F">Kelas XI-F</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
            className={cn("h-8 text-xs font-medium px-3 rounded-lg", statusFilter === 'ALL' && "bg-blue-600 hover:bg-blue-700 text-white")}
          >
            Semua Siswa ({students.length})
          </Button>
          <Button
            variant={statusFilter === 'HADIR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('HADIR')}
            className={cn("h-8 text-xs font-medium px-3 rounded-lg", statusFilter === 'HADIR' && "bg-blue-600 hover:bg-blue-700 text-white")}
          >
            Hadir Normal
          </Button>
          <Button
            variant={statusFilter === 'IZIN' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('IZIN')}
            className={cn("h-8 text-xs font-medium px-3 rounded-lg", statusFilter === 'IZIN' && "bg-blue-600 hover:bg-blue-700 text-white")}
          >
            Sedang Izin / Dispensasi
          </Button>
        </div>
      </div>

      {/* 3. Comprehensive Attendance & Student Table */}
      <Card className="border border-border shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">No</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nama Siswa</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Status Hari Ini</TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <span title="Sakit">S</span>
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <span title="Izin Keperluan">I</span>
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <span title="Dispensasi">D</span>
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <span title="Tanpa Keterangan / Alfa">A</span>
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-700 dark:text-zinc-300 pr-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ditemukan data siswa dengan kriteria pencarian tersebut.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((st, idx) => (
                  <TableRow key={st.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-xs font-medium text-slate-500">
                      {idx + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-zinc-100">{st.name}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {st.currentStatus === 'HADIR' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-600 text-white shadow-2xs">
                          Hadir
                        </span>
                      )}
                      {st.currentStatus === 'IZIN_SAKIT' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-600 text-white shadow-2xs">
                          Izin Sakit
                        </span>
                      )}
                      {st.currentStatus === 'DISPENSASI' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-600 text-white shadow-2xs">
                          Dispensasi
                        </span>
                      )}
                      {st.currentStatus === 'IZIN_KEPERLUAN' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-600 text-white shadow-2xs">
                          Izin Keperluan
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center text-xs font-medium text-slate-800 dark:text-zinc-200">
                      {st.sakitDays > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md font-semibold text-xs inline-block">
                          {st.sakitDays}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-medium text-slate-800 dark:text-zinc-200">
                      {st.izinDays > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md font-semibold text-xs inline-block">
                          {st.izinDays}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-medium text-slate-800 dark:text-zinc-200">
                      {st.dispDays > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md font-semibold text-xs inline-block">
                          {st.dispDays}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-normal text-slate-400">
                      0
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectStudentDetail(st)}
                        className="h-8 px-2.5 text-xs font-medium rounded-lg gap-1 border-slate-300 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-600"
                      >
                        <span>Riwayat Izin</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Touch-Friendly Card View */}
        <div className="md:hidden divide-y divide-border p-3 space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Tidak ditemukan data siswa yang sesuai pencarian.
            </div>
          ) : (
            filteredStudents.map((st) => (
              <div key={st.id} className="p-3.5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">{st.name}</h4>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {st.currentStatus === 'HADIR' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-600 text-white shadow-2xs">
                        Hadir
                      </span>
                    )}
                    {st.currentStatus === 'IZIN_SAKIT' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 text-white shadow-2xs">
                        Izin Sakit
                      </span>
                    )}
                    {st.currentStatus === 'DISPENSASI' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-600 text-white shadow-2xs">
                        Dispensasi
                      </span>
                    )}
                    {st.currentStatus === 'IZIN_KEPERLUAN' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-600 text-white shadow-2xs">
                        Izin Keperluan
                      </span>
                    )}
                  </div>
                </div>

                {/* S / I / D / A Mini Grid */}
                <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-border bg-muted/20 p-2 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Sakit</span>
                    <strong className="text-rose-600 font-semibold text-xs">{st.sakitDays}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Izin</span>
                    <strong className="text-amber-600 font-semibold text-xs">{st.izinDays}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Dispen</span>
                    <strong className="text-blue-600 font-semibold text-xs">{st.dispDays}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Alfa</span>
                    <strong className="text-slate-500 font-semibold text-xs">{st.alfaDays}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectStudentDetail(st)}
                    className="h-8 px-3 text-xs font-medium rounded-lg border-border"
                  >
                    <span>Riwayat Izin</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
