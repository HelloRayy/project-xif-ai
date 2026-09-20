import React from 'react';
import { 
  FilePlus, 
  FileText, 
  Calendar as CalendarIcon, 
  Lock 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import StatusBadge from '../common/StatusBadge';

export default function RequestHistoryTab({
  requests,
  isLocked,
  setActiveTab,
  onSelectReqDetail,
  onCancelRequest
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Riwayat & Status Pengajuan
          </h1>
          <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
            Pantau verifikasi Wali Kelas dan status pengesahan surat resmi dari TU.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setActiveTab('NEW_REQUEST')}
          className="gap-1.5 self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg"
        >
          <FilePlus className="w-4 h-4" />
          <span>Pengajuan Baru</span>
        </Button>
      </div>

      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-14 border-dashed rounded-xl">
              <FileText className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Belum ada riwayat pengajuan.</p>
              <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-1">Buat pengajuan baru untuk melihat status di sini.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/30">
                      <TableHead className="w-[140px] font-medium text-slate-600 dark:text-zinc-400 text-xs">No. Pengajuan</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-zinc-400 text-xs">Jenis Izin</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-zinc-400 text-xs">Waktu / Tanggal</TableHead>
                      <TableHead className="font-medium text-slate-600 dark:text-zinc-400 text-xs">Status</TableHead>
                      <TableHead className="text-right font-medium text-slate-600 dark:text-zinc-400 text-xs">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/40">
                        <TableCell className="font-sans text-xs text-slate-600 dark:text-zinc-400 font-medium">{r.id}</TableCell>
                        <TableCell>
                          <p className="font-medium text-sm text-slate-900 dark:text-zinc-100">{r.subType}</p>
                          <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 line-clamp-1">{r.purpose}</p>
                        </TableCell>
                        <TableCell className="text-xs">
                          <p className="font-medium text-slate-800 dark:text-zinc-200">
                            {r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}
                          </p>
                          <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">Diajukan: {r.createdAt}</p>
                        </TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectReqDetail(r)}
                            className="h-8 text-xs font-medium rounded-lg"
                          >
                            Lacak
                          </Button>
                          {r.status === 'MENUNGGU_VERIFIKASI' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onCancelRequest(r.id)}
                              className="h-8 text-xs font-medium rounded-lg"
                            >
                              Batalkan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Touch-Friendly Card View */}
              <div className="md:hidden divide-y divide-border p-3 space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">{r.subType}</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mt-0.5">{r.purpose}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectReqDetail(r)}
                        className="flex-1 h-8 text-xs font-medium rounded-lg border-border"
                      >
                        Lacak Status & Timeline
                      </Button>
                      {r.status === 'MENUNGGU_VERIFIKASI' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onCancelRequest(r.id)}
                          className="h-8 px-3 text-xs font-medium rounded-lg"
                        >
                          Batalkan
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Tutup Sementara */}
      {isLocked && (
        <div className="p-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs">
              <strong>Status Layanan: Tutup Sementara</strong> — Pembuatan permohonan surat izin baru ditutup sementara selama jam KBM aktif (07.30 - 15.30 WIB). Pemantauan dan pelacakan status permohonan yang ada tetap dapat dilakukan secara normal.
            </span>
          </div>
          <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400 shrink-0 self-start sm:self-auto">
            Tutup Sementara
          </Badge>
        </div>
      )}
    </div>
  );
}
