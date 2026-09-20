import React from 'react';
import { FileText, Paperclip, ImageIcon, Eye, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function RequestDetailDrawer({
  selectedReq,
  onClose,
  onPreviewImage
}) {
  return (
    <Sheet open={!!selectedReq} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-background border-l border-border z-50">
        <SheetHeader className="p-5 border-b border-border text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-900 shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
                Detail Laporan Izin Siswa
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Informasi lengkap permohonan izin siswa dan dokumen bukti untuk pemantauan BK.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {selectedReq && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Request Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold text-purple-600 dark:text-purple-400">{selectedReq.id}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {selectedReq.subType}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[11px] block">Siswa Pemohon:</span>
                  <strong className="text-slate-900 dark:text-zinc-100">{selectedReq.studentName} ({selectedReq.studentClass})</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Periode Izin / Waktu:</span>
                  <strong className="text-slate-900 dark:text-zinc-100">{selectedReq.timeSpanFormatted || `${selectedReq.startDate} s/d ${selectedReq.endDate}`}</strong>
                </div>
              </div>
              <div className="pt-1.5 border-t border-border">
                <span className="text-slate-500 text-[11px] block">Alasan Pengajuan:</span>
                <p className="text-slate-800 dark:text-zinc-200 mt-0.5">{selectedReq.purpose}</p>
              </div>
              {selectedReq.teacherNote && (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong>Catatan Wali Kelas:</strong> "{selectedReq.teacherNote}"
                </div>
              )}
            </div>

            {/* Attachments Preview */}
            {selectedReq.attachments && selectedReq.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                    <span>Lampiran Bukti / Surat Dokter ({selectedReq.attachments.length})</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedReq.attachments.map((att, i) => {
                    const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp)$/i);
                    return (
                      <div key={i} className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                            {isImg ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-slate-900 dark:text-zinc-100 truncate">{att.name}</p>
                            <span className="text-[10px] text-muted-foreground">{att.size || 'Bukti Izin'}</span>
                          </div>
                        </div>
                        {isImg && att.previewUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onPreviewImage({ url: att.previewUrl, name: att.name, size: att.size })}
                            className="h-7 px-2.5 text-xs font-medium rounded-lg gap-1 border-border"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-600" />
                            <span>Lihat Bukti</span>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status Laporan */}
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block">Status Verifikasi Wali Kelas</span>
              <div className="flex items-center gap-2">
                {selectedReq.status === 'DISETUJUI' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Telah Diverifikasi & Disetujui</span>
                  </span>
                )}
                {selectedReq.status === 'MENUNGGU_VERIFIKASI' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 text-white shadow-2xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu Tindak Lanjut Wali Kelas</span>
                  </span>
                )}
                {selectedReq.status === 'DITOLAK' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-600 text-white shadow-2xs">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Ditolak oleh Wali Kelas</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drawer Sticky Footer */}
        {selectedReq && (
          <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium rounded-lg border-border"
            >
              Tutup Pratinjau
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
