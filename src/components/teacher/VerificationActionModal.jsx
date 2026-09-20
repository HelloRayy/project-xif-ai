import React from 'react';
import { 
  Paperclip, 
  ImageIcon, 
  FileText, 
  Maximize2, 
  Eye, 
  Download 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export default function VerificationActionModal({
  selectedReqAction,
  onClose,
  actionNote,
  setActionNote,
  onApprove,
  onReject,
  onPreviewImage
}) {
  return (
    <Dialog open={!!selectedReqAction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
            Verifikasi Pengajuan Siswa
          </DialogTitle>
        </DialogHeader>

        {selectedReqAction && (
          <div className="space-y-4 text-xs">
            {/* Summary Box */}
            <div className="space-y-2 bg-muted/50 p-3.5 rounded-xl border border-border">
              <p><span className="font-medium text-slate-800 dark:text-zinc-200">Siswa:</span> {selectedReqAction.studentName} ({selectedReqAction.studentClass})</p>
              <p><span className="font-medium text-slate-800 dark:text-zinc-200">Layanan:</span> {selectedReqAction.subType}</p>
              <p><span className="font-medium text-slate-800 dark:text-zinc-200">Waktu Izin:</span> {selectedReqAction.timeSpanFormatted || `${selectedReqAction.startDate} s/d ${selectedReqAction.endDate}`}</p>
              <p><span className="font-medium text-slate-800 dark:text-zinc-200">Alasan:</span> {selectedReqAction.purpose}</p>
              
              {/* Visual Image & Document Attachment Preview Cards */}
              {selectedReqAction.attachments && selectedReqAction.attachments.length > 0 && (
                <div className="pt-2 border-t border-border mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lampiran Dokumen Bukti Siswa</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {selectedReqAction.attachments.length} Berkas
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedReqAction.attachments.map((att, i) => {
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
                              className="relative h-44 w-full bg-slate-100 dark:bg-zinc-900/90 flex items-center justify-center p-3 cursor-pointer overflow-hidden border-b border-border/80"
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
                            <div className="h-20 w-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border-b border-border/80">
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">Dokumen Berkas</span>
                                  <span className="text-[10px] text-muted-foreground">{ext} File</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-background flex items-center justify-between gap-3">
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
            </div>

            {/* Direct Manual Input Textarea */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                Catatan Wali Kelas <span className="text-slate-500 font-normal">(Opsional jika disetujui, Wajib jika ditolak)</span>
              </Label>
              <Textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Tuliskan catatan persetujuan atau alasan apabila pengajuan ditolak..."
                className="text-xs leading-relaxed rounded-lg border-slate-300 dark:border-zinc-700"
              />
            </div>

            {/* Direct Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-9 px-3 text-xs font-medium rounded-lg"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="h-9 px-3 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                onClick={onReject}
              >
                Tolak Pengajuan
              </Button>
              <Button
                variant="default"
                className="h-9 px-3.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                onClick={onApprove}
              >
                Setujui Pengajuan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
