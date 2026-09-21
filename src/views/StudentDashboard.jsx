import React, { useState, useEffect } from 'react';
import StudentOverviewTab from '../components/student/StudentOverviewTab';
import NewRequestForm from '../components/student/NewRequestForm';
import RequestHistoryTab from '../components/student/RequestHistoryTab';
import MyDocumentsTab from '../components/student/MyDocumentsTab';
import StudentRequestDetailDrawer from '../components/student/StudentRequestDetailDrawer';
import SubmissionSuccessModal from '../components/student/SubmissionSuccessModal';
import ImageLightboxModal from '../components/common/ImageLightboxModal';
import ConfirmAlertModal from '../components/common/ConfirmAlertModal';
import { getRequests, createRequest, cancelRequest, getDocuments, syncFromSheetDb } from '../services/storage';
import { defaultTeachers } from '../data/initialData';
import { PERMIT_SERVICES, JP_SCHEDULE, isPeriodPassed } from '../components/student/studentConstants';
import { formatDateToIso } from '../lib/dateUtils';

export default function StudentDashboard({ currentUser, activeTab, setActiveTab, isLocked = false }) {
  const [requests, setRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);

  // Single-Pass Form State
  const [openServiceCombobox, setOpenServiceCombobox] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  // Date Picker States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);

  // JP States
  const [startPeriod, setStartPeriod] = useState(null);
  const [endPeriod, setEndPeriod] = useState(null);
  const [selectingStart, setSelectingStart] = useState(null);
  const [hoveredPeriod, setHoveredPeriod] = useState(null);

  const [purpose, setPurpose] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [formSuccessMsg, setFormSuccessMsg] = useState('');
  
  // Submission Success Modal
  const [submittedSuccessModal, setSubmittedSuccessModal] = useState(null);
  
  // Image Lightbox Preview Modal State
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Alert Dialog State
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

  useEffect(() => {
    loadData();
    // Immediate background sync on tab/mount
    syncFromSheetDb().then(() => loadData());

    // Auto-poll every 6 seconds to update permission status from teacher approvals
    const pollInterval = setInterval(() => {
      syncFromSheetDb().then(() => loadData());
    }, 6000);

    return () => clearInterval(pollInterval);
  }, [currentUser, activeTab]);

  const loadData = () => {
    if (!currentUser) return;
    const allReqs = getRequests().filter(r => r.studentId === currentUser.id || r.studentName === currentUser.name);
    setRequests(allReqs);

    const allDocs = getDocuments().filter(d => d.studentId === currentUser.id);
    setDocuments(allDocs);
  };

  const allServices = PERMIT_SERVICES.flatMap(cat => cat.items);
  const activeService = allServices.find(s => s.id === selectedServiceId) || null;
  const isDispensation = activeService ? activeService.type === 'DISPENSASI' : false;

  const handleSubmitRequest = (e) => {
    e.preventDefault();

    if (!activeService) {
      showAlert('Pilih Jenis Izin', 'Mohon pilih jenis izin atau permohonan dispensasi yang ingin diajukan terlebih dahulu.', 'Pilih Jenis Izin', null, 'destructive');
      return;
    }

    if (!purpose.trim()) {
      showAlert('Alasan Pengajuan Wajib Diisi', 'Mohon tuliskan rincian alasan atau detail keperluan permohonan izin.', 'Kembali Mengisi', null, 'destructive');
      return;
    }

    if (isDispensation && !isMultiDay) {
      if (startPeriod === null || endPeriod === null) {
        showAlert('Pilih Jam Pelajaran', 'Mohon tentukan jam pelajaran yang diajukan dengan mengklik nomor jam pelajaran di formulir.', 'Pilih Jam', null, 'destructive');
        return;
      }
    }

    const startJpObj = JP_SCHEDULE.find(j => j.period === startPeriod) || JP_SCHEDULE[0];
    const endJpObj = JP_SCHEDULE.find(j => j.period === endPeriod) || JP_SCHEDULE[JP_SCHEDULE.length - 1];

    if (isDispensation && !isMultiDay && isPeriodPassed(selectedDate, endJpObj)) {
      showAlert('Jam Pelajaran Terlewat', 'Jam pelajaran yang dipilih telah terlewat. Mohon pilih jam pelajaran yang masih aktif.', 'Perbaiki Jam', null, 'destructive');
      return;
    }

    const startIso = isMultiDay ? formatDateToIso(dateRange?.from || selectedDate) : formatDateToIso(selectedDate);
    const endIso = isMultiDay ? formatDateToIso(dateRange?.to || selectedDate) : formatDateToIso(selectedDate);

    let timeFormatted = '';
    if (isDispensation && !isMultiDay) {
      timeFormatted = `${startIso} • Jam ke ${startPeriod}-${endPeriod} (${startJpObj.start} - ${endJpObj.end})`;
    } else if (isMultiDay && dateRange?.from && dateRange?.to) {
      timeFormatted = `${startIso} s/d ${endIso}`;
    } else {
      timeFormatted = `${startIso} (1 Hari Penuh)`;
    }

    const waliKelasObj = defaultTeachers.find(t => t.assignedClass === (currentUser.class || 'XI-A'));
    const dynamicTeacherName = waliKelasObj ? waliKelasObj.name : 'Ahmad Dahlan, S.Pd.';

    const newReqData = {
      type: activeService.type,
      subType: activeService.label,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNis: currentUser.nis || '2026110101',
      studentClass: currentUser.class || 'XI-A',
      teacherName: dynamicTeacherName,
      purpose,
      startDate: startIso,
      endDate: endIso,
      timeSpanFormatted: timeFormatted,
      startPeriod: (isDispensation && !isMultiDay) ? startPeriod : undefined,
      endPeriod: (isDispensation && !isMultiDay) ? endPeriod : undefined,
      periodTime: (isDispensation && !isMultiDay) ? `${startJpObj.start} - ${endJpObj.end}` : undefined,
      isMultiDay,
      attachments
    };

    const createdReq = createRequest(newReqData);
    
    setSelectedServiceId('');
    setPurpose('');
    setAttachments([]);
    setStartPeriod(null);
    setEndPeriod(null);
    loadData();
    
    setSubmittedSuccessModal(createdReq);
  };

  const handleCancelRequest = (reqId) => {
    showAlert(
      'Konfirmasi Pembatalan',
      `Apakah Anda yakin ingin membatalkan pengajuan ${reqId}? Tindakan ini tidak dapat dibatalkan.`,
      'Ya, Batalkan',
      'Kembali',
      'destructive',
      () => {
        cancelRequest(reqId, currentUser.id);
        loadData();
      }
    );
  };

  const approvedCount = requests.filter(r => r.status === 'DISETUJUI').length;
  const pendingCount = requests.filter(r => r.status === 'MENUNGGU_VERIFIKASI' || r.status === 'DIPROSES_TU').length;

  return (
    <div className="w-full">
      {/* TAB: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <StudentOverviewTab
          currentUser={currentUser}
          isLocked={isLocked}
          requests={requests}
          documents={documents}
          approvedCount={approvedCount}
          pendingCount={pendingCount}
          setActiveTab={setActiveTab}
          onSelectReqDetail={setSelectedReqDetail}
          onShowLockAlert={() => {
            showAlert(
              'Layanan Izin Ditutup Sementara',
              'Pengajuan permohonan surat izin baru ditutup sementara selama jam pelajaran sekolah aktif (07.30 - 15.30 WIB) atau saat dinonaktifkan oleh Guru BK. Anda tetap dapat memantau status permohonan yang telah diajukan dan mengunduh berkas surat yang telah terbit.',
              'Mengerti'
            );
          }}
        />
      )}

      {/* TAB: NEW_REQUEST */}
      {activeTab === 'NEW_REQUEST' && (
        <NewRequestForm
          isLocked={isLocked}
          setActiveTab={setActiveTab}
          formSuccessMsg={formSuccessMsg}
          openServiceCombobox={openServiceCombobox}
          setOpenServiceCombobox={setOpenServiceCombobox}
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dateRange={dateRange}
          setDateRange={setDateRange}
          openDatePopover={openDatePopover}
          setOpenDatePopover={setOpenDatePopover}
          isMultiDay={isMultiDay}
          setIsMultiDay={setIsMultiDay}
          startPeriod={startPeriod}
          setStartPeriod={setStartPeriod}
          endPeriod={endPeriod}
          setEndPeriod={setEndPeriod}
          selectingStart={selectingStart}
          setSelectingStart={setSelectingStart}
          hoveredPeriod={hoveredPeriod}
          setHoveredPeriod={setHoveredPeriod}
          purpose={purpose}
          setPurpose={setPurpose}
          attachments={attachments}
          setAttachments={setAttachments}
          isDraggingFile={isDraggingFile}
          setIsDraggingFile={setIsDraggingFile}
          onSubmit={handleSubmitRequest}
        />
      )}

      {/* TAB: MY_REQUESTS */}
      {activeTab === 'MY_REQUESTS' && (
        <RequestHistoryTab
          requests={requests}
          isLocked={isLocked}
          setActiveTab={setActiveTab}
          onSelectReqDetail={setSelectedReqDetail}
          onCancelRequest={handleCancelRequest}
        />
      )}

      {/* TAB: MY_DOCUMENTS */}
      {activeTab === 'MY_DOCUMENTS' && (
        <MyDocumentsTab
          documents={documents}
          onDownloadDoc={(doc) => showAlert('Unduh Dokumen Resmi', `Memulai proses pengunduhan berkas: ${doc.fileName}`, 'Selesai')}
        />
      )}

      {/* Drawer Detail Timeline */}
      <StudentRequestDetailDrawer
        selectedReqDetail={selectedReqDetail}
        onClose={() => setSelectedReqDetail(null)}
        currentUser={currentUser}
        onCancelRequest={(id) => {
          handleCancelRequest(id);
          setSelectedReqDetail(null);
        }}
        onPreviewImage={setPreviewImageModal}
        onDownloadLetter={(req) => showAlert('Mengunduh Surat', `Surat izin resmi dengan nomor ${req.id} sedang disiapkan.`, 'Selesai')}
      />

      {/* Submission Success Modal */}
      <SubmissionSuccessModal
        submittedSuccessModal={submittedSuccessModal}
        onClose={() => setSubmittedSuccessModal(null)}
        onBackToHome={() => {
          setSubmittedSuccessModal(null);
          setActiveTab('OVERVIEW');
        }}
        onTrackStatus={() => {
          const req = submittedSuccessModal;
          setSubmittedSuccessModal(null);
          setActiveTab('MY_REQUESTS');
          setSelectedReqDetail(req);
        }}
      />

      {/* Image Lightbox Preview */}
      <ImageLightboxModal
        previewImage={previewImageModal}
        onClose={() => setPreviewImageModal(null)}
      />

      {/* Unified Shadcn Alert Modal */}
      <ConfirmAlertModal
        open={alertState.open}
        title={alertState.title}
        description={alertState.description}
        actionLabel={alertState.confirmLabel}
        cancelLabel={alertState.cancelLabel}
        variant={alertState.variant}
        onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
        onAction={alertState.onConfirm}
      />
    </div>
  );
}
