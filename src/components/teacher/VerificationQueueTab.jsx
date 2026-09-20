import React from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  Calendar, 
  Timer, 
  Paperclip, 
  ImageIcon, 
  Eye 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function VerificationQueueTab({
  activeTab,
  pendingQueue,
  teacherClass,
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  onOpenActionModal,
  onPreviewImage
}) {
  return (
    <div className="space-y-4">
      {activeTab === 'VERIFY' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              Verifikasi Pengajuan Izin & Dispensasi
            </h1>
            <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
              Daftar pengajuan izin sakit dan dispensasi dari siswa kelas {teacherClass}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Filter Tanggal:</span>
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 w-[145px] text-xs font-medium">
                <SelectValue placeholder="Filter Tanggal" />
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
                className="h-8 px-2 text-xs bg-background border border-border rounded-lg font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Antrean Pengajuan Menunggu Verifikasi ({pendingQueue.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Filter Tanggal:</span>
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 w-[145px] text-xs font-medium">
                <SelectValue placeholder="Filter Tanggal" />
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
                className="h-8 px-2 text-xs bg-background border border-border rounded-lg font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            )}
          </div>
        </div>
      )}

      {pendingQueue.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
            {activeTab === 'VERIFY' ? 'Tidak ada antrean verifikasi saat ini.' : 'Semua pengajuan telah diverifikasi!'}
          </p>
          <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-0.5">
            Tidak ada pengajuan pending untuk kelas {teacherClass}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingQueue.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-border bg-card hover:border-blue-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans text-slate-500 dark:text-zinc-400 font-medium">{r.id}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {r.subType}
                  </span>
                  <span className="text-xs text-slate-500">• {r.createdAt}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{r.studentName}</h4>
                <p className="text-xs font-normal text-slate-600 dark:text-zinc-400">Alasan: {r.purpose}</p>
                <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium flex items-center gap-1.5 pt-0.5">
                  <Timer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Waktu: {r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                </p>

                {r.attachments && r.attachments.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    {r.attachments.map((att, i) => {
                      const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png)$/i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (isImg && att.previewUrl) {
                              onPreviewImage({ url: att.previewUrl, name: att.name, size: att.size });
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 transition-colors"
                        >
                          {isImg ? <ImageIcon className="w-3.5 h-3.5" /> : <Paperclip className="w-3.5 h-3.5" />}
                          <span>{att.name}</span>
                          {isImg && <Eye className="w-3 h-3 ml-0.5 opacity-70" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenActionModal(r)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-9 rounded-lg"
                >
                  Verifikasi Pengajuan
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
