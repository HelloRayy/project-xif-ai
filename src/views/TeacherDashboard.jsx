import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CalendarCheck, 
  Users, 
  CheckCircle2, 
  Phone, 
  Paperclip,
  Check,
  X,
  FileSpreadsheet,
  Timer,
  AlertTriangle,
  FileText,
  Eye,
  ImageIcon,
  Search,
  Download,
  MessageCircle,
  ExternalLink,
  User,
  ShieldCheck,
  Clock,
  ChevronRight,
  Maximize2,
  Printer,
  Calendar
} from 'lucide-react';
import PrintAttendanceModal from '../components/PrintAttendanceModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { cn } from '../lib/utils';
import { getRequests, updateRequestStatus, getStudents } from '../services/storage';
import * as XLSX from 'xlsx';

export default function TeacherDashboard({ currentUser, activeTab }) {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedReqAction, setSelectedReqAction] = useState(null);
  const [actionNote, setActionNote] = useState('');
  
  // Class Students & Attendance Recap States
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM'
  const [customDate, setCustomDate] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Image Lightbox Preview Modal State
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // shadcn AlertDialog State
  const [alertState, setAlertState] = useState({
    open: false,
    title: '',
    description: '',
    actionLabel: 'Mengerti',
    variant: 'default',
    onAction: null
  });

  const showAlert = (title, description, actionLabel = 'Mengerti', variant = 'default', onAction = null) => {
    setAlertState({
      open: true,
      title,
      description,
      actionLabel,
      variant,
      onAction
    });
  };

  const [selectedClass, setSelectedClass] = useState(currentUser?.assignedClass || 'XI-A');
  const teacherClass = selectedClass;
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser, activeTab, selectedClass]);

  const loadData = () => {
    if (!currentUser) return;
    const allReqs = getRequests().filter(r => r.studentClass === teacherClass || !r.studentClass);
    setRequests(allReqs);

    const classStudents = getStudents().filter(s => s.class === teacherClass);
    setStudents(classStudents);
  };

  const handleOpenActionModal = (req) => {
    setSelectedReqAction(req);
    setActionNote('');
  };

  const handleApprove = () => {
    if (!selectedReqAction) return;

    const targetStatus = selectedReqAction.type === 'IZIN_TIDAK_HADIR' ? 'DISETUJUI' : 'DIPROSES_TU';

    updateRequestStatus(selectedReqAction.id, targetStatus, actionNote.trim() || 'Disetujui oleh Wali Kelas', currentUser);
    const reqId = selectedReqAction.id;
    setSelectedReqAction(null);
    setActionNote('');
    loadData();

    showAlert(
      'Pengajuan Disetujui',
      `Pengajuan izin siswa dengan nomor ${reqId} telah berhasil diverifikasi dan disetujui.`,
      'Selesai',
      'default'
    );
  };

  const handleReject = () => {
    if (!selectedReqAction) return;
    if (!actionNote.trim()) {
      showAlert(
        'Alasan Penolakan Wajib Diisi',
        'Mohon tuliskan alasan atau catatan penolakan pada kolom catatan agar siswa dapat mengetahui kendala permohonannya.',
        'Kembali Mengisi',
        'destructive'
      );
      return;
    }

    updateRequestStatus(selectedReqAction.id, 'DITOLAK', actionNote.trim(), currentUser);
    const reqId = selectedReqAction.id;
    const note = actionNote.trim();
    setSelectedReqAction(null);
    setActionNote('');
    loadData();

    showAlert(
      'Pengajuan Ditolak',
      `Pengajuan izin ${reqId} telah ditolak dengan catatan: "${note}".`,
      'Tutup',
      'default'
    );
  };

  // Date Filtering Helper
  const isDateMatchingFilter = (dateStr) => {
    if (dateFilter === 'ALL' || !dateStr) return true;
    
    // Normalize dateStr (can be '2026-08-23' or '2026-08-23 10:30')
    const cleanDate = dateStr.slice(0, 10);
    const targetDate = new Date(cleanDate);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (dateFilter === 'TODAY') {
      return cleanDate === todayStr;
    }
    if (dateFilter === 'LAST_7_DAYS') {
      const diffTime = Math.abs(now - targetDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (dateFilter === 'THIS_MONTH') {
      const targetMonth = targetDate.toISOString().slice(0, 7);
      const currentMonth = now.toISOString().slice(0, 7);
      return targetMonth === currentMonth;
    }
    if (dateFilter === 'CUSTOM') {
      if (!customDate) return true;
      return cleanDate === customDate;
    }
    return true;
  };

  const filteredRequestsByDate = requests.filter(r => {
    return isDateMatchingFilter(r.startDate || r.createdAt);
  });

  const pendingQueue = filteredRequestsByDate.filter(r => r.status === 'MENUNGGU_VERIFIKASI');

  // Compute Per-Student Attendance Statistics (S/I/D/A without NIS/NISN)
  const studentAttendanceData = students.map((s) => {
    const studentReqs = requests.filter(r => r.studentId === s.id || r.studentName === s.name);
    
    // Approved or in-progress valid requests
    const approvedSakitReqs = studentReqs.filter(
      r => r.subType?.toLowerCase().includes('sakit') && r.status !== 'DITOLAK' && r.status !== 'DIBATALKAN'
    );
    const approvedIzinReqs = studentReqs.filter(
      r => !r.subType?.toLowerCase().includes('sakit') && r.type === 'IZIN_TIDAK_HADIR' && r.status !== 'DITOLAK' && r.status !== 'DIBATALKAN'
    );
    const approvedDispReqs = studentReqs.filter(
      r => r.type === 'DISPENSASI' && r.status !== 'DITOLAK' && r.status !== 'DIBATALKAN'
    );

    const sakitDays = approvedSakitReqs.length;
    const izinDays = approvedIzinReqs.length;
    const dispDays = approvedDispReqs.length;
    const alfaDays = 0; // Standard baseline

    const totalAbsence = sakitDays + izinDays + dispDays + alfaDays;

    // Determine today's status
    let currentStatus = 'HADIR';
    let currentStatusLabel = 'Hadir Normal';
    if (approvedSakitReqs.some(r => r.status === 'MENUNGGU_VERIFIKASI' || r.status === 'DISETUJUI')) {
      currentStatus = 'IZIN_SAKIT';
      currentStatusLabel = 'Izin Sakit';
    } else if (approvedDispReqs.some(r => r.status === 'MENUNGGU_VERIFIKASI' || r.status === 'DIPROSES_TU' || r.status === 'DISETUJUI')) {
      currentStatus = 'DISPENSASI';
      currentStatusLabel = 'Dispensasi Kegiatan';
    } else if (approvedIzinReqs.some(r => r.status === 'MENUNGGU_VERIFIKASI' || r.status === 'DISETUJUI')) {
      currentStatus = 'IZIN_KEPERLUAN';
      currentStatusLabel = 'Izin Keperluan';
    }

    return {
      ...s,
      sakitDays,
      izinDays,
      dispDays,
      alfaDays,
      totalAbsence,
      currentStatus,
      currentStatusLabel,
      requestsList: studentReqs
    };
  });

  // Filtered Students List
  const filteredStudents = studentAttendanceData.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase().trim()) ||
                          (s.guardianName && s.guardianName.toLowerCase().includes(studentSearch.toLowerCase().trim()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'HADIR') return s.currentStatus === 'HADIR';
    if (statusFilter === 'IZIN') return s.currentStatus !== 'HADIR';
    if (statusFilter === 'PERLU_PERHATIAN') return s.totalAbsence >= 2;
    return true;
  });

  // Class Aggregates
  const totalClassStudents = students.length;
  const totalClassSakit = studentAttendanceData.reduce((acc, curr) => acc + curr.sakitDays, 0);
  const totalClassIzin = studentAttendanceData.reduce((acc, curr) => acc + curr.izinDays, 0);
  const totalClassDisp = studentAttendanceData.reduce((acc, curr) => acc + curr.dispDays, 0);
  const totalNeedAttention = studentAttendanceData.filter(s => s.totalAbsence >= 2).length;

  // Export Attendance Recap Table to Excel
  const handleExportExcel = () => {
    try {
      const dataToExport = studentAttendanceData.map((s, idx) => ({
        'No': idx + 1,
        'Nama Lengkap': s.name,
        'Kelas': teacherClass,
        'Jenis Kelamin': s.gender || 'Laki-laki',
        'Status Hari Ini': s.currentStatusLabel,
        'Sakit (S)': s.sakitDays,
        'Izin (I)': s.izinDays,
        'Dispensasi (D)': s.dispDays,
        'Alfa (A)': s.alfaDays,
        'Total Ketidakhadiran': `${s.totalAbsence} Hari`,
        'Nama Wali': s.guardianName || '-',
        'No. HP Wali': s.guardianPhone || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Presensi_${teacherClass}`);
      XLSX.writeFile(wb, `Rekap_Presensi_${teacherClass}_${new Date().toISOString().slice(0, 10)}.xlsx`);

      showAlert('Ekspor Berhasil', `File rekap presensi kelas ${teacherClass} berhasil diunduh.`, 'Selesai');
    } catch (err) {
      showAlert('Gagal Mengunduh', 'Terjadi kendala saat menyusun data ekspor.', 'Tutup', 'destructive');
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* =========================================================================
          TAB: OVERVIEW
          ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                Selamat Datang, {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
                <span>Wali Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-8 px-2.5 text-xs bg-background border border-border rounded-lg font-semibold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="XI-A">Kelas XI-A</option>
                  <option value="XI-B">Kelas XI-B</option>
                  <option value="XI-C">Kelas XI-C</option>
                  <option value="XI-D">Kelas XI-D</option>
                  <option value="XI-E">Kelas XI-E</option>
                  <option value="XI-F">Kelas XI-F</option>
                </select>
                <span>• Portal Verifikasi & Rekap Presensi Siswa</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Card className="px-4 py-2 bg-card border border-border text-center shadow-xs">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wider">Antrean Verifikasi</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-0.5">{pendingQueue.length}</p>
              </Card>
              <Card className="px-4 py-2 bg-card border border-border text-center shadow-xs">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Total Siswa Binaan</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-0.5">{students.length}</p>
              </Card>
            </div>
          </div>

          {/* Filter Tanggal & Pending Queue List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Antrean Pengajuan Menunggu Verifikasi ({pendingQueue.length})</span>
              </h2>

              {/* Date Filter Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Filter Tanggal:</span>
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-8 px-2.5 text-xs bg-background border border-border rounded-lg font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="ALL">Semua Tanggal</option>
                  <option value="TODAY">Hari Ini</option>
                  <option value="LAST_7_DAYS">7 Hari Terakhir</option>
                  <option value="THIS_MONTH">Bulan Ini</option>
                  <option value="CUSTOM">Pilih Tanggal Tertentu...</option>
                </select>

                {dateFilter === 'CUSTOM' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="h-8 px-2 text-xs bg-background border border-border rounded-lg font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Semua pengajuan telah diverifikasi!</p>
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-0.5">Tidak ada pengajuan pending untuk kelas {teacherClass}.</p>
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
                        <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-medium">{r.id}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">{r.subType}</span>
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
                                    setPreviewImageModal({ url: att.previewUrl, name: att.name, size: att.size });
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
                        onClick={() => handleOpenActionModal(r)}
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
        </div>
      )}

      {/* =========================================================================
          TAB: VERIFY (Direct Queue Focus)
          ========================================================================= */}
      {activeTab === 'VERIFY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                Verifikasi Pengajuan Izin & Dispensasi
              </h1>
              <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
                Daftar pengajuan izin sakit dan dispensasi dari siswa kelas {teacherClass}.
              </p>
            </div>

            {/* Date Filter Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Filter Tanggal:</span>
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-background border border-border rounded-lg font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">Semua Tanggal</option>
                <option value="TODAY">Hari Ini</option>
                <option value="LAST_7_DAYS">7 Hari Terakhir</option>
                <option value="THIS_MONTH">Bulan Ini</option>
                <option value="CUSTOM">Pilih Tanggal Tertentu...</option>
              </select>

              {dateFilter === 'CUSTOM' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-8 px-2 text-xs bg-background border border-border rounded-lg font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-border rounded-xl">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Tidak ada antrean verifikasi saat ini.</p>
              <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-0.5">Semua pengajuan kelas {teacherClass} telah diproses.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 font-medium">{r.id}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">{r.subType}</span>
                      <span className="text-xs text-slate-500">• {r.createdAt}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{r.studentName}</h4>
                    <p className="text-xs font-normal text-slate-600 dark:text-zinc-400">Alasan: {r.purpose}</p>
                    <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium flex items-center gap-1.5 pt-0.5">
                      <Timer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Waktu: {r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                    </p>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleOpenActionModal(r)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-9 rounded-lg shrink-0"
                  >
                    Verifikasi Pengajuan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: CLASS_STUDENTS (Daftar Siswa Binaan & Rekap Presensi Komprehensif)
          ========================================================================= */}
      {activeTab === 'CLASS_STUDENTS' && (
        <div className="space-y-6">
          {/* Header Title & Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                Daftar Siswa Binaan & Rekap Presensi
              </h1>
              <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
                Monitoring kehadiran, akumulasi izin, dan kontak wali siswa kelas <span className="font-semibold text-foreground">{teacherClass}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrintModal(true)}
                className="gap-2 text-xs font-medium h-9 border-blue-300 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Cetak Rekap Presensi (PDF)</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="gap-2 text-xs font-medium h-9 border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ekspor Excel (.xlsx)</span>
              </Button>
            </div>
          </div>

          {/* 1. KPI Summary Cards (Clean & Accessible Inter Sans) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <Card className="p-3.5 bg-card border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Siswa Binaan</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
                {totalClassStudents} <span className="text-xs font-normal text-slate-500">Siswa</span>
              </p>
            </Card>

            <Card className="p-3.5 bg-card border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Sakit (S)</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
                {totalClassSakit} <span className="text-xs font-normal text-slate-500">Hari</span>
              </p>
            </Card>

            <Card className="p-3.5 bg-card border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Izin (I)</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
                {totalClassIzin} <span className="text-xs font-normal text-slate-500">Hari</span>
              </p>
            </Card>

            <Card className="p-3.5 bg-card border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Dispensasi (D)</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
                {totalClassDisp} <span className="text-xs font-normal text-slate-500">Hari</span>
              </p>
            </Card>

            <Card className="p-3.5 bg-card border border-border shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Perlu Perhatian</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-50 mt-1">
                {totalNeedAttention} <span className="text-xs font-normal text-slate-500">Siswa (≥2 Hari)</span>
              </p>
            </Card>
          </div>

          {/* 2. Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari nama siswa atau nama orang tua..."
                className="pl-9 h-9 text-xs bg-background border-slate-300 dark:border-zinc-700"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="XI-A">Kelas XI-A</option>
              <option value="XI-B">Kelas XI-B</option>
              <option value="XI-C">Kelas XI-C</option>
              <option value="XI-D">Kelas XI-D</option>
              <option value="XI-E">Kelas XI-E</option>
              <option value="XI-F">Kelas XI-F</option>
            </select>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
                className={cn("h-8 text-xs font-medium px-3 rounded-lg", statusFilter === 'ALL' && "bg-blue-600 hover:bg-blue-700 text-white")}
              >
                Semua Siswa ({students.length})
              </Button>
              <Button
                variant={statusFilter === 'HADIR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('HADIR')}
                className={cn("h-8 text-xs font-medium px-3 rounded-lg", statusFilter === 'HADIR' && "bg-blue-600 hover:bg-blue-700 text-white")}
              >
                Hadir Normal
              </Button>
              <Button
                variant={statusFilter === 'IZIN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('IZIN')}
                className={cn("h-8 text-xs font-medium px-3 rounded-lg", statusFilter === 'IZIN' && "bg-blue-600 hover:bg-blue-700 text-white")}
              >
                Sedang Izin / Dispensasi
              </Button>
            </div>
          </div>

          {/* 3. Comprehensive Attendance & Student Table */}
          <Card className="border border-border shadow-xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">No</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nama Siswa</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Status Hari Ini</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      <span title="Sakit">S</span>
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      <span title="Izin Keperluan">I</span>
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      <span title="Dispensasi">D</span>
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      <span title="Tanpa Keterangan / Alfa">A</span>
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kontak Orang Tua / Wali</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 dark:text-zinc-300 pr-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-xs text-muted-foreground">
                        Tidak ditemukan data siswa dengan kriteria pencarian tersebut.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <TableRow key={st.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center text-xs font-medium text-slate-500">
                          {idx + 1}
                        </TableCell>

                        {/* Nama Siswa */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                              {st.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-slate-900 dark:text-zinc-100">{st.name}</p>
                              <span className="text-[10px] text-muted-foreground">
                                {st.gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki'}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status Hari Ini */}
                        <TableCell>
                          {st.currentStatus === 'HADIR' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-600 text-white shadow-2xs">
                              Hadir
                            </span>
                          )}
                          {st.currentStatus === 'IZIN_SAKIT' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-600 text-white shadow-2xs">
                              Izin Sakit
                            </span>
                          )}
                          {st.currentStatus === 'DISPENSASI' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-600 text-white shadow-2xs">
                              Dispensasi
                            </span>
                          )}
                          {st.currentStatus === 'IZIN_KEPERLUAN' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-600 text-white shadow-2xs">
                              Izin Keperluan
                            </span>
                          )}
                        </TableCell>

                        {/* Rekapitulasi S / I / D / A */}
                        <TableCell className="text-center text-xs font-medium text-slate-800 dark:text-zinc-200">
                          {st.sakitDays > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md font-semibold text-xs inline-block">
                              {st.sakitDays}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs font-medium text-slate-800 dark:text-zinc-200">
                          {st.izinDays > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md font-semibold text-xs inline-block">
                              {st.izinDays}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs font-medium text-slate-800 dark:text-zinc-200">
                          {st.dispDays > 0 ? (
                            <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md font-semibold text-xs inline-block">
                              {st.dispDays}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs font-normal text-slate-400">
                          0
                        </TableCell>

                        {/* Kontak Orang Tua / Wali */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-slate-800 dark:text-zinc-200">{st.guardianName || 'Orang Tua'}</p>
                            <a
                              href={`https://wa.me/${(st.guardianPhone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                              title="Chat WhatsApp Wali"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{st.guardianPhone || '-'}</span>
                            </a>
                          </div>
                        </TableCell>

                        {/* Tombol Aksi Riwayat */}
                        <TableCell className="text-right pr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStudentDetail(st)}
                            className="h-8 px-2.5 text-xs font-medium rounded-lg gap-1 border-slate-300 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-600"
                          >
                            <span>Riwayat Izin</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Touch-Friendly Card View */}
            <div className="md:hidden divide-y divide-border p-3 space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Tidak ditemukan data siswa yang sesuai pencarian.
                </div>
              ) : (
                filteredStudents.map((st) => (
                  <div key={st.id} className="p-3.5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">{st.name}</h4>
                          <span className="text-[10px] text-muted-foreground">{st.gender || 'Laki-laki'}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {st.currentStatus === 'HADIR' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-600 text-white shadow-2xs">
                            Hadir
                          </span>
                        )}
                        {st.currentStatus === 'IZIN_SAKIT' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 text-white shadow-2xs">
                            Izin Sakit
                          </span>
                        )}
                        {st.currentStatus === 'DISPENSASI' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-600 text-white shadow-2xs">
                            Dispensasi
                          </span>
                        )}
                        {st.currentStatus === 'IZIN_KEPERLUAN' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-600 text-white shadow-2xs">
                            Izin Keperluan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* S / I / D / A Mini Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-border bg-muted/20 p-2 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Sakit</span>
                        <strong className="text-rose-600 font-semibold text-xs">{st.sakitDays}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Izin</span>
                        <strong className="text-amber-600 font-semibold text-xs">{st.izinDays}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Dispen</span>
                        <strong className="text-blue-600 font-semibold text-xs">{st.dispDays}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Alfa</span>
                        <strong className="text-slate-500 font-semibold text-xs">{st.alfaDays}</strong>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {st.guardianPhone ? (
                        <a
                          href={`https://wa.me/${st.guardianPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Wali</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Wali: {st.guardianName || '-'}</span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudentDetail(st)}
                        className="h-8 px-3 text-xs font-medium rounded-lg border-border"
                      >
                        <span>Riwayat Izin</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          Direct Manual Input Verification Modal with Real Image Previews
          ========================================================================= */}
      <Dialog open={!!selectedReqAction} onOpenChange={(open) => !open && setSelectedReqAction(null)}>
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
                                onClick={() => setPreviewImageModal({ url: att.previewUrl, name: att.name, size: att.size })}
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
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-medium shadow-xs">
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
                                  <span className="shrink-0 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono text-[9px] font-semibold uppercase">
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
                                    onClick={() => setPreviewImageModal({ url: att.previewUrl, name: att.name, size: att.size })}
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
                  onClick={() => setSelectedReqAction(null)}
                  className="h-9 px-3 text-xs font-medium rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  className="h-9 px-3 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleReject}
                >
                  Tolak Pengajuan
                </Button>
                <Button
                  variant="default"
                  className="h-9 px-3.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={handleApprove}
                >
                  Setujui Pengajuan
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          Konsep 3: Side-Sheet Drawer Detail & Riwayat Perizinan Siswa (Panel Kanan)
          ========================================================================= */}
      <Sheet open={!!selectedStudentDetail} onOpenChange={(open) => !open && setSelectedStudentDetail(null)}>
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
              
              {/* Profile & Guardian Card */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {selectedStudentDetail.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">{selectedStudentDetail.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {teacherClass} • {selectedStudentDetail.gender || 'Laki-laki'}
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

                {/* Guardian Info & Quick WhatsApp CTA */}
                <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs">
                    <span className="text-slate-500 text-[11px] block">Orang Tua / Wali:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{selectedStudentDetail.guardianName || 'Orang Tua'}</span>
                  </div>

                  <a
                    href={`https://wa.me/${(selectedStudentDetail.guardianPhone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat WhatsApp Wali</span>
                  </a>
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
                            <span className="font-mono text-xs text-slate-500 font-medium">{req.id}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {req.subType}
                            </span>
                          </div>

                          {/* Solid Status Tags */}
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
                                        onClick={() => setPreviewImageModal({ url: att.previewUrl, name: att.name, size: att.size })}
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
              onClick={() => setSelectedStudentDetail(null)}
              className="h-8 px-3.5 text-xs font-medium rounded-lg"
            >
              Tutup Panel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* =========================================================================
          Image Lightbox / Fullscreen Preview Dialog
          ========================================================================= */}
      <Dialog open={!!previewImageModal} onOpenChange={(open) => !open && setPreviewImageModal(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-border bg-background">
          <DialogHeader className="p-4 border-b border-border text-left flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-zinc-50 truncate">
                  {previewImageModal?.name || 'Pratinjau Dokumen Bukti'}
                </DialogTitle>
                {previewImageModal?.size && (
                  <p className="text-xs text-muted-foreground">{previewImageModal.size} • Dokumen Lampiran Pengajuan</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pr-6">
              {previewImageModal?.url && (
                <a
                  href={previewImageModal.url}
                  download={previewImageModal.name || 'lampiran.jpg'}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-border bg-muted/40 hover:bg-muted text-slate-800 dark:text-zinc-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </a>
              )}
            </div>
          </DialogHeader>

          <div 
            className="p-4 sm:p-6 flex items-center justify-center bg-slate-950/95 min-h-[300px] max-h-[75vh] overflow-auto"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }}
          >
            <img
              src={previewImageModal?.url}
              alt={previewImageModal?.name || 'Dokumen'}
              className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
            />
          </div>

          <div className="p-3 border-t border-border flex items-center justify-between bg-muted/20 text-xs text-muted-foreground">
            <span>Pratinjau berkas verifikasi wali kelas</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewImageModal(null)}
              className="h-8 text-xs font-medium rounded-lg"
            >
              Tutup Pratinjau
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          Standard Shadcn AlertDialog Component
          ========================================================================= */}
      <AlertDialog open={alertState.open} onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className={cn(
                "h-9 px-4 text-xs font-medium rounded-lg",
                alertState.variant === 'destructive' ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              onClick={() => {
                if (alertState.onAction) alertState.onAction();
                setAlertState(prev => ({ ...prev, open: false }));
              }}
            >
              {alertState.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =========================================================================
          Official Print Attendance Preview Modal
          ========================================================================= */}
      <PrintAttendanceModal
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        className={teacherClass}
        students={students}
        requests={requests}
        teacherName={currentUser?.name || "Wali Kelas"}
        teacherNip={currentUser?.nip || "19790812 200501 1 004"}
      />

    </div>
  );
}
