import React from 'react';
import { LayoutDashboard, Search, FileText, Calendar, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function RequestMonitoringTab({
  requests,
  filteredRequests,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  classFilter,
  setClassFilter,
  statusFilter,
  setStatusFilter,
  waitingTeacherCount,
  approvedTotal,
  rejectedTotal,
  onOpenDetailModal
}) {
  return (
    <Card className="rounded-2xl border-border shadow-xs overflow-hidden bg-card">
      {/* Header Toolbar & Search Filter */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Monitoring Laporan Perizinan Siswa Terpadu</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar seluruh laporan izin, dispensasi, dan ketidakhadiran siswa dari kelas XI-A s/d XI-F.
            </p>
          </div>

          {/* Search, Date Filter & Class Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari nama siswa / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-background rounded-xl border-border w-full"
              />
            </div>

            {/* Date Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Select value={dateFilter} onValueChange={(val) => setDateFilter(val)}>
                <SelectTrigger className="h-9 w-[145px] text-xs font-medium">
                  <SelectValue placeholder="Pilih Tanggal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Tanggal</SelectItem>
                  <SelectItem value="TODAY">Hari Ini</SelectItem>
                  <SelectItem value="LAST_7_DAYS">7 Hari Terakhir</SelectItem>
                  <SelectItem value="THIS_MONTH">Bulan Ini</SelectItem>
                  <SelectItem value="CUSTOM">Pilih Tanggal...</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'CUSTOM' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-9 px-2 text-xs bg-background border border-border rounded-xl font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              )}
            </div>

            {/* Class Filter Dropdown */}
            <Select value={classFilter} onValueChange={(val) => setClassFilter(val)}>
              <SelectTrigger className="h-9 w-[130px] text-xs font-medium">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kelas</SelectItem>
                <SelectItem value="XI-A">Kelas XI-A</SelectItem>
                <SelectItem value="XI-B">Kelas XI-B</SelectItem>
                <SelectItem value="XI-C">Kelas XI-C</SelectItem>
                <SelectItem value="XI-D">Kelas XI-D</SelectItem>
                <SelectItem value="XI-E">Kelas XI-E</SelectItem>
                <SelectItem value="XI-F">Kelas XI-F</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
              statusFilter === 'ALL'
                ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
            )}
          >
            Semua Permohonan ({requests.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('MENUNGGU_VERIFIKASI')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
              statusFilter === 'MENUNGGU_VERIFIKASI'
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
            )}
          >
            Menunggu Wali ({waitingTeacherCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('DISETUJUI')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
              statusFilter === 'DISETUJUI'
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
            )}
          >
            Disetujui ({approvedTotal})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('DITOLAK')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
              statusFilter === 'DITOLAK'
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
            )}
          >
            Ditolak ({rejectedTotal})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                <TableHead className="w-32 py-3 px-4 text-xs font-semibold whitespace-nowrap">ID Pengajuan</TableHead>
                <TableHead className="min-w-[180px] py-3 px-4 text-xs font-semibold whitespace-nowrap">Nama Siswa</TableHead>
                <TableHead className="w-28 py-3 px-4 text-xs font-semibold whitespace-nowrap">Kelas</TableHead>
                <TableHead className="min-w-[190px] py-3 px-4 text-xs font-semibold whitespace-nowrap">Jenis Layanan</TableHead>
                <TableHead className="min-w-[240px] py-3 px-4 text-xs font-semibold">Keperluan & Waktu</TableHead>
                <TableHead className="w-36 py-3 px-4 text-xs font-semibold whitespace-nowrap">Status</TableHead>
                <TableHead className="w-32 py-3 px-4 text-right text-xs font-semibold whitespace-nowrap pr-5">Aksi BK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-600" />
                    <p className="font-semibold text-slate-700 dark:text-zinc-300">Tidak ada data permohonan yang sesuai filter</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Silakan pilih status lain atau bersihkan kotak pencarian.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="py-3.5 px-4 font-sans text-xs text-slate-600 dark:text-zinc-400 font-semibold whitespace-nowrap">
                      {r.id}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 min-w-[180px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-900/60">
                          {(r.studentName || 'S').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate block">
                            {r.studentName || 'Siswa'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {r.studentClass}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 shadow-2xs">
                        {r.subType}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-snug line-clamp-1">
                        {r.purpose}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 whitespace-nowrap">
                      {r.status === 'DISETUJUI' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-2xs">
                          Disetujui
                        </span>
                      )}
                      {r.status === 'DIPROSES_TU' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 text-white shadow-2xs">
                          <Clock className="w-3 h-3" />
                          <span>Diproses</span>
                        </span>
                      )}
                      {r.status === 'MENUNGGU_VERIFIKASI' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 text-white shadow-2xs">
                          Menunggu Wali
                        </span>
                      )}
                      {r.status === 'DITOLAK' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-600 text-white shadow-2xs">
                          Ditolak
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right whitespace-nowrap pr-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDetailModal(r)}
                        className="h-8 px-3 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 border-border hover:bg-muted transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          <span>Detail Laporan</span>
                        </span>
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
          {filteredRequests.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              Tidak ada permohonan yang sesuai filter.
            </div>
          ) : (
            filteredRequests.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400">{r.id}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {r.studentClass}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 mt-1">{r.studentName}</h4>
                  </div>
                  <div className="shrink-0">
                    {r.status === 'DISETUJUI' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-600 text-white shadow-2xs">
                        Disetujui
                      </span>
                    )}
                    {r.status === 'DIPROSES_TU' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-600 text-white shadow-2xs">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Diproses TU</span>
                      </span>
                    )}
                    {r.status === 'MENUNGGU_VERIFIKASI' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-600 text-white shadow-2xs">
                        Menunggu Wali
                      </span>
                    )}
                    {r.status === 'DITOLAK' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 text-white shadow-2xs">
                        Ditolak
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    {r.subType}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">{r.purpose}</p>
                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    Waktu: {r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}
                  </p>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenDetailModal(r)}
                    className="w-full h-8 text-xs font-medium rounded-lg border-border"
                  >
                    Buka Detail Laporan
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
