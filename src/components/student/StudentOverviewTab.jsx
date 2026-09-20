import React from 'react';
import { 
  FilePlus, 
  FileText, 
  Clock, 
  ChevronRight, 
  Lock 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import LiveClockWidget from '../common/LiveClockWidget';
import StatusBadge from '../common/StatusBadge';

export default function StudentOverviewTab({
  currentUser,
  isLocked,
  requests,
  documents,
  approvedCount,
  pendingCount,
  setActiveTab,
  onSelectReqDetail,
  onShowLockAlert
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Selamat Datang, {currentUser.name}! 👋
          </h1>
          <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
            NIS: <span className="font-medium text-slate-800 dark:text-zinc-200">{currentUser.nis || '20261001'}</span> • Kelas: <span className="font-medium text-slate-800 dark:text-zinc-200">{currentUser.class || 'XI-A'}</span> • Siswa Aktif SMAN 6 Semarang
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiveClockWidget />

          {isLocked ? (
            <Button
              variant="outline"
              onClick={onShowLockAlert}
              className="gap-2 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 font-medium text-xs sm:text-sm rounded-lg px-4 h-10 cursor-pointer shadow-2xs"
            >
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Layanan Ditutup Sementara</span>
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => setActiveTab('NEW_REQUEST')}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm rounded-lg px-4 h-10"
            >
              <FilePlus className="w-4 h-4" />
              <span>Buat Pengajuan Baru</span>
            </Button>
          )}
        </div>
      </div>

      {/* Body Section */}
      {isLocked ? (
        <div className="py-2 sm:py-4 space-y-6 max-w-4xl">
          <div className="space-y-2 border-b border-border pb-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Sistem Ditutup Sementara • Jam Pembelajaran Sekolah (07.30 — 15.30 WIB)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Pemberitahuan Layanan Izin & Ketertiban Presensi Sekolah
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Layanan pengajuan izin mandiri oleh siswa dinonaktifkan secara otomatis selama jam kegiatan belajar mengajar (KBM) berlangsung atau atas arahan Guru Bimbingan & Konseling (BK).
            </p>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                1. Ketentuan Jam Operasional Layanan Mandiri
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Siswa hanya dapat mengajukan permohonan izin sakit atau dispensasi kegiatan secara mandiri sebelum pukul <strong>07.30 WIB</strong> di pagi hari, atau setelah pukul <strong>15.30 WIB</strong> di sore/malam hari. Hal ini bertujuan untuk memelihara fokus belajar dan memastikan seluruh siswa berada di kelas selama pembelajaran aktif.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                2. Prosedur Izin Mendesak Saat KBM Berlangsung
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Apabila Anda mendadak mengalami gangguan kesehatan (sakit) atau memiliki kepentingan keluarga yang mendesak di tengah jam sekolah, mohon untuk tidak membuat pengajuan di aplikasi. Silakan ikuti prosedur resmi:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm text-muted-foreground">
                <li>Meminta izin langsung kepada Guru Mata Pelajaran yang sedang mengajar di kelas Anda.</li>
                <li>Melapor kepada <strong>Guru Piket</strong> atau <strong>Wali Kelas ({currentUser.class || 'XI-A'})</strong> di ruang piket.</li>
                <li>Menuju <strong>Ruang Bimbingan & Konseling (BK)</strong> untuk mendapatkan Surat Izin Keluar/Pulang resmi secara manual.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                3. Riwayat & Dokumen Izin yang Telah Terbit
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Seluruh permohonan surat izin yang telah Anda ajukan sebelumnya tetap tersimpan dan tercatat aman di pangkalan data sekolah. Anda dapat melihat arsip surat resmi yang telah disahkan melalui menu <strong>Arsip Dokumen Saya</strong> di panel navigasi samping.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Pusat Layanan Kesiswaan & Bimbingan Konseling SMAN 6 Semarang</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Sistem mandiri akan dibuka kembali pukul 15.30 WIB</span>
          </div>
        </div>
      ) : (
        <>
          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Pengajuan</p>
              <p className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-zinc-50 mt-1.5">{requests.length}</p>
              <p className="text-xs font-normal text-slate-600 dark:text-zinc-400 mt-1">Keseluruhan surat</p>
            </Card>
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Disetujui</p>
              <p className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-zinc-50 mt-1.5">{approvedCount}</p>
              <p className="text-xs font-normal text-slate-600 dark:text-zinc-400 mt-1">Telah diverifikasi</p>
            </Card>
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Dalam Proses</p>
              <p className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-zinc-50 mt-1.5">{pendingCount}</p>
              <p className="text-xs font-normal text-slate-600 dark:text-zinc-400 mt-1">Menunggu respon</p>
            </Card>
            <Card className="p-4 bg-card border border-border">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Dokumen Terbit</p>
              <p className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-zinc-50 mt-1.5">{documents.length}</p>
              <p className="text-xs font-normal text-slate-600 dark:text-zinc-400 mt-1">Siap diunduh</p>
            </Card>
          </div>

          {/* Recent Submissions List */}
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-zinc-50">
                <Clock className="w-4 h-4 text-blue-600" />
                Pengajuan Terbaru Anda
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('MY_REQUESTS')}
                className="gap-1 p-0 h-auto text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-transparent"
              >
                Lihat Semua
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {requests.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-xl">
                  <FileText className="w-9 h-9 text-slate-400 dark:text-zinc-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Belum ada riwayat pengajuan izin.</p>
                  <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-1">Klik tombol di atas untuk mengajukan izin atau dispensasi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl border border-border bg-card hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-sans font-medium text-slate-500 dark:text-zinc-400">{r.id}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{r.subType}</h4>
                        <p className="text-xs font-normal text-slate-600 dark:text-zinc-400 mt-1">
                          Waktu: <span className="font-medium text-slate-800 dark:text-zinc-200">{r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                        </p>
                        <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">Tujuan: {r.purpose}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectReqDetail(r)}
                        className="self-start sm:self-center text-xs font-medium h-9 rounded-lg border-border hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        Lacak Timeline
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
