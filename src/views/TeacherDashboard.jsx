import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import PrintAttendanceModal from '../components/PrintAttendanceModal';
import LiveClockWidget from '../components/common/LiveClockWidget';
import ImageLightboxModal from '../components/common/ImageLightboxModal';
import ConfirmAlertModal from '../components/common/ConfirmAlertModal';
import TeacherKpiCards from '../components/teacher/TeacherKpiCards';
import VerificationQueueTab from '../components/teacher/VerificationQueueTab';
import ClassAttendanceTab from '../components/teacher/ClassAttendanceTab';
import VerificationActionModal from '../components/teacher/VerificationActionModal';
import StudentDetailDrawer from '../components/teacher/StudentDetailDrawer';
import { isDateMatchingFilter } from '../lib/dateUtils';
import { getRequests, updateRequestStatus, getStudents, syncFromSheetDb } from '../services/storage';
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

  // Confirm / Alert Modal State
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
    // Immediate background sync on tab/mount
    syncFromSheetDb().then(() => loadData());

    // Auto-poll every 6 seconds to fetch new requests from Google Sheets (e.g. from student devices)
    const pollInterval = setInterval(() => {
      syncFromSheetDb().then(() => loadData());
    }, 6000);

    return () => clearInterval(pollInterval);
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

  const filteredRequestsByDate = requests.filter(r => {
    return isDateMatchingFilter(r.startDate || r.createdAt, dateFilter, customDate);
  });

  const pendingQueue = filteredRequestsByDate.filter(r => r.status === 'MENUNGGU_VERIFIKASI');

  // Compute Per-Student Attendance Statistics (S/I/D/A)
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
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase().trim());
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
        'Status Hari Ini': s.currentStatusLabel,
        'Sakit (S)': s.sakitDays,
        'Izin (I)': s.izinDays,
        'Dispensasi (D)': s.dispDays,
        'Alfa (A)': s.alfaDays,
        'Total Ketidakhadiran': `${s.totalAbsence} Hari`
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
      {/* TAB: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                Selamat Datang, {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
                <span>Wali Kelas:</span>
                <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val)}>
                  <SelectTrigger className="h-8 w-[125px] text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XI-A">Kelas XI-A</SelectItem>
                    <SelectItem value="XI-B">Kelas XI-B</SelectItem>
                    <SelectItem value="XI-C">Kelas XI-C</SelectItem>
                    <SelectItem value="XI-D">Kelas XI-D</SelectItem>
                    <SelectItem value="XI-E">Kelas XI-E</SelectItem>
                    <SelectItem value="XI-F">Kelas XI-F</SelectItem>
                  </SelectContent>
                </Select>
                <span>• Portal Verifikasi & Rekap Presensi Siswa</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiveClockWidget />
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

          <VerificationQueueTab
            activeTab="OVERVIEW"
            pendingQueue={pendingQueue}
            teacherClass={teacherClass}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customDate={customDate}
            setCustomDate={setCustomDate}
            onOpenActionModal={handleOpenActionModal}
            onPreviewImage={setPreviewImageModal}
          />
        </div>
      )}

      {/* TAB: VERIFY */}
      {activeTab === 'VERIFY' && (
        <VerificationQueueTab
          activeTab="VERIFY"
          pendingQueue={pendingQueue}
          teacherClass={teacherClass}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
          onOpenActionModal={handleOpenActionModal}
          onPreviewImage={setPreviewImageModal}
        />
      )}

      {/* TAB: CLASS_STUDENTS */}
      {activeTab === 'CLASS_STUDENTS' && (
        <ClassAttendanceTab
          teacherClass={teacherClass}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          students={students}
          filteredStudents={filteredStudents}
          studentSearch={studentSearch}
          setStudentSearch={setStudentSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalClassStudents={totalClassStudents}
          totalClassSakit={totalClassSakit}
          totalClassIzin={totalClassIzin}
          totalClassDisp={totalClassDisp}
          totalNeedAttention={totalNeedAttention}
          onShowPrintModal={() => setShowPrintModal(true)}
          onExportExcel={handleExportExcel}
          onSelectStudentDetail={setSelectedStudentDetail}
        />
      )}

      {/* Modal Verifikasi */}
      <VerificationActionModal
        selectedReqAction={selectedReqAction}
        onClose={() => setSelectedReqAction(null)}
        actionNote={actionNote}
        setActionNote={setActionNote}
        onApprove={handleApprove}
        onReject={handleReject}
        onPreviewImage={setPreviewImageModal}
      />

      {/* Sheet Drawer Detail Siswa */}
      <StudentDetailDrawer
        selectedStudentDetail={selectedStudentDetail}
        onClose={() => setSelectedStudentDetail(null)}
        teacherClass={teacherClass}
        onPreviewImage={setPreviewImageModal}
      />

      {/* Lightbox Preview */}
      <ImageLightboxModal
        previewImage={previewImageModal}
        onClose={() => setPreviewImageModal(null)}
      />

      {/* Alert Dialog */}
      <ConfirmAlertModal
        open={alertState.open}
        title={alertState.title}
        description={alertState.description}
        actionLabel={alertState.actionLabel}
        variant={alertState.variant}
        onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
        onAction={alertState.onAction}
      />

      {/* Cetak Presensi */}
      <PrintAttendanceModal
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        className={teacherClass}
        students={students}
        requests={requests}
        teacherName={currentUser?.name || "Wali Kelas"}
        teacherNip={currentUser?.nip || "12345"}
      />
    </div>
  );
}
