import React from 'react';
import { 
  Clock, 
  Timer, 
  ShieldCheck, 
  Paperclip, 
  ImageIcon, 
  FileText, 
  Maximize2, 
  Eye, 
  Download, 
  CheckCircle2, 
  Ban 
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import StatusBadge from '../common/StatusBadge';

export default function StudentRequestDetailDrawer({
  selectedReqDetail,
  onClose,
  currentUser,
  onCancelRequest,
  onPreviewImage,
  onDownloadLetter
}) {
  return (
    <Sheet open={!!selectedReqDetail} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-background border-l border-border z-50">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-border text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40">
                  Detail Timeline
                </span>
                <span className="text-xs font-sans text-muted-foreground">{selectedReqDetail?.id}</span>
              </div>
              <SheetTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50 mt-1 truncate">
                {selectedReqDetail?.subType}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Diajukan oleh {selectedReqDetail?.studentName || currentUser?.name} ({currentUser?.class || 'X-IPA 1'})
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        {selectedReqDetail && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Summary Card */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Status Pengajuan</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedReqDetail.status} />
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="text-[11px] block text-slate-400">Tanggal Pengajuan</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    {selectedReqDetail.createdAtFormatted || selectedReqDetail.date || 'Hari ini'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[11px] block">Rentang Waktu / Tanggal:</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{selectedReqDetail.timeSpanFormatted || `${selectedReqDetail.startDate} s/d ${selectedReqDetail.endDate}`}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 text-[11px] block">Kategori Administrasi:</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedReqDetail.type === 'IZIN_TIDAK_HADIR' ? 'Izin Tidak Hadir' : 'Dispensasi Kegiatan'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 text-[11px] block mb-1">Keperluan / Alasan:</span>
                <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {selectedReqDetail.purpose}
                </div>
              </div>
            </div>

            {/* Verification Note */}
            {(selectedReqDetail.teacherNote || selectedReqDetail.tuNote || selectedReqDetail.notes) && (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Catatan & Umpan Balik Verifikator</span>
                </div>
                {selectedReqDetail.teacherNote && (
                  <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Catatan Wali Kelas:</span>
                    <p className="italic">"{selectedReqDetail.teacherNote}"</p>
                  </div>
                )}
                {selectedReqDetail.tuNote && (
                  <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Catatan Tata Usaha:</span>
                    <p className="italic">"{selectedReqDetail.tuNote}"</p>
                  </div>
                )}
                {!selectedReqDetail.teacherNote && !selectedReqDetail.tuNote && selectedReqDetail.notes && (
                  <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Catatan:</span>
                    <p className="italic">"{selectedReqDetail.notes}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
            {selectedReqDetail.attachments && selectedReqDetail.attachments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/80 dark:border-blue-900/60">
                      <Paperclip className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Lampiran Dokumen Bukti
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-medium bg-blue-50/70 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                    {selectedReqDetail.attachments.length} Berkas
                  </Badge>
                </div>

                <div className="space-y-3">
                  {selectedReqDetail.attachments.map((att, i) => {
                    const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp)$/i);
                    const ext = att.name?.split('.').pop()?.toUpperCase() || (isImg ? 'IMG' : 'DOC');
                    
                    return (
                      <div
                        key={i}
                        className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-card overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-800/80 transition-all"
                      >
                        {isImg && att.previewUrl ? (
                          <div 
                            onClick={() => onPreviewImage({ url: att.previewUrl, name: att.name, size: att.size })}
                            className="relative h-48 sm:h-52 w-full bg-slate-100 dark:bg-zinc-900/90 flex items-center justify-center p-3 cursor-pointer overflow-hidden border-b border-border/80"
                            style={{
                              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
                              backgroundSize: '12px 12px'
                            }}
                          >
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              className="max-h-full max-w-full object-contain rounded-lg shadow-2xs group-hover:scale-105 transition-transform duration-300 ease-out"
                            />

                            <div className="absolute top-2.5 left-2.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-sans font-medium shadow-xs">
                                <ImageIcon className="w-3 h-3 text-blue-300" />
                                <span>{ext}</span>
                              </span>
                            </div>

                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5 p-4">
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 px-3.5 bg-white text-slate-900 hover:bg-slate-100 font-medium text-xs gap-1.5 rounded-lg shadow-lg"
                              >
                                <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Perbesar Pratinjau</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 w-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border-b border-border/80">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">Dokumen Berkas</span>
                                <span className="text-[10px] text-muted-foreground">{ext} File</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-3.5 bg-background flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate block">
                                {att.name}
                              </span>
                              <span className="shrink-0 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-sans text-[9px] font-semibold uppercase">
                                {ext}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {att.size || 'Ukuran tidak diketahui'} • Dokumen Terverifikasi
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isImg && att.previewUrl ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onPreviewImage({ url: att.previewUrl, name: att.name, size: att.size })}
                                className="h-7 px-2.5 text-xs font-medium gap-1 rounded-lg border-border hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </Button>
                            ) : null}
                            {att.previewUrl && (
                              <a
                                href={att.previewUrl}
                                download={att.name}
                                className="inline-flex items-center justify-center h-7 px-2.5 text-xs font-medium gap-1 rounded-lg border border-border bg-background hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                                title="Unduh berkas ini"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Unduh</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline Steps */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Jejak Langkah Verifikasi</span>
              </span>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="space-y-4 relative pl-5 border-l-2 border-blue-200 dark:border-blue-900/60 ml-2">
                  {selectedReqDetail.timeline && selectedReqDetail.timeline.length > 0 ? (
                    selectedReqDetail.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-background shadow-xs"></div>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">{step.note}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          Oleh: <span className="font-medium text-slate-700 dark:text-zinc-300">{step.byName}</span> • {step.timestamp}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-background"></div>
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">Pengajuan dibuat oleh siswa</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Oleh: {selectedReqDetail.studentName || currentUser?.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Issued Document */}
            {selectedReqDetail.status === 'DISETUJUI' && (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-emerald-950 dark:text-emerald-200">Surat Izin / Keterangan Resmi</h4>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5">Telah disahkan & terbit secara digital di sistem.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadLetter(selectedReqDetail)}
                  className="bg-white dark:bg-zinc-900 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-medium gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Surat (.PDF)</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <SheetFooter className="p-4 border-t border-border flex items-center justify-between bg-muted/20 shrink-0">
          {selectedReqDetail && selectedReqDetail.status === 'MENUNGGU_VERIFIKASI' ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancelRequest(selectedReqDetail.id)}
              className="h-8 px-3 text-xs font-medium gap-1.5 rounded-lg"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Batalkan Pengajuan</span>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">SchoolAdmin Portal Siswa</span>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="h-8 px-4 text-xs font-medium rounded-lg"
          >
            Tutup Panel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
