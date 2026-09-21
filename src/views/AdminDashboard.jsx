import React, { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, Lock, Unlock, Cloud } from 'lucide-react';
import PrintAttendanceModal from '../components/PrintAttendanceModal';
import GoogleSheetsSyncModal from '../components/common/GoogleSheetsSyncModal';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { cn } from '../lib/utils';
import { 
  getRequests, 
  getStudents, 
  saveStudent, 
  deleteStudent, 
  getDocuments, 
  getPortalLockMode, 
  setPortalLockMode, 
  isPortalLockedNow 
} from '../services/storage';
import * as XLSX from 'xlsx';

import LiveClockWidget from '../components/common/LiveClockWidget';
import ImageLightboxModal from '../components/common/ImageLightboxModal';
import ConfirmAlertModal from '../components/common/ConfirmAlertModal';
import { isDateMatchingFilter } from '../lib/dateUtils';

import AdminKpiCards from '../components/admin/AdminKpiCards';
import RequestMonitoringTab from '../components/admin/RequestMonitoringTab';
import StudentManagementTab from '../components/admin/StudentManagementTab';
import RequestDetailDrawer from '../components/admin/RequestDetailDrawer';
import StudentFormModal from '../components/admin/StudentFormModal';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setIsCurrentlyLocked(isPortalLockedNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleLockMode = (newMode) => {
    setPortalLockMode(newMode);
    setPortalLockModeState(newMode);
    setIsCurrentlyLocked(isPortalLockedNow());

    showAlert(
      newMode === 'FORCE_UNLOCK' ? 'Akses Portal Siswa Dibuka' : newMode === 'FORCE_LOCKED' ? 'Akses Portal Siswa Terkunci' : 'Mode Akses Otomatis Aktif',
      newMode === 'FORCE_UNLOCK' 
        ? 'Seluruh siswa dapat mengajukan perizinan baru sekarang (Akses darurat/khusus dibuka oleh BK).' 
        : newMode === 'FORCE_LOCKED'
        ? 'Portal pengajuan permohonan siswa dinonaktifkan secara manual oleh BK.'
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
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  // Detail Modal State
  const [selectedReqForTU, setSelectedReqForTU] = useState(null);

  // Image Lightbox Preview Modal State
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Alert State
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
  };

  const handleOpenStudentModal = (st = null) => {
    if (st) {
      setEditingStudent(st);
      setStudentForm({ ...st });
    } else {
      setEditingStudent(null);
      setStudentForm({
        name: '',
        class: 'XI-A',
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
              class: row.Kelas || row.class || 'XI-A',
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
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Perizinan_Siswa');
    XLSX.writeFile(wb, `Rekap_Administrasi_TU_SMAN6_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredRequests = requests.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchClass = classFilter === 'ALL' || r.studentClass === classFilter;
    const matchSearch = r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.subType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDate = isDateMatchingFilter(r.startDate || r.createdAt, dateFilter, customDate);
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
          <LiveClockWidget />

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

          {/* Google Sheets Database Control Button */}
          <Button
            variant="outline"
            onClick={() => setShowSheetsModal(true)}
            className="h-10 px-3.5 text-xs font-medium rounded-xl border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 gap-2 shadow-2xs shrink-0"
          >
            <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Google Sheets Sync</span>
            <span className="sm:hidden">Sheets</span>
          </Button>

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
      <AdminKpiCards 
        totalIzinMasuk={totalIzinMasuk}
        waitingTeacherCount={waitingTeacherCount}
        approvedTotal={approvedTotal}
        totalStudents={students.length}
      />

      {/* 3. TAB: OVERVIEW / ALL_REQUESTS */}
      {(activeTab === 'OVERVIEW' || activeTab === 'ALL_REQUESTS') && (
        <RequestMonitoringTab 
          requests={requests}
          filteredRequests={filteredRequests}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          waitingTeacherCount={waitingTeacherCount}
          approvedTotal={approvedTotal}
          rejectedTotal={rejectedTotal}
          onOpenDetailModal={handleOpenTUModal}
        />
      )}

      {/* 4. TAB: MANAGE_STUDENTS / STUDENTS */}
      {(activeTab === 'MANAGE_STUDENTS' || activeTab === 'STUDENTS') && (
        <StudentManagementTab 
          displayedStudents={displayedStudents}
          studentSearchQuery={studentSearchQuery}
          setStudentSearchQuery={setStudentSearchQuery}
          studentClassFilter={studentClassFilter}
          setStudentClassFilter={setStudentClassFilter}
          onOpenPrintModal={() => setShowAdminPrintModal(true)}
          onMassImportExcel={handleMassImportExcel}
          onOpenStudentModal={handleOpenStudentModal}
          onDeleteStudent={handleDeleteStudentAction}
        />
      )}

      {/* 5. TAB: REPORTS */}
      {activeTab === 'REPORTS' && null}

      {/* 6. Side-Sheet Drawer Detail Laporan */}
      <RequestDetailDrawer 
        selectedReq={selectedReqForTU}
        onClose={() => setSelectedReqForTU(null)}
        onPreviewImage={setPreviewImageModal}
      />

      {/* 7. Modal Tambah / Edit Siswa */}
      <StudentFormModal 
        open={showStudentModal}
        onOpenChange={setShowStudentModal}
        editingStudent={editingStudent}
        studentForm={studentForm}
        setStudentForm={setStudentForm}
        onSave={handleSaveStudent}
      />

      {/* 8. Lightbox Preview Modal */}
      <ImageLightboxModal 
        image={previewImageModal}
        onClose={() => setPreviewImageModal(null)}
      />

      {/* 9. Standard Alert Dialog */}
      <ConfirmAlertModal 
        alertState={alertState}
        onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
      />

      {/* 10. Print Attendance Modal */}
      <PrintAttendanceModal
        open={showAdminPrintModal}
        onOpenChange={setShowAdminPrintModal}
        className={studentClassFilter === 'ALL' ? 'Semua Kelas (XI-A s/d XI-F)' : `Kelas ${studentClassFilter}`}
        students={displayedStudents}
        requests={requests}
        teacherName={currentUser?.name || "Guru BK SMAN 6"}
        teacherNip={currentUser?.nip || "12345"}
      />

      {/* 11. Google Sheets Sync Control Modal */}
      <GoogleSheetsSyncModal
        open={showSheetsModal}
        onOpenChange={setShowSheetsModal}
        onDataRefreshed={loadData}
      />

    </div>
  );
}
