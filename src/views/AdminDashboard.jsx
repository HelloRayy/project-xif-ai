import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderArchive, 
  BarChart3, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  FileSpreadsheet,
  Eye,
  FileText,
  ImageIcon,
  Paperclip,
  Maximize2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Award,
  Calendar,
  MessageCircle,
  Printer,
  ShieldCheck,
  Send,
  X,
  FileCheck,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import PrintAttendanceModal from '../components/PrintAttendanceModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
import { 
  getRequests, 
  updateRequestStatus, 
  getStudents, 
  saveStudent, 
  deleteStudent, 
  getDocuments, 
  saveDocument,
  getPortalLockMode,
  setPortalLockMode,
  isPortalLockedNow
} from '../services/storage';
import * as XLSX from 'xlsx';

// Helper to generate official school letter registry number
function generateLetterNumber(requestId, index = 1) {
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const now = new Date();
  const monthRoman = romanMonths[now.getMonth()];
  const year = now.getFullYear();
  const seq = String(index).padStart(3, '0');
  return `421.3/SMAN6-TU/${monthRoman}/${year}/${seq}`;
}

export default function AdminDashboard({ currentUser, activeTab }) {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM'
  const [customDate, setCustomDate] = useState('');

  // Portal Lock Mode for Student Access Control
  const [portalLockMode, setPortalLockModeState] = useState(getPortalLockMode());
  const [isCurrentlyLocked, setIsCurrentlyLocked] = useState(isPortalLockedNow());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setIsCurrentlyLocked(isPortalLockedNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleLockMode = (newMode) => {
    setPortalLockMode(newMode);
    setPortalLockModeState(newMode);
    setIsCurrentlyLocked(isPortalLockedNow());
    showAlert(
      'Status Akses Siswa Diperbarui',
      newMode === 'FORCE_UNLOCK' 
        ? 'Portal siswa berhasil dibuka paksa (Override Darurat). Siswa dapat mengajukan izin saat ini.' 
        : newMode === 'FORCE_LOCKED'
        ? 'Portal siswa berhasil dikunci secara manual.'
        : 'Mode operasional portal siswa dikembalikan ke Jadwal Otomatis (07.30 - 15.30 WIB tertutup).',
      'Mengerti'
    );
  };

  // Student Database Filter States
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');

  const displayedStudents = useMemo(() => {
    return students.filter(st => {
      const matchClass = studentClassFilter === 'ALL' || st.class === studentClassFilter;
      const q = studentSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        st.name?.toLowerCase().includes(q) ||
        st.nis?.toLowerCase().includes(q) ||
        st.username?.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, studentClassFilter, studentSearchQuery]);

  const [showAdminPrintModal, setShowAdminPrintModal] = useState(false);

  // TU Action Modal State
  const [selectedReqForTU, setSelectedReqForTU] = useState(null);
  const [tuActionNote, setTuActionNote] = useState('');
  const [generatedLetterNo, setGeneratedLetterNo] = useState('');
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  
  // Dedicated Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // View Official Certificate Modal
  const [viewingCertDoc, setViewingCertDoc] = useState(null);

  // Image Lightbox Preview Modal State
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // shadcn AlertDialog State
  const [alertState, setAlertState] = useState({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Mengerti',
    cancelLabel: null,
    variant: 'default',
    onConfirm: null
  });

  const showAlert = (title, description, confirmLabel = 'Mengerti', cancelLabel = null, variant = 'default', onConfirm = null) => {
    setAlertState({
      open: true,
      title,
      description,
      confirmLabel,
      cancelLabel,
      variant,
      onConfirm
    });
  };

  // Student CRUD Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    class: 'XI-A',
    gender: 'Laki-laki',
    guardianName: '',
    guardianPhone: '',
    email: '',
    phone: '',
    status: 'Aktif'
  });

  useEffect(() => {
    loadData();
  }, [currentUser, activeTab]);

  const loadData = () => {
    setRequests(getRequests());
    setStudents(getStudents());
    setDocuments(getDocuments());
  };

  const handleOpenTUModal = (req) => {
    setSelectedReqForTU(req);
    setTuActionNote('');
    const docs = getDocuments();
    const letterNo = req.letterNumber || generateLetterNumber(req.id, docs.length + 1);
    setGeneratedLetterNo(letterNo);
    setShowCertificatePreview(false);
  };

  const handleTUApprove = () => {
    if (!selectedReqForTU) return;

    const letterNo = generatedLetterNo || generateLetterNumber(selectedReqForTU.id, documents.length + 1);

    updateRequestStatus(
      selectedReqForTU.id,
      'DISETUJUI',
      tuActionNote || 'Surat resmi telah disahkan dan diterbitkan oleh Tata Usaha.',
      currentUser
    );

    saveDocument({
      title: `${selectedReqForTU.subType} - ${selectedReqForTU.studentName} (${selectedReqForTU.studentClass})`,
      category: selectedReqForTU.subType,
      letterNumber: letterNo,
      requestId: selectedReqForTU.id,
      studentId: selectedReqForTU.studentId,
      studentName: selectedReqForTU.studentName,
      studentClass: selectedReqForTU.studentClass,
      fileName: `Surat_Resmi_${selectedReqForTU.id}.pdf`,
      fileSize: '512 KB',
      uploadedBy: currentUser.name,
      note: tuActionNote || 'Diterbitkan secara resmi oleh Tata Usaha SMAN 6 Semarang',
      purpose: selectedReqForTU.purpose,
      timeSpan: selectedReqForTU.timeSpanFormatted || `${selectedReqForTU.startDate} s/d ${selectedReqForTU.endDate}`
    });

    const reqId = selectedReqForTU.id;
    setSelectedReqForTU(null);
    setTuActionNote('');
    loadData();

    showAlert(
      'Surat Resmi Berhasil Diterbitkan',
      `Pengajuan ${reqId} telah disahkan dengan Nomor Surat: ${letterNo}. Dokumen resmi telah diarsipkan di portal dan siswa dapat mengunduhnya secara instan.`,
      'Selesai'
    );
  };

  const handleOpenRejectModal = () => {
    if (!selectedReqForTU) return;
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedReqForTU || !rejectReason.trim()) return;

    const reqId = selectedReqForTU.id;
    const note = rejectReason.trim();
    updateRequestStatus(selectedReqForTU.id, 'DITOLAK', note, currentUser);
    setRejectModalOpen(false);
    setSelectedReqForTU(null);
    setRejectReason('');
    loadData();

    showAlert('Pengajuan Ditolak', `Pengajuan ${reqId} telah ditolak dengan catatan: "${note}".`, 'Selesai');
  };

  const handleOpenStudentModal = (st = null) => {
    if (st) {
      setEditingStudent(st);
      setStudentForm({ ...st });
    } else {
      setEditingStudent(null);
      setStudentForm({
        name: '',
        class: 'X-IPA 1',
        gender: 'Laki-laki',
        guardianName: '',
        guardianPhone: '',
        email: '',
        phone: '',
        status: 'Aktif'
      });
    }
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) {
      showAlert('Data Belum Lengkap', 'Mohon isi nama lengkap siswa.', 'Lengkapi Data', null, 'destructive');
      return;
    }

    const stData = {
      id: editingStudent ? editingStudent.id : `usr-student-${Date.now()}`,
      ...studentForm
    };

    saveStudent(stData);
    setShowStudentModal(false);
    loadData();
    showAlert('Data Siswa Tersimpan', 'Data identitas siswa berhasil diperbarui dalam database sekolah.', 'Selesai');
  };

  const handleDeleteStudentAction = (id) => {
    showAlert(
      'Hapus Data Siswa',
      'Apakah Anda yakin ingin menghapus data siswa ini dari database?',
      'Ya, Hapus Data',
      'Batal',
      'destructive',
      () => {
        deleteStudent(id);
        loadData();
      }
    );
  };

  const handleMassImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        let count = 0;
        rawData.forEach((row, i) => {
          if (row.Nama || row.name) {
            saveStudent({
              id: `usr-student-imp-${Date.now()}-${i}`,
              name: row.Nama || row.name,
              class: row.Kelas || row.class || 'X-IPA 1',
              gender: row.Gender || row.gender || 'Laki-laki',
              guardianName: row.Wali || row.guardianName || 'Orang Tua',
              guardianPhone: row.HP || row.guardianPhone || '0812-3456-7890',
              status: 'Aktif'
            });
            count++;
          }
        });

        loadData();
        showAlert('Impor Berhasil', `Berhasil mengimpor ${count} data siswa dari file Excel!`, 'Selesai');
      } catch (err) {
        showAlert('Gagal Membaca File', 'Gagal memproses file Excel/CSV. Pastikan format tabel sesuai standar.', 'Tutup', null, 'destructive');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const exportData = filteredRequests.map(r => ({
      'ID Pengajuan': r.id,
      'Nama Siswa': r.studentName,
      'Kelas': r.studentClass,
      'Kategori': r.type,
      'Jenis Layanan': r.subType,
      'Tujuan': r.purpose,
      'Tanggal Mulai': r.startDate,
      'Tanggal Selesai': r.endDate,
      'Status Pengajuan': r.status,
      'Nomor Surat TU': r.letterNumber || '-',
      'Catatan Wali Kelas': r.teacherNote || '',
      'Catatan TU': r.adminNote || '',
      'Tanggal Dibuat': r.createdAt
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Administrasi TU');
    XLSX.writeFile(wb, `Rekap_Administrasi_TU_SMAN6_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Date Filtering Helper
  const isDateMatchingFilter = (dateStr) => {
    if (dateFilter === 'ALL' || !dateStr) return true;
    
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

  const filteredRequests = requests.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchClass = classFilter === 'ALL' || r.studentClass === classFilter;
    const matchSearch = r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.subType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDate = isDateMatchingFilter(r.startDate || r.createdAt);
    return matchStatus && matchClass && matchSearch && matchDate;
  });

  const totalIzinMasuk = requests.length;
  const waitingTeacherCount = requests.filter(r => r.status === 'MENUNGGU_VERIFIKASI').length;
  const approvedTotal = requests.filter(r => r.status === 'DISETUJUI').length;
  const rejectedTotal = requests.filter(r => r.status === 'DITOLAK').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Minimalis & Kontrol Emergency Lock Siswa */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Bimbingan & Konseling (BK)
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
              Guru BK
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitoring perizinan terpadu siswa (XI-A s/d XI-F), rekap absensi, dan kontrol akses portal siswa.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Real-time WIB Clock Widget - Borderless Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted/50 dark:bg-zinc-900/60">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium text-muted-foreground leading-none">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="font-sans text-xs sm:text-sm font-bold text-foreground leading-tight mt-0.5 tracking-tight">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-border/80" />

          {/* Portal Siswa Access Toggle Switch */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-card shadow-2xs">
            <div className="flex items-center gap-2">
              {!isCurrentlyLocked ? (
                <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Unlock className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold leading-none">Akses Siswa</span>
                <span className={cn("text-xs font-bold leading-tight mt-0.5", !isCurrentlyLocked ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                  {!isCurrentlyLocked ? "Terbuka" : "Terkunci"}
                </span>
              </div>
            </div>

            <Switch
              checked={!isCurrentlyLocked}
              onCheckedChange={(checked) => {
                handleToggleLockMode(checked ? 'FORCE_UNLOCK' : 'FORCE_LOCKED');
              }}
              aria-label="Toggle Akses Portal Siswa"
            />
          </div>

          {/* Export Excel Button */}
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="h-10 px-3.5 text-xs font-medium rounded-xl border-border hover:bg-muted gap-2 shadow-2xs shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor Rekap (.xlsx)</span>
            <span className="sm:hidden">Ekspor</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Laporan Masuk</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{totalIzinMasuk}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Laporan izin siswa kelas XI-A s/d XI-F</p>
        </Card>

        <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Menunggu Verifikasi Wali</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{waitingTeacherCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Antrean verifikasi oleh Wali Kelas</p>
        </Card>

        <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Izin Terverifikasi</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{approvedTotal}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Telah disetujui Wali Kelas</p>
        </Card>

        <Card className="p-4 rounded-xl border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Siswa Binaan</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mt-1.5">{students.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Siswa terdaftar kelas XI-A s/d XI-F</p>
        </Card>
      </div>

      {/* =========================================================================
          TAB: OVERVIEW / ALL_REQUESTS (Antrean Pengesahan & Log Perizinan Terpusat)
          ========================================================================= */}
      {(activeTab === 'OVERVIEW' || activeTab === 'ALL_REQUESTS') && (
        <Card className="rounded-2xl border-border shadow-xs overflow-hidden bg-card">
          
          {/* 1. Header Toolbar & Search Filter */}
          <div className="p-4 sm:p-5 border-b border-border bg-muted/10 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Monitoring Laporan Perizinan Siswa Terpadu</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daftar seluruh laporan izin, dispensasi, dan ketidakhadiran siswa dari kelas XI-A s/d XI-F.
                </p>
              </div>

              {/* Search, Date Filter & Class Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Cari nama siswa / ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background rounded-xl border-border w-full"
                  />
                </div>

                {/* Date Filter Dropdown */}
                <div className="flex items-center gap-1.5">
                  <Select value={dateFilter} onValueChange={(val) => setDateFilter(val)}>
                    <SelectTrigger className="h-9 w-[145px] text-xs font-medium">
                      <SelectValue placeholder="Pilih Tanggal" />
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
                      className="h-9 px-2 text-xs bg-background border border-border rounded-xl font-sans text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    />
                  )}
                </div>

                {/* Class Filter Dropdown */}
                <Select value={classFilter} onValueChange={(val) => setClassFilter(val)}>
                  <SelectTrigger className="h-9 w-[130px] text-xs font-medium">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kelas</SelectItem>
                    <SelectItem value="XI-A">Kelas XI-A</SelectItem>
                    <SelectItem value="XI-B">Kelas XI-B</SelectItem>
                    <SelectItem value="XI-C">Kelas XI-C</SelectItem>
                    <SelectItem value="XI-D">Kelas XI-D</SelectItem>
                    <SelectItem value="XI-E">Kelas XI-E</SelectItem>
                    <SelectItem value="XI-F">Kelas XI-F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2. Interactive Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
                  statusFilter === 'ALL'
                    ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
                )}
              >
                Semua Permohonan ({requests.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('MENUNGGU_VERIFIKASI')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
                  statusFilter === 'MENUNGGU_VERIFIKASI'
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
                )}
              >
                Menunggu Wali ({waitingTeacherCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('DISETUJUI')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
                  statusFilter === 'DISETUJUI'
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
                )}
              >
                Disetujui ({approvedTotal})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('DITOLAK')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap cursor-pointer",
                  statusFilter === 'DITOLAK'
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-background hover:bg-muted text-slate-600 dark:text-zinc-400 border border-border"
                )}
              >
                Ditolak ({rejectedTotal})
              </button>
            </div>
          </div>

          {/* 3. High-End Table Content */}
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                    <TableHead className="w-32 py-3 px-4 text-xs font-semibold whitespace-nowrap">ID Pengajuan</TableHead>
                    <TableHead className="min-w-[180px] py-3 px-4 text-xs font-semibold whitespace-nowrap">Nama Siswa</TableHead>
                    <TableHead className="w-28 py-3 px-4 text-xs font-semibold whitespace-nowrap">Kelas</TableHead>
                    <TableHead className="min-w-[190px] py-3 px-4 text-xs font-semibold whitespace-nowrap">Jenis Layanan</TableHead>
                    <TableHead className="min-w-[240px] py-3 px-4 text-xs font-semibold">Keperluan & Waktu</TableHead>
                    <TableHead className="w-36 py-3 px-4 text-xs font-semibold whitespace-nowrap">Status</TableHead>
                    <TableHead className="w-32 py-3 px-4 text-right text-xs font-semibold whitespace-nowrap pr-5">Aksi BK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-600" />
                        <p className="font-semibold text-slate-700 dark:text-zinc-300">Tidak ada data permohonan yang sesuai filter</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Silakan pilih status lain atau bersihkan kotak pencarian.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                        {/* ID */}
                        <TableCell className="py-3.5 px-4 font-sans text-xs text-slate-600 dark:text-zinc-400 font-semibold whitespace-nowrap">
                          {r.id}
                        </TableCell>

                        {/* Nama Siswa */}
                        <TableCell className="py-3.5 px-4 min-w-[180px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-900/60">
                              {r.studentName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate block">
                                {r.studentName}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Kelas */}
                        <TableCell className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {r.studentClass}
                          </span>
                        </TableCell>

                        {/* Jenis Layanan */}
                        <TableCell className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 shadow-2xs">
                            {r.subType}
                          </span>
                        </TableCell>

                        {/* Keperluan / Waktu */}
                        <TableCell className="py-3.5 px-4 max-w-sm">
                          <p className="text-xs text-slate-800 dark:text-zinc-200 font-medium leading-snug line-clamp-1">
                            {r.purpose}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5 px-4 whitespace-nowrap">
                          {r.status === 'DISETUJUI' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-2xs">
                              Disetujui
                            </span>
                          )}
                          {r.status === 'DIPROSES_TU' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 text-white shadow-2xs">
                              <Clock className="w-3 h-3" />
                              <span>Diproses</span>
                            </span>
                          )}
                          {r.status === 'MENUNGGU_VERIFIKASI' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 text-white shadow-2xs">
                              Menunggu Wali
                            </span>
                          )}
                          {r.status === 'DITOLAK' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-600 text-white shadow-2xs">
                              Ditolak
                            </span>
                          )}
                        </TableCell>

                        {/* Aksi BK: Murni Detail Laporan */}
                        <TableCell className="py-3.5 px-4 text-right whitespace-nowrap pr-5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenTUModal(r)}
                            className="h-8 px-3 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 border-border hover:bg-muted transition-all"
                          >
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-purple-600" />
                              <span>Detail Laporan</span>
                            </span>
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
              {filteredRequests.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  Tidak ada permohonan yang sesuai filter.
                </div>
              ) : (
                filteredRequests.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-border bg-card space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400">{r.id}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {r.studentClass}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 mt-1">{r.studentName}</h4>
                      </div>
                      <div className="shrink-0">
                        {r.status === 'DISETUJUI' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-600 text-white shadow-2xs">
                            Disetujui
                          </span>
                        )}
                        {r.status === 'DIPROSES_TU' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-600 text-white shadow-2xs">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Diproses TU</span>
                          </span>
                        )}
                        {r.status === 'MENUNGGU_VERIFIKASI' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-600 text-white shadow-2xs">
                            Menunggu Wali
                          </span>
                        )}
                        {r.status === 'DITOLAK' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 text-white shadow-2xs">
                            Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        {r.subType}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">{r.purpose}</p>
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        Waktu: {r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}
                      </p>
                    </div>

                    <div className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTUModal(r)}
                        className="w-full h-8 text-xs font-medium rounded-lg border-border"
                      >
                        Buka Detail Laporan
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========================================================================
          TAB: MANAGE_STUDENTS / STUDENTS (Data Siswa & Impor Excel)
          ========================================================================= */}
      {(activeTab === 'MANAGE_STUDENTS' || activeTab === 'STUDENTS') && (
        <Card className="rounded-xl border-border shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Manajemen Database Siswa Sekolah</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Kelola identitas siswa, wali murid, dan impor massal database kelas via file spreadsheet.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminPrintModal(true)}
                  className="h-8 px-3 text-xs font-medium border-blue-300 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Cetak Rekap Presensi (PDF)</span>
                </Button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Impor Excel (.xlsx)</span>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleMassImportExcel} className="hidden" />
                </label>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleOpenStudentModal()}
                  className="h-8 px-3 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Search & Class Filter Bar for Students */}
            <div className="p-3 border-b border-border bg-muted/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa, NIS, atau orang tua..."
                  className="pl-9 h-9 text-xs bg-background"
                />
              </div>
              <Select value={studentClassFilter} onValueChange={(val) => setStudentClassFilter(val)}>
                <SelectTrigger className="h-9 w-[190px] text-xs font-medium shrink-0">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kelas ({students.length} Siswa)</SelectItem>
                  <SelectItem value="XI-A">Kelas XI-A</SelectItem>
                  <SelectItem value="XI-B">Kelas XI-B</SelectItem>
                  <SelectItem value="XI-C">Kelas XI-C</SelectItem>
                  <SelectItem value="XI-D">Kelas XI-D</SelectItem>
                  <SelectItem value="XI-E">Kelas XI-E</SelectItem>
                  <SelectItem value="XI-F">Kelas XI-F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-12 text-center text-xs font-semibold">No</TableHead>
                    <TableHead className="text-xs font-semibold">Nama Lengkap</TableHead>
                    <TableHead className="w-24 text-xs font-semibold">Gender</TableHead>
                    <TableHead className="w-28 text-xs font-semibold">Kelas</TableHead>
                    <TableHead className="w-24 text-right text-xs font-semibold pr-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedStudents.map((st, idx) => (
                    <TableRow key={st.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-sans text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100">{st.name}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {st.gender || 'Laki-laki'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {st.class}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-4 space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenStudentModal(st)}
                          className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-blue-600 rounded-md"
                          title="Edit Siswa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudentAction(st.id)}
                          className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-rose-600 rounded-md"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Touch-Friendly Card View */}
            <div className="md:hidden divide-y divide-border p-3 space-y-3">
              {displayedStudents.map((st) => (
                <div key={st.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                        {st.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">{st.name}</h4>
                        <span className="text-[10px] text-muted-foreground">{st.gender || 'Laki-laki'}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {st.class}
                    </span>
                  </div>

                  <div className="flex items-center justify-end text-xs pt-1 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenStudentModal(st)}
                        className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-blue-600 rounded-md"
                        title="Edit Data Siswa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStudentAction(st.id)}
                        className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-rose-600 rounded-md"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}



      {/* =========================================================================
          TAB: REPORTS (Statistik Administrasi & Efisiensi)
          ========================================================================= */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          <Card className="rounded-xl border-border shadow-xs">
            <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Statistik & Ringkasan Digitalisasi Sekolah</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Indikator kinerja tata usaha, waktu respons, dan penghematan administrasi paperless.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="h-8 px-3 text-xs font-medium rounded-lg border-border gap-1.5 shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Laporan Lengkap (.xlsx)</span>
              </Button>
            </CardHeader>

            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border">
                  <p className="text-xs font-medium text-muted-foreground">Tingkat Penyelesaian Pengajuan</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    {requests.length > 0 ? `${((approvedTotal / requests.length) * 100).toFixed(0)}%` : '100%'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Disahkan secara digital tanpa berkas hilang</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border">
                  <p className="text-xs font-medium text-muted-foreground">Rata-rata Waktu Terbit Surat</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">1 Hari Kerja</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Memangkas proses manual (sebelumnya 3-5 hari)</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border">
                  <p className="text-xs font-medium text-muted-foreground">Efisiensi Paperless</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">100% Digital</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Bebas antrean fisik di ruang Tata Usaha</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================================
          DRAWER: Side-Sheet Detail Laporan Siswa untuk Guru BK (Panel Kanan Layar)
          ========================================================================= */}
      <Sheet open={!!selectedReqForTU} onOpenChange={(open) => !open && setSelectedReqForTU(null)}>
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

          {selectedReqForTU && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Request Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-purple-600 dark:text-purple-400">{selectedReqForTU.id}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {selectedReqForTU.subType}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Siswa Pemohon:</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{selectedReqForTU.studentName} ({selectedReqForTU.studentClass})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Periode Izin / Waktu:</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{selectedReqForTU.timeSpanFormatted || `${selectedReqForTU.startDate} s/d ${selectedReqForTU.endDate}`}</strong>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-border">
                  <span className="text-slate-500 text-[11px] block">Alasan Pengajuan:</span>
                  <p className="text-slate-800 dark:text-zinc-200 mt-0.5">{selectedReqForTU.purpose}</p>
                </div>
                {selectedReqForTU.teacherNote && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <strong>Catatan Wali Kelas:</strong> "{selectedReqForTU.teacherNote}"
                  </div>
                )}
              </div>

              {/* Attachments Preview */}
              {selectedReqForTU.attachments && selectedReqForTU.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                      <span>Lampiran Bukti / Surat Dokter ({selectedReqForTU.attachments.length})</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedReqForTU.attachments.map((att, i) => {
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
                              onClick={() => setPreviewImageModal({ url: att.previewUrl, name: att.name, size: att.size })}
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
                  {selectedReqForTU.status === 'DISETUJUI' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Telah Diverifikasi & Disetujui</span>
                    </span>
                  )}
                  {selectedReqForTU.status === 'MENUNGGU_VERIFIKASI' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600 text-white shadow-2xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Menunggu Tindak Lanjut Wali Kelas</span>
                    </span>
                  )}
                  {selectedReqForTU.status === 'DITOLAK' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-600 text-white shadow-2xs">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Ditolak oleh Wali Kelas</span>
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Drawer Sticky Footer: Pure Close Button for BK Monitoring */}
          {selectedReqForTU && (
            <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={() => setSelectedReqForTU(null)}
                className="h-9 px-4 text-xs font-medium rounded-lg border-border"
              >
                Tutup Pratinjau
              </Button>
            </div>
          )}

        </SheetContent>
      </Sheet>

      {/* =========================================================================
          MODAL: Alasan Penolakan Berkas (Dedicated Rejection Dialog)
          ========================================================================= */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md p-5 border-border bg-card">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-900 shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
                Alasan Penolakan Berkas
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Mohon berikan catatan alasan penolakan atau instruksi revisi agar siswa dapat memahami kendala dokumennya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2 text-xs">
            {/* Rejection Textarea */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-900 dark:text-zinc-100 block">
                Catatan Penolakan untuk Siswa:
              </label>
              <Textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tuliskan catatan alasan penolakan secara spesifik di sini..."
                className="min-h-[120px] text-xs rounded-xl bg-background border-border"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                className="h-9 px-3.5 text-xs rounded-lg border-border"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="h-9 px-4 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Konfirmasi Tolak Pengajuan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL: Pratinjau Dokumen Resmi Terbit (Certificate Viewer)
          ========================================================================= */}
      <Dialog open={!!viewingCertDoc} onOpenChange={(open) => !open && setViewingCertDoc(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 border-border bg-white text-slate-900">
          {viewingCertDoc && (
            <div className="space-y-4 text-xs font-sans">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Pemerintah Provinsi Jawa Tengah • Dinas Pendidikan</p>
                <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">SMA NEGERI 6 SEMARANG</h3>
                <p className="text-[10px] text-slate-600">Jl. Ronggolawe No. 4, Semarang Barat • Telp. (024) 7605928 • Web: sman6semarang.sch.id</p>
              </div>

              {/* Title */}
              <div className="text-center space-y-0.5 pt-2">
                <h4 className="text-sm font-bold uppercase underline tracking-wide text-slate-950">{viewingCertDoc.category || viewingCertDoc.title}</h4>
                <p className="text-xs font-sans text-slate-700">Nomor: {viewingCertDoc.letterNumber || `421.3/SMAN6-TU/VIII/2026/01`}</p>
              </div>

              {/* Body */}
              <div className="text-xs leading-relaxed space-y-2.5 text-slate-800 pt-2">
                <p>Kepala Bagian Tata Usaha SMA Negeri 6 Semarang menerangkan dengan sebenarnya bahwa:</p>
                <div className="pl-4 space-y-1 text-xs">
                  <p><strong>Nama Lengkap</strong> : {viewingCertDoc.studentName}</p>
                  <p><strong>Status Siswa</strong> : Siswa Terdaftar Aktif Tahun Ajaran 2025/2026</p>
                  {viewingCertDoc.purpose && <p><strong>Keperluan</strong> : {viewingCertDoc.purpose}</p>}
                </div>
                <p>Surat keterangan ini diterbitkan secara sah melalui Portal Administrasi Digital Sekolah dan dapat diverifikasi keasliannya di Bagian Tata Usaha.</p>
              </div>

              {/* Signature & Stamp */}
              <div className="pt-4 flex justify-end">
                <div className="text-center relative pr-4">
                  <p className="text-[11px] text-slate-600">Semarang, {viewingCertDoc.uploadedAt ? viewingCertDoc.uploadedAt.split(' ')[0] : '2026-08-23'}</p>
                  <p className="text-[11px] font-semibold mt-0.5">Kepala Bagian Tata Usaha</p>
                  
                  <div className="relative py-3 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600 text-blue-700 flex flex-col items-center justify-center text-[7px] font-bold rotate-[-12deg]">
                      <span>★ SMAN 6 ★</span>
                      <span>TATA USAHA</span>
                      <span>SEMARANG</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold underline text-slate-950">{viewingCertDoc.uploadedBy || 'Hj. Ratna Sari, S.E.'}</p>
                </div>
              </div>

              {/* Print CTA */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingCertDoc(null)}
                  className="h-8 px-3 text-xs"
                >
                  Tutup
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL: Tambah / Edit Siswa
          ========================================================================= */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="sm:max-w-md p-5 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
              {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Masukkan identitas dan kelas siswa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStudent} className="space-y-3.5 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-900 dark:text-zinc-100">Nama Lengkap Siswa</label>
              <Input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Contoh: Muhammad Rizky Pratama"
                className="h-9 text-xs rounded-lg bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Kelas</label>
                <Select
                  value={studentForm.class}
                  onValueChange={(val) => setStudentForm({ ...studentForm, class: val })}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XI-A">XI-A</SelectItem>
                    <SelectItem value="XI-B">XI-B</SelectItem>
                    <SelectItem value="XI-C">XI-C</SelectItem>
                    <SelectItem value="XI-D">XI-D</SelectItem>
                    <SelectItem value="XI-E">XI-E</SelectItem>
                    <SelectItem value="XI-F">XI-F</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Jenis Kelamin</label>
                <Select
                  value={studentForm.gender}
                  onValueChange={(val) => setStudentForm({ ...studentForm, gender: val })}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student info inputs */}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStudentModal(false)}
                className="h-9 px-3.5 text-xs rounded-lg border-border"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Simpan Data Siswa
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          LIGHTBOX: Image Attachment Full View Modal
          ========================================================================= */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-card border-b border-border flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">{previewImageModal.name}</h4>
                <p className="text-[10px] text-muted-foreground">{previewImageModal.size || 'Lampiran Dokumen Resmi'}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPreviewImageModal(null)}
                className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950/20 max-h-[calc(90vh-100px)]">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SHADCN ALERT DIALOG
          ========================================================================= */}
      <AlertDialog open={alertState.open} onOpenChange={(open) => !open && setAlertState(prev => ({ ...prev, open }))}>
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
            {alertState.cancelLabel && (
              <AlertDialogCancel className="h-9 px-3 text-xs font-medium rounded-lg">
                {alertState.cancelLabel}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className={cn(
                "h-9 px-4 text-xs font-medium rounded-lg text-white",
                alertState.variant === 'destructive' ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => {
                if (alertState.onConfirm) alertState.onConfirm();
                setAlertState(prev => ({ ...prev, open: false }));
              }}
            >
              {alertState.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =========================================================================
          Official Print Attendance Preview Modal
          ========================================================================= */}
      <PrintAttendanceModal
        open={showAdminPrintModal}
        onOpenChange={setShowAdminPrintModal}
        className={studentClassFilter === 'ALL' ? 'Semua Kelas (XI-A s/d XI-F)' : `Kelas ${studentClassFilter}`}
        students={displayedStudents}
        requests={requests}
        teacherName={currentUser?.name || "Hj. Ratna Sari, S.E."}
        teacherNip={currentUser?.nip || "12345"}
      />

    </div>
  );
}
