import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

export default function SubmissionSuccessModal({
  submittedSuccessModal,
  onClose,
  onBackToHome,
  onTrackStatus
}) {
  return (
    <Dialog open={!!submittedSuccessModal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-zinc-50">
            Pengajuan Berhasil Dikirim!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
            Permohonan perizinan Anda telah masuk ke sistem dan diteruskan ke Wali Kelas untuk diverifikasi.
          </DialogDescription>
        </DialogHeader>

        {submittedSuccessModal && (
          <div className="space-y-3 py-1 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-slate-500 font-medium">Nomor Pengajuan:</span>
                <span className="font-sans font-semibold text-blue-600 dark:text-blue-400">{submittedSuccessModal.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Jenis Izin:</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">{submittedSuccessModal.subType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Waktu / Tanggal:</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">{submittedSuccessModal.timeSpanFormatted}</span>
              </div>
              <div className="pt-1 border-t border-border flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">Alasan:</span>
                <span className="text-right text-slate-700 dark:text-zinc-300 font-normal line-clamp-2">{submittedSuccessModal.purpose}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onBackToHome}
                className="w-full text-xs font-medium h-9 rounded-lg"
              >
                Kembali ke Beranda
              </Button>
              <Button
                variant="default"
                onClick={onTrackStatus}
                className="w-full text-xs font-medium h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              >
                <span>Lacak Status Pengajuan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
