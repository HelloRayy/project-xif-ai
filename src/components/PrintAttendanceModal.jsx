import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";

export default function PrintAttendanceModal({
  open,
  onOpenChange,
  className = "XI-A",
  students = [],
  requests = [],
  teacherName = "Ahmad Dahlan, S.Pd.",
  teacherNip = "19790812 200501 1 004",
}) {
  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Calculate S / I / D / A for each student from approved requests
  const studentRows = students.map((st, idx) => {
    const studentReqs = requests.filter(r => r.studentId === st.id && r.status === 'DISETUJUI');
    const sakitDays = studentReqs.filter(r => r.subType?.toLowerCase().includes('sakit')).length;
    const izinDays = studentReqs.filter(r => r.type === 'IZIN_TIDAK_HADIR' && !r.subType?.toLowerCase().includes('sakit')).length;
    const dispDays = studentReqs.filter(r => r.type === 'DISPENSASI').length;
    const totalKetidakhadiran = sakitDays + izinDays + dispDays;

    return {
      no: idx + 1,
      nis: st.nis || '-',
      nisn: st.nisn || '-',
      name: st.name,
      gender: st.gender === 'Perempuan' ? 'P' : 'L',
      sakit: sakitDays,
      izin: izinDays,
      disp: dispDays,
      alfa: 0,
      total: totalKetidakhadiran,
      status: totalKetidakhadiran === 0 ? 'Hadir Penuh' : totalKetidakhadiran >= 3 ? 'Perlu Perhatian' : 'Tercatat'
    };
  });

  const totalSakit = studentRows.reduce((acc, r) => acc + r.sakit, 0);
  const totalIzin = studentRows.reduce((acc, r) => acc + r.izin, 0);
  const totalDisp = studentRows.reduce((acc, r) => acc + r.disp, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
        
        {/* Modal Header */}
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Pratinjau Cetak Rekapitulasi Presensi Resmi</span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Format dokumen resmi ber-kop surat SMA Negeri 6 Semarang (Siap cetak kertas A4 / Simpan PDF).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang (Print)</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-zinc-900/60">
          
          {/* Paper Sheet Representation */}
          <div 
            id="printable-report"
            className="bg-white text-slate-900 p-8 sm:p-10 shadow-md border border-slate-200 mx-auto rounded-md max-w-3xl font-sans"
            style={{ minHeight: '842px', color: '#0f172a' }}
          >
            
            {/* Kop Surat Resmi */}
            <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center relative">
              <div className="flex items-center justify-center gap-4 mb-1">
                {/* Logo Sekolah */}
                <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-lg bg-blue-50 text-blue-900 shrink-0">
                  SMAN 6
                </div>
                <div className="text-center">
                  <h3 className="text-xs tracking-wider uppercase font-semibold text-slate-700">
                    PEMERINTAH PROVINSI JAWA TENGAH
                  </h3>
                  <h2 className="text-xs tracking-wider uppercase font-semibold text-slate-700">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </h2>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    SMA NEGERI 6 SEMARANG
                  </h1>
                  <p className="text-[10px] text-slate-600 font-normal leading-tight">
                    Jl. Ronggolawe No. 4, Krobokan, Kec. Semarang Barat, Kota Semarang 50141<br />
                    Laman: www.sman6semarang.sch.id • Pos-el: info@sman6semarang.sch.id • Telp: (024) 7605952
                  </p>
                </div>
              </div>
              <div className="w-full h-0.5 bg-slate-900 mt-2"></div>
              <div className="w-full h-px bg-slate-900 mt-0.5"></div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-5">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900 underline underline-offset-4">
                REKAPITULASI PRESENSI & KETIDAKHADIRAN SISWA
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Tahun Ajaran 2026/2027 • Semester Ganjil
              </p>
            </div>

            {/* Metadata Info Grid */}
            <div className="grid grid-cols-2 text-xs mb-4 pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-24 text-slate-500 font-medium">Kelas</span>
                  <span className="font-bold text-slate-900">: {className}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-slate-500 font-medium">Wali Kelas</span>
                  <span className="font-semibold text-slate-900">: {teacherName}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-slate-500 font-medium">NIP</span>
                  <span className="text-slate-800 font-sans">: {teacherNip}</span>
                </div>
              </div>

              <div className="space-y-1 text-right sm:text-left">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Total Siswa</span>
                  <span className="font-semibold text-slate-900">: {students.length} Siswa</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Tanggal Cetak</span>
                  <span className="font-semibold text-slate-900">: {currentDateFormatted}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Status Sistem</span>
                  <span className="text-emerald-700 font-semibold">: Sah & Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Table of Attendance */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                    <th className="border border-slate-300 p-1.5 text-center w-20">NIS</th>
                    <th className="border border-slate-300 p-1.5 text-center w-24">NISN</th>
                    <th className="border border-slate-300 p-1.5">Nama Siswa</th>
                    <th className="border border-slate-300 p-1.5 text-center w-8">L/P</th>
                    <th className="border border-slate-300 p-1.5 text-center w-10 text-rose-700">S</th>
                    <th className="border border-slate-300 p-1.5 text-center w-10 text-amber-700">I</th>
                    <th className="border border-slate-300 p-1.5 text-center w-10 text-blue-700">D</th>
                    <th className="border border-slate-300 p-1.5 text-center w-10">A</th>
                    <th className="border border-slate-300 p-1.5 text-center w-12 font-bold">Total</th>
                    <th className="border border-slate-300 p-1.5 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((r) => (
                    <tr key={r.no} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-1.5 text-center text-slate-500 font-sans">{r.no}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-sans text-[10px]">{r.nis}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-sans text-[10px]">{r.nisn}</td>
                      <td className="border border-slate-300 p-1.5 font-medium text-slate-900">{r.name}</td>
                      <td className="border border-slate-300 p-1.5 text-center text-slate-600">{r.gender}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-semibold text-rose-700">{r.sakit || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-semibold text-amber-700">{r.izin || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-semibold text-blue-700">{r.disp || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center text-slate-400">{r.alfa || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900">{r.total}</td>
                      <td className="border border-slate-300 p-1.5 text-center text-[10px] font-medium text-slate-700">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-[11px]">
                    <td colSpan={5} className="border border-slate-300 p-2 text-right">TOTAL KETIDAKHADIRAN KELAS:</td>
                    <td className="border border-slate-300 p-2 text-center text-rose-700">{totalSakit}</td>
                    <td className="border border-slate-300 p-2 text-center text-amber-700">{totalIzin}</td>
                    <td className="border border-slate-300 p-2 text-center text-blue-700">{totalDisp}</td>
                    <td className="border border-slate-300 p-2 text-center text-slate-400">0</td>
                    <td className="border border-slate-300 p-2 text-center text-slate-900">{totalSakit + totalIzin + totalDisp}</td>
                    <td className="border border-slate-300 p-2 text-center">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 text-xs pt-4 mt-8 gap-8 border-t border-slate-200">
              <div className="text-center">
                <p className="text-slate-600 font-medium">Mengetahui,</p>
                <p className="font-bold text-slate-900 mt-0.5">Kepala SMA Negeri 6 Semarang</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">(Tanda Tangan & Cap Digital)</span>
                </div>
                <p className="font-bold text-slate-900 underline underline-offset-2">
                  Dra. Hj. Sri Lestari, M.Pd.
                </p>
                <p className="text-slate-600 font-sans text-[10px]">
                  NIP. 19680514 199303 2 004
                </p>
              </div>

              <div className="text-center">
                <p className="text-slate-600 font-medium">Semarang, {currentDateFormatted}</p>
                <p className="font-bold text-slate-900 mt-0.5">Wali Kelas {className}</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">(Tanda Tangan Digital)</span>
                </div>
                <p className="font-bold text-slate-900 underline underline-offset-2">
                  {teacherName}
                </p>
                <p className="text-slate-600 font-sans text-[10px]">
                  NIP. {teacherNip}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-3 border-t border-border bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Tips: Pilih opsi "Save as PDF" pada dialog printer browser untuk menyimpan file PDF.
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-3 text-xs"
            >
              Tutup
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap Presensi</span>
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
