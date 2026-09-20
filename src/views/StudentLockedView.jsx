import React, { useState, useEffect } from 'react';
import { Lock, Clock, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StudentLockedView({ currentUser, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeString = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDateString = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-border/80 shadow-lg bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-amber-600 dark:text-amber-500" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-1">
              <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-medium px-2.5 py-0.5">
                Jam Operasional Sekolah Aktif
              </Badge>
            </div>

            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Layanan Izin Ditutup Sementara
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Sesuai ketentuan tata tertib SMAN 6 Semarang, akses portal perizinan siswa dinonaktifkan selama kegiatan belajar mengajar berlangsung.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 pt-3">
            {/* Live Time Indicator */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {formatDateString(currentTime)}
              </span>
              <div className="flex items-center gap-2 my-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-2xl font-sans font-bold tracking-tight text-foreground">
                  {formatTimeString(currentTime)} WIB
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Portal ditutup: <strong>07.30 WIB</strong> • Buka kembali: <strong>16.30 WIB</strong>
              </p>
            </div>

            {/* Student Info Card */}
            <div className="p-3 rounded-lg border border-border bg-background/50 text-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">Siswa Terautentikasi:</p>
                <p className="font-semibold text-foreground">{currentUser.name}</p>
              </div>
              <Badge variant="secondary" className="text-[11px]">
                {currentUser.class || 'Kelas XI'}
              </Badge>
            </div>

            {/* Information Notice */}
            <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex flex-col gap-1 leading-relaxed">
                <p className="font-semibold">Butuh Izin Mendesak / Kegiatan OSIS?</p>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90">
                  Untuk perizinan mendesak seperti sakit di sekolah, dispensasi lomba, atau kegiatan OSIS/ekstrakurikuler, silakan melapor langsung ke <strong>Guru Piket</strong> atau petugas <strong>Guru Bimbingan & Konseling (BK)</strong> di Ruang BK. Petugas BK dapat membukakan akses khusus.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border mt-1">
              <span className="text-[11px] text-muted-foreground text-center sm:text-left">
                Halaman akan terbuka otomatis pada 16.30 WIB
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full sm:w-auto text-xs gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Akun
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
