import React from 'react';
import { 
  User, 
  CalendarCheck, 
  Clock, 
  FileText, 
  Timer, 
  ShieldCheck, 
  Paperclip, 
  ImageIcon, 
  Eye 
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '../ui/sheet';
import { Button } from '../ui/button';

export default function StudentDetailDrawer({
  selectedStudentDetail,
  onClose,
  teacherClass,
  onPreviewImage
}) {
  return (
    <Sheet open={!!selectedStudentDetail} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-background border-l border-border z-50">
        {/* 1. Header Drawer */}
        <SheetHeader className="p-5 border-b border-border text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60 shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
                Profil & Riwayat Perizinan Siswa
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Data kehadiran, akumulasi izin, dan arsip berkas kelas {teacherClass}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* 2. Scrollable Drawer Content */}
        {selectedStudentDetail && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Profile Card */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {selectedStudentDetail.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">{selectedStudentDetail.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {teacherClass}
                    </p>
                  </div>
                </div>

                {/* Today's Status Solid Tag */}
                <div className="shrink-0">
                  {selectedStudentDetail.currentStatus === 'HADIR' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-600 text-white shadow-2xs">
                      Hadir Normal
                    </span>
                  )}
                  {selectedStudentDetail.currentStatus === 'IZIN_SAKIT' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-600 text-white shadow-2xs">
                      Izin Sakit
                    </span>
                  )}
                  {selectedStudentDetail.currentStatus === 'DISPENSASI' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-600 text-white shadow-2xs">
                      Dispensasi
                    </span>
                  )}
                  {selectedStudentDetail.currentStatus === 'IZIN_KEPERLUAN' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-600 text-white shadow-2xs">
                      Izin Keperluan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Presensi S/I/D/A Recap Grid */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Rekapitulasi Ketidakhadiran Semester Ini</span>
              </span>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50">
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium block">Sakit (S)</span>
                  <span className="text-lg font-semibold text-rose-700 dark:text-rose-300 mt-0.5 inline-block">{selectedStudentDetail.sakitDays}</span>
                  <span className="text-[10px] text-slate-500 block">Hari</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium block">Izin (I)</span>
                  <span className="text-lg font-semibold text-amber-700 dark:text-amber-300 mt-0.5 inline-block">{selectedStudentDetail.izinDays}</span>
                  <span className="text-[10px] text-slate-500 block">Hari</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium block">Dispensasi (D)</span>
                  <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-0.5 inline-block">{selectedStudentDetail.dispDays}</span>
                  <span className="text-[10px] text-slate-500 block">Hari</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium block">Alfa (A)</span>
                  <span className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mt-0.5 inline-block">{selectedStudentDetail.alfaDays}</span>
                  <span className="text-[10px] text-slate-500 block">Hari</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Ketidakhadiran: <strong className="font-semibold text-slate-900 dark:text-zinc-100">{selectedStudentDetail.totalAbsence} Hari</strong></span>
                <span>Tingkat Kehadiran: <strong className="font-semibold text-emerald-700 dark:text-emerald-400">{Math.max(85, 100 - (selectedStudentDetail.totalAbsence * 1.5))}%</strong></span>
              </div>
            </div>

            {/* Feed Riwayat Surat Pengajuan Siswa */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Arsip Surat Perizinan ({selectedStudentDetail.requestsList?.length || 0})</span>
                </h4>
              </div>

              <div className="space-y-3">
                {!selectedStudentDetail.requestsList || selectedStudentDetail.requestsList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground text-xs">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-700 dark:text-zinc-300">Belum ada riwayat perizinan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Siswa ini belum pernah mengajukan surat izin.</p>
                  </div>
                ) : (
                  selectedStudentDetail.requestsList.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-card space-y-2.5 shadow-xs hover:border-blue-200 dark:hover:border-blue-900/60 transition-colors"
                    >
                      {/* Card Top Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs text-slate-500 font-medium">{req.id}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {req.subType}
                          </span>
                        </div>

                        <div>
                          {req.status === 'DISETUJUI' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-600 text-white shadow-2xs">
                              Disetujui
                            </span>
                          )}
                          {req.status === 'DITOLAK' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 text-white shadow-2xs">
                              Ditolak
                            </span>
                          )}
                          {req.status === 'DIPROSES_TU' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-600 text-white shadow-2xs">
                              Diproses TU
                            </span>
                          )}
                          {req.status === 'MENUNGGU_VERIFIKASI' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-600 text-white shadow-2xs">
                              Menunggu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time span */}
                      <p className="text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Waktu: <strong>{req.timeSpanFormatted || `${req.startDate} s/d ${req.endDate}`}</strong></span>
                      </p>

                      {/* Purpose */}
                      <div className="p-2.5 bg-muted/40 rounded-lg text-xs text-slate-700 dark:text-zinc-300">
                        <span className="font-medium text-slate-900 dark:text-zinc-100 block mb-0.5">Alasan:</span>
                        <p className="leading-relaxed">{req.purpose}</p>
                      </div>

                      {/* Notes from Teacher/Admin */}
                      {req.notes && (
                        <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-0.5">
                          <span className="font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Catatan Verifikasi:</span>
                          </span>
                          <p className="text-[11px] leading-relaxed">{req.notes}</p>
                        </div>
                      )}

                      {/* Attachments preview */}
                      {req.attachments && req.attachments.length > 0 && (
                        <div className="pt-1 space-y-1.5">
                          <span className="text-[11px] font-medium text-slate-500 block">Lampiran Bukti ({req.attachments.length}):</span>
                          <div className="flex flex-wrap gap-2">
                            {req.attachments.map((att, i) => {
                              const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png)$/i);
                              return (
                                <div
                                  key={i}
                                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted/50 text-xs font-medium"
                                >
                                  {isImg ? <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> : <Paperclip className="w-3.5 h-3.5 text-slate-500" />}
                                  <span className="truncate max-w-[150px] text-slate-800 dark:text-zinc-200">{att.name}</span>
                                  {isImg && att.previewUrl && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onPreviewImage({ url: att.previewUrl, name: att.name, size: att.size })}
                                      className="h-6 px-1.5 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950/80 gap-1 rounded"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Lihat</span>
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Drawer Footer */}
        <SheetFooter className="p-4 border-t border-border flex items-center justify-between bg-muted/20 shrink-0">
          <span className="text-xs text-muted-foreground">Kelas {teacherClass}</span>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-8 px-3.5 text-xs font-medium rounded-lg"
          >
            Tutup Panel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
