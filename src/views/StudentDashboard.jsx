import React, { useState, useEffect, useRef } from 'react';
import { 
  FilePlus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Paperclip, 
  Trash2, 
  Download, 
  ChevronRight, 
  Ban,
  Calendar as CalendarIcon,
  ArrowRight,
  ChevronsUpDown,
  Check,
  Stethoscope,
  Home,
  AlertTriangle,
  Trophy,
  Palette,
  Users,
  Timer,
  ImageIcon,
  Eye,
  ShieldCheck,
  Maximize2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { getRequests, createRequest, cancelRequest, getDocuments } from '../services/storage';
import { defaultTeachers } from '../data/initialData';

const PERMIT_SERVICES = [
  {
    category: 'IZIN_TIDAK_HADIR',
    categoryLabel: 'Izin Tidak Hadir',
    items: [
      {
        id: 'Izin Sakit',
        label: 'Izin Sakit',
        type: 'IZIN_TIDAK_HADIR',
        icon: Stethoscope,
        helper: 'Lampirkan Surat Keterangan Dokter/Klinik atau Surat Pernyataan Orang Tua/Wali.',
      },
      {
        id: 'Izin Kepentingan Keluarga',
        label: 'Izin Kepentingan Keluarga',
        type: 'IZIN_TIDAK_HADIR',
        icon: Home,
        helper: 'Lampirkan Surat Izin Tertulis dari Orang Tua/Wali Murid.',
      },
      {
        id: 'Izin Keperluan Mendesak',
        label: 'Izin Keperluan Mendesak',
        type: 'IZIN_TIDAK_HADIR',
        icon: AlertTriangle,
        helper: 'Tuliskan alasan pada formulir dan lampirkan bukti jika tersedia.',
      }
    ]
  },
  {
    category: 'DISPENSASI',
    categoryLabel: 'Dispensasi Kegiatan Sekolah',
    items: [
      {
        id: 'Dispensasi Lomba / Olimpiade',
        label: 'Dispensasi Lomba & Olimpiade',
        type: 'DISPENSASI',
        icon: Trophy,
        helper: 'Lampirkan Surat Undangan Lomba resmi atau Surat Rekomendasi/Tugas Pembina.',
      },
      {
        id: 'Dispensasi Tampil Seni & Budaya',
        label: 'Dispensasi Pentas Seni & Budaya',
        type: 'DISPENSASI',
        icon: Palette,
        helper: 'Lampirkan Rundown Acara Kegiatan atau Surat Permohonan Tampil.',
      },
      {
        id: 'Dispensasi Tugas Organisasi OSIS',
        label: 'Dispensasi Tugas Organisasi / OSIS',
        type: 'DISPENSASI',
        icon: Users,
        helper: 'Lampirkan Surat Tugas / Disposisi dari Pembina OSIS / Kesiswaan.',
      }
    ]
  }
];

// Schedule: 1 JP = 45 mins, starts at 07:00 AM
const JP_SCHEDULE = [
  { period: 1, start: '07:00', end: '07:45', startMinutes: 7 * 60, endMinutes: 7 * 60 + 45 },
  { period: 2, start: '07:45', end: '08:30', startMinutes: 7 * 60 + 45, endMinutes: 8 * 60 + 30 },
  { period: 3, start: '08:30', end: '09:15', startMinutes: 8 * 60 + 30, endMinutes: 9 * 60 + 15 },
  { period: 4, start: '09:15', end: '10:00', startMinutes: 9 * 60 + 15, endMinutes: 10 * 60 },
  { period: 5, start: '10:00', end: '10:45', startMinutes: 10 * 60, endMinutes: 10 * 60 + 45 },
  { period: 6, start: '10:45', end: '11:30', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 30 },
  { period: 7, start: '11:30', end: '12:15', startMinutes: 11 * 60 + 30, endMinutes: 12 * 60 + 15 },
  { period: 8, start: '12:15', end: '13:00', startMinutes: 12 * 60 + 15, endMinutes: 13 * 60 },
  { period: 9, start: '13:00', end: '13:45', startMinutes: 13 * 60, endMinutes: 13 * 60 + 45 },
  { period: 10, start: '13:45', end: '14:30', startMinutes: 13 * 60 + 45, endMinutes: 14 * 60 + 30 },
];

// Demo simulation: Pukul 07:00 WIB (Semua JP 1-10 aktif)
const DEMO_CURRENT_HOURS = 7;
const DEMO_CURRENT_MINUTES = 0;

function isPeriodPassed(dateObj, jp) {
  if (!dateObj) return false;
  const now = new Date();
  
  const isToday = 
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear();

  const isPast = dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isPast) return true;
  if (!isToday) return false;

  const currentMinutes = DEMO_CURRENT_HOURS * 60 + DEMO_CURRENT_MINUTES;
  return currentMinutes >= jp.endMinutes;
}

function formatDateToIso(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatIndoDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function StudentDashboard({ currentUser, activeTab, setActiveTab, isLocked = false }) {
  const [requests, setRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Single-Pass Form State
  const [openServiceCombobox, setOpenServiceCombobox] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  // Date Picker States (shadcn Calendar)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Intuitive Jam Pelajaran States - Default MATI (null / unselected)
  const [startPeriod, setStartPeriod] = useState(null);
  const [endPeriod, setEndPeriod] = useState(null);
  const [selectingStart, setSelectingStart] = useState(null);
  const [hoveredPeriod, setHoveredPeriod] = useState(null);

  const [purpose, setPurpose] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [formSuccessMsg, setFormSuccessMsg] = useState('');
  
  // Submission Success Modal with 2 CTAs ("Kembali ke Beranda" & "Lacak Status")
  const [submittedSuccessModal, setSubmittedSuccessModal] = useState(null);
  
  // Image Lightbox Preview Modal State
  const [previewImageModal, setPreviewImageModal] = useState(null);

  const fileInputRef = useRef(null);

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

  useEffect(() => {
    loadData();
  }, [currentUser, activeTab]);

  const loadData = () => {
    if (!currentUser) return;
    const allReqs = getRequests().filter(r => r.studentId === currentUser.id);
    setRequests(allReqs);

    const allDocs = getDocuments().filter(d => d.studentId === currentUser.id);
    setDocuments(allDocs);
  };

  const processFiles = (fileList) => {
    const files = Array.from(fileList);
    files.forEach(f => {
      const isImg = f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png)$/i);
      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => [
            ...prev,
            {
              name: f.name,
              size: `${(f.size / 1024).toFixed(0)} KB`,
              type: f.type || 'image/jpeg',
              previewUrl: e.target.result, // base64 Data URL for persistent viewing across all roles
              uploadedAt: new Date().toLocaleDateString('id-ID')
            }
          ]);
        };
        reader.readAsDataURL(f);
      } else {
        setAttachments(prev => [
          ...prev,
          {
            name: f.name,
            size: `${(f.size / 1024).toFixed(0)} KB`,
            type: f.type || 'application/pdf',
            previewUrl: null,
            uploadedAt: new Date().toLocaleDateString('id-ID')
          }
        ]);
      }
    });
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Find currently active service
  const allServices = PERMIT_SERVICES.flatMap(cat => cat.items);
  const activeService = allServices.find(s => s.id === selectedServiceId) || null;
  const ActiveServiceIcon = activeService ? activeService.icon : null;
  const isDispensation = activeService ? activeService.type === 'DISPENSASI' : false;

  // Quick Action: Set Single Day (Today)
  const handleSetToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setDateRange({ from: now, to: now });
  };

  // Quick Action: Set Tomorrow
  const handleSetTomorrow = () => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setSelectedDate(tmr);
    setDateRange({ from: tmr, to: tmr });
  };

  // Robust & Clean JP Range Click Logic
  const handleJpNumberClick = (periodNum) => {
    const jp = JP_SCHEDULE.find(j => j.period === periodNum);
    if (isPeriodPassed(selectedDate, jp)) return;

    if (selectingStart === null) {
      // Step 1: Clicked first point
      setSelectingStart(periodNum);
    } else {
      // Step 2: Clicked second point to finalize range
      const first = Math.min(selectingStart, periodNum);
      const last = Math.max(selectingStart, periodNum);
      setStartPeriod(first);
      setEndPeriod(last);
      setSelectingStart(null);
    }
  };

  const handleSetAllActiveJP = () => {
    const availableSlots = JP_SCHEDULE.filter(jp => !isPeriodPassed(selectedDate, jp));
    if (availableSlots.length === 0) {
      showAlert('Jam Pelajaran Tidak Tersedia', 'Semua jam pelajaran pada tanggal ini telah terlewat.');
      return;
    }
    setStartPeriod(availableSlots[0].period);
    setEndPeriod(availableSlots[availableSlots.length - 1].period);
    setSelectingStart(null);
  };

  // Compute effective active/display range
  let effectiveStart = startPeriod;
  let effectiveEnd = endPeriod;
  if (selectingStart !== null) {
    if (hoveredPeriod !== null) {
      effectiveStart = Math.min(selectingStart, hoveredPeriod);
      effectiveEnd = Math.max(selectingStart, hoveredPeriod);
    } else {
      effectiveStart = selectingStart;
      effectiveEnd = selectingStart;
    }
  }

  // Submit Handler
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

    // Build time description
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
    
    // Open dedicated success modal with 2 CTAs
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MENUNGGU_VERIFIKASI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
      case 'DIPROSES_TU':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Diproses TU</span>
          </span>
        );
      case 'DISETUJUI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Disetujui</span>
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak</span>
          </span>
        );
      case 'DIBATALKAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            <Ban className="w-3.5 h-3.5" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return null;
    }
  };

  const approvedCount = requests.filter(r => r.status === 'DISETUJUI').length;
  const pendingCount = requests.filter(r => r.status === 'MENUNGGU_VERIFIKASI' || r.status === 'DIPROSES_TU').length;

  const activeStartJp = effectiveStart !== null ? (JP_SCHEDULE.find(j => j.period === effectiveStart) || null) : null;
  const activeEndJp = effectiveEnd !== null ? (JP_SCHEDULE.find(j => j.period === effectiveEnd) || null) : null;

  return (
    <div className="w-full">
      
      {/* =========================================================================
          TAB: OVERVIEW (Dashboard Summary & Quick Actions)
          ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
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
              {/* Real-time WIB Clock Widget - Borderless & Larger */}
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-muted-foreground leading-tight">
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-foreground leading-tight tracking-tight">
                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
                  </span>
                </div>
              </div>

              {isLocked ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    showAlert(
                      'Layanan Izin Ditutup Sementara',
                      'Pengajuan permohonan surat izin baru ditutup sementara selama jam pelajaran sekolah aktif (07.30 - 15.30 WIB) atau saat dinonaktifkan oleh Guru BK. Anda tetap dapat memantau status permohonan yang telah diajukan dan mengunduh berkas surat yang telah terbit.',
                      'Mengerti'
                    );
                  }}
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

          {/* Jam Operasional / Tutup Sementara Notification Banner */}
          {isLocked && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    Jam Pelajaran Sekolah Aktif — Layanan Izin Ditutup Sementara
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                    Sesuai tata tertib sekolah, pengajuan surat izin baru dinonaktifkan pada pukul 07.30 - 15.30 WIB. Seluruh riwayat pengajuan dan status surat tetap dapat dipantau di bawah ini.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-200/70 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 self-start sm:self-center shrink-0">
                07.30 — 15.30 WIB
              </span>
            </div>
          )}

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
                          {getStatusBadge(r.status)}
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
                        onClick={() => setSelectedReqDetail(r)}
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

          {/* Info Tutup Sementara di bagian bawah tabel / list */}
          {isLocked && (
            <div className="p-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs">
                  <strong>Status Layanan: Tutup Sementara</strong> — Pembuatan pengajuan izin baru dinonaktifkan selama jam belajar aktif (07.30 - 15.30 WIB). Untuk keperluan izin mendesak, silakan lapor langsung ke Guru BK atau Wali Kelas.
                </span>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400 shrink-0 self-start sm:self-auto">
                Tutup Sementara
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: NEW_REQUEST (Default Unselected State for Jam Pelajaran)
          ========================================================================= */}
      {activeTab === 'NEW_REQUEST' && (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="border-b border-border pb-3.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              Formulir Pengajuan Izin & Dispensasi
            </h1>
            <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
              Lengkapi jenis izin, tanggal, jam pelajaran, dan alasan permohonan dengan jelas.
            </p>
          </div>

          {isLocked ? (
            <div className="p-8 sm:p-12 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-card text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  Layanan Pengajuan Ditutup Sementara
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Pengajuan surat izin mandiri siswa dinonaktifkan pada jam sekolah aktif (07.30 - 15.30 WIB) atau saat dikunci oleh Guru BK. Layanan akan dibuka kembali di luar jam KBM sekolah.
                </p>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => setActiveTab('OVERVIEW')} 
                  variant="outline"
                  className="rounded-xl text-xs gap-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Kembali ke Ringkasan Dashboard</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Success Alert Banner */}
              {formSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-sm font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{formSuccessMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitRequest} className="space-y-6">
            
            {/* 1. Jenis Izin Combobox */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                Jenis Izin / Pengajuan <span className="text-rose-600 font-normal">*</span>
              </Label>

              <Popover open={openServiceCombobox} onOpenChange={setOpenServiceCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openServiceCombobox}
                    className={cn(
                      "w-full justify-between h-11 px-3.5 text-sm font-normal bg-background border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl transition-colors",
                      !activeService && "text-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {ActiveServiceIcon ? (
                        <ActiveServiceIcon className="w-4 h-4 shrink-0 text-blue-600" />
                      ) : (
                        <span className="text-slate-400 font-sans text-base">-</span>
                      )}
                      <span className={cn(
                        "truncate text-sm",
                        activeService ? "text-slate-800 dark:text-zinc-100 font-medium" : "text-slate-500 dark:text-zinc-400 font-normal"
                      )}>
                        {activeService ? activeService.label : "- Pilih Jenis Izin / Pengajuan -"}
                      </span>
                    </div>
                    <ChevronsUpDown className="opacity-60 ml-2 h-4 w-4 shrink-0 text-slate-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-1.5 border-border shadow-lg" align="start">
                  <Command>
                    <CommandList className="max-h-64">
                      {PERMIT_SERVICES.map((group, gIdx) => (
                        <React.Fragment key={group.category}>
                          {gIdx > 0 && <CommandSeparator className="my-1.5" />}
                          <CommandGroup heading={group.categoryLabel}>
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isSelected = selectedServiceId === item.id;
                              return (
                                <CommandItem
                                  key={item.id}
                                  value={item.label}
                                  onSelect={() => {
                                    setSelectedServiceId(item.id);
                                    setOpenServiceCombobox(false);
                                  }}
                                  className={cn(
                                    "text-sm cursor-pointer py-2.5 px-3 flex items-center justify-between rounded-lg font-normal",
                                    isSelected ? "bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 font-medium" : "hover:bg-muted text-slate-700 dark:text-zinc-200"
                                  )}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <ItemIcon className={cn(
                                      "w-4 h-4 shrink-0",
                                      isSelected ? "text-blue-600" : "text-slate-500"
                                    )} />
                                    <span>{item.label}</span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4 text-blue-600 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </React.Fragment>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {activeService ? (
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 pt-0.5">
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Persyaratan:</span> {activeService.helper}
                </p>
              ) : (
                <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 pt-0.5">
                  Pilih jenis izin di atas untuk melihat persyaratan dokumen pendukung.
                </p>
              )}
            </div>

            {/* 2. Tanggal Izin / Kegiatan (shadcn Calendar Popover) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                  {isMultiDay ? 'Rentang Tanggal Izin' : 'Tanggal Izin / Kegiatan'} <span className="text-rose-600 font-normal">*</span>
                </Label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-md transition-colors",
                      formatDateToIso(selectedDate) === formatDateToIso(new Date()) && !isMultiDay
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={handleSetTomorrow}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                  >
                    Besok
                  </button>
                </div>
              </div>

              {/* shadcn Calendar Popover Trigger */}
              <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 px-3.5 text-sm bg-background border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl transition-colors",
                      !selectedDate && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2.5 h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate text-slate-800 dark:text-zinc-200 font-medium">
                      {isMultiDay ? (
                        dateRange?.from ? (
                          dateRange.to ? (
                            `${formatIndoDate(dateRange.from)} — ${formatIndoDate(dateRange.to)}`
                          ) : (
                            formatIndoDate(dateRange.from)
                          )
                        ) : (
                          "Pilih rentang tanggal izin"
                        )
                      ) : (
                        formatIndoDate(selectedDate)
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                
                {/* shadcn Calendar Content */}
                <PopoverContent className="w-auto p-0 shadow-xl border-border" align="start">
                  {isMultiDay ? (
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range?.from && range?.to) {
                          setSelectedDate(range.from);
                        }
                      }}
                      initialFocus
                    />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setDateRange({ from: date, to: date });
                          setOpenDatePopover(false);
                        }
                      }}
                      initialFocus
                    />
                  )}
                </PopoverContent>
              </Popover>

              {/* Multi-Day Toggle (Only for Izin Tidak Hadir) */}
              {!isDispensation && (
                <div className="pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-normal text-slate-600 dark:text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={isMultiDay}
                      onChange={(e) => {
                        setIsMultiDay(e.target.checked);
                        if (!e.target.checked) {
                          setDateRange({ from: selectedDate, to: selectedDate });
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Izin lebih dari 1 hari (rentang tanggal)</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Jam Pelajaran (Default Unselected State) */}
            {isDispensation && !isMultiDay && (
              <div className="space-y-2 pt-1">
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-blue-600" />
                    Pilih Jam Pelajaran (1 JP = 45 menit) <span className="text-rose-600 font-normal">*</span>
                  </Label>

                  <div className="flex items-center gap-2">
                    {selectingStart !== null ? (
                      <span className="text-xs text-blue-800 dark:text-blue-200 font-medium bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-md">
                        Klik jam selesai...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSetAllActiveJP}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        Pilih Semua Jam Aktif (1-10)
                      </button>
                    )}
                  </div>
                </div>

                {/* Full-Width Card Container */}
                <div 
                  className="w-full p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-card space-y-3"
                  onMouseLeave={() => setHoveredPeriod(null)}
                >
                  {/* Mobile Swipe Hint */}
                  <div className="sm:hidden flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                      <span>👉 Geser ke kanan untuk Jam 1 — 10</span>
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md font-sans">10 JP Aktif</span>
                  </div>
                  
                  {/* Single Horizontal Scrollable Row (10 Kolom) */}
                  <div className="w-full overflow-x-auto overflow-y-hidden pb-2 pt-1 touch-pan-x scroll-smooth overscroll-x-contain">
                    <div className="grid grid-cols-10 gap-x-0 min-w-[580px] sm:min-w-0 text-center select-none py-1">
                      {JP_SCHEDULE.map((jp) => {
                        const passed = isPeriodPassed(selectedDate, jp);
                        
                        const isPicking = selectingStart !== null;
                        
                        // Real locked points
                        const hasSelection = startPeriod !== null && endPeriod !== null;
                        const isLockedStart = !isPicking && !passed && hasSelection && jp.period === startPeriod;
                        const isLockedEnd = !isPicking && !passed && hasSelection && jp.period === endPeriod;
                        const isLockedRange = !isPicking && !passed && hasSelection && jp.period >= startPeriod && jp.period <= endPeriod;
                        const isLockedSingle = hasSelection && startPeriod === endPeriod;

                        // Picking mode states
                        const isAnchor = isPicking && jp.period === selectingStart;
                        const isHoverTarget = isPicking && hoveredPeriod !== null && jp.period === hoveredPeriod && hoveredPeriod !== selectingStart;
                        const isPreviewRange = isPicking && !passed && effectiveStart !== null && effectiveEnd !== null && jp.period >= effectiveStart && jp.period <= effectiveEnd;
                        const isPreviewSingle = effectiveStart !== null && effectiveStart === effectiveEnd;

                        // Unified active indicators
                        const showBand = isPicking ? (isPreviewRange && !isPreviewSingle) : (isLockedRange && !isLockedSingle);
                        const showStartCap = isPicking ? (jp.period === effectiveStart && !isPreviewSingle) : (isLockedStart && !isLockedSingle);
                        const showEndCap = isPicking ? (jp.period === effectiveEnd && !isPreviewSingle) : (isLockedEnd && !isLockedSingle);

                        return (
                          <div
                            key={`jp-slot-${jp.period}`}
                            className={cn(
                              "h-16 flex items-center justify-center relative transition-colors",
                              showBand && "bg-blue-100/80 dark:bg-blue-950/70",
                              showStartCap && "rounded-l-2xl",
                              showEndCap && "rounded-r-2xl"
                            )}
                          >
                            <button
                              type="button"
                              disabled={passed}
                              onClick={() => handleJpNumberClick(jp.period)}
                              onMouseEnter={() => !passed && setHoveredPeriod(jp.period)}
                              className={cn(
                                "w-full max-w-[54px] h-14 rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all duration-100 cursor-pointer",
                                
                                // 1. Permanent Selected Start or End: Clean Solid Blue with Medium/Semibold Weight
                                ((isLockedStart || isLockedEnd) || isAnchor) && 
                                  "bg-blue-600 text-white font-semibold shadow-sm z-10",
                                
                                // 2. Hover Preview Target while selecting
                                isHoverTarget && 
                                  "border-2 border-dashed border-blue-600 bg-blue-200 dark:bg-blue-900/80 text-blue-950 dark:text-blue-100 font-semibold z-10",
                                
                                // 3. In-Between Range (Preview or Locked)
                                (showBand && !isLockedStart && !isLockedEnd && !isAnchor && !isHoverTarget) && 
                                  "text-blue-950 dark:text-blue-100 font-medium",
                                
                                // 4. Normal Unselected Available Slot (Clean Default Off State)
                                (!showBand && !isLockedStart && !isLockedEnd && !isAnchor && !isHoverTarget && !passed) && 
                                  "text-slate-700 dark:text-zinc-200 bg-background hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 border border-slate-300 dark:border-zinc-700 font-medium",
                                
                                // 5. Passed / Disabled Slot
                                passed && "opacity-35 cursor-not-allowed bg-slate-100 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-500 line-through border border-dashed border-slate-300 dark:border-zinc-800"
                              )}
                              title={`Jam ke-${jp.period}: ${jp.start} - ${jp.end}`}
                            >
                              <span className="text-sm font-semibold leading-none">{jp.period}</span>
                              <span className={cn(
                                "text-[10px] leading-none mt-1 font-normal",
                                ((isLockedStart || isLockedEnd) || isAnchor) ? "text-blue-100" : "text-slate-500 dark:text-zinc-400"
                              )}>
                                {jp.start}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual Range Summary Strip (Shows dynamic selection or empty prompt) */}
                  {effectiveStart !== null && effectiveEnd !== null && activeStartJp && activeEndJp ? (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-sm text-blue-950 dark:text-blue-100 animate-in fade-in duration-100">
                      <div className="flex items-center gap-2 truncate font-normal">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="truncate">
                          Jam ke-<span className="font-medium">{effectiveStart}</span> s/d <span className="font-medium">{effectiveEnd}</span> ({activeStartJp.start} - {activeEndJp.end})
                        </span>
                      </div>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600 border-none text-xs font-medium px-2.5 py-1 shrink-0 ml-1">
                        {effectiveEnd - effectiveStart + 1} JP
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                      <span>Klik nomor jam pelajaran di atas untuk menentukan jam mulai dan selesai</span>
                      <span className="font-medium text-slate-400 dark:text-zinc-500">0 JP</span>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* 4. Purpose Textarea */}
            <div className="space-y-2 pt-1">
              <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                Alasan / Detail Keperluan <span className="text-rose-600 font-normal">*</span>
              </Label>
              <Textarea
                rows={5}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Tuliskan alasan perizinan atau rincian detail kegiatan sekolah secara lengkap..."
                className="min-h-[140px] text-sm font-normal leading-relaxed border-slate-300 dark:border-zinc-700 rounded-xl resize-y text-slate-800 dark:text-zinc-200"
              />
            </div>

            {/* 5. Clean Enterprise File Uploader */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                  Dokumen Pendukung <span className="text-slate-500 font-normal text-xs">(Surat Dokter, Undangan Lomba, dll.)</span>
                </Label>
                {attachments.length > 0 && (
                  <span className="text-xs font-medium text-blue-600">
                    {attachments.length} file terlampir
                  </span>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input-student"
              />

              {/* Clean Upload Trigger Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5",
                  isDraggingFile 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60" 
                    : "border-slate-300 dark:border-zinc-700 hover:border-blue-500 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-blue-50/30"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                    <span className="text-blue-600 hover:underline">Klik untuk memilih file</span> atau seret dokumen ke sini
                  </p>
                  <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-0.5">
                    Format: PDF, PNG, JPG (Maksimal 5 MB)
                  </p>
                </div>
              </div>

              {/* Uploaded File Cards */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {attachments.map((att, idx) => {
                    const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png)$/i);

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-card flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* File Thumbnail or Clean Document Icon */}
                          {isImg && att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                              {isImg ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                          )}

                          {/* File Meta */}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">{att.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-normal text-slate-500">{att.size}</span>
                              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Siap</span>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAttachment(idx);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg shrink-0 transition-colors"
                          title="Hapus lampiran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('OVERVIEW')}
                className="h-10 px-4 text-sm font-medium rounded-lg"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-10 px-5 gap-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                <span>Kirim Pengajuan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

              </form>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: MY_REQUESTS (History Table)
          ========================================================================= */}
      {activeTab === 'MY_REQUESTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                Riwayat & Status Pengajuan
              </h1>
              <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
                Pantau verifikasi Wali Kelas dan status pengesahan surat resmi dari TU.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveTab('NEW_REQUEST')}
              className="gap-1.5 self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg"
            >
              <FilePlus className="w-4 h-4" />
              <span>Pengajuan Baru</span>
            </Button>
          </div>

          <Card className="border border-border overflow-hidden">
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <div className="text-center py-14 border-dashed rounded-xl">
                  <FileText className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Belum ada riwayat pengajuan.</p>
                  <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-1">Buat pengajuan baru untuk melihat status di sini.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/30">
                          <TableHead className="w-[140px] font-medium text-slate-600 dark:text-zinc-400 text-xs">No. Pengajuan</TableHead>
                          <TableHead className="font-medium text-slate-600 dark:text-zinc-400 text-xs">Jenis Izin</TableHead>
                          <TableHead className="font-medium text-slate-600 dark:text-zinc-400 text-xs">Waktu / Tanggal</TableHead>
                          <TableHead className="font-medium text-slate-600 dark:text-zinc-400 text-xs">Status</TableHead>
                          <TableHead className="text-right font-medium text-slate-600 dark:text-zinc-400 text-xs">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((r) => (
                          <TableRow key={r.id} className="hover:bg-muted/40">
                            <TableCell className="font-sans text-xs text-slate-600 dark:text-zinc-400 font-medium">{r.id}</TableCell>
                            <TableCell>
                              <p className="font-medium text-sm text-slate-900 dark:text-zinc-100">{r.subType}</p>
                              <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 line-clamp-1">{r.purpose}</p>
                            </TableCell>
                            <TableCell className="text-xs">
                              <p className="font-medium text-slate-800 dark:text-zinc-200">
                                {r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}
                              </p>
                              <p className="text-xs font-normal text-slate-500 dark:text-zinc-400">Diajukan: {r.createdAt}</p>
                            </TableCell>
                            <TableCell>{getStatusBadge(r.status)}</TableCell>
                            <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReqDetail(r)}
                                className="h-8 text-xs font-medium rounded-lg"
                              >
                                Lacak
                              </Button>
                              {r.status === 'MENUNGGU_VERIFIKASI' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelRequest(r.id)}
                                  className="h-8 text-xs font-medium rounded-lg"
                                >
                                  Batalkan
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Touch-Friendly Card View */}
                  <div className="md:hidden divide-y divide-border p-3 space-y-3">
                    {requests.map((r) => (
                      <div key={r.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400">{r.id}</span>
                          {getStatusBadge(r.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">{r.subType}</h4>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mt-0.5">{r.purpose}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{r.timeSpanFormatted || `${r.startDate} s/d ${r.endDate}`}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReqDetail(r)}
                            className="flex-1 h-8 text-xs font-medium rounded-lg border-border"
                          >
                            Lacak Status & Timeline
                          </Button>
                          {r.status === 'MENUNGGU_VERIFIKASI' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelRequest(r.id)}
                              className="h-8 px-3 text-xs font-medium rounded-lg"
                            >
                              Batalkan
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info Tutup Sementara di bagian bawah tabel riwayat */}
          {isLocked && (
            <div className="p-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs">
                  <strong>Status Layanan: Tutup Sementara</strong> — Pembuatan permohonan surat izin baru ditutup sementara selama jam KBM aktif (07.30 - 15.30 WIB). Pemantauan dan pelacakan status permohonan yang ada tetap dapat dilakukan secara normal.
                </span>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400 shrink-0 self-start sm:self-auto">
                Tutup Sementara
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: MY_DOCUMENTS (Archive of Issued Letters)
          ========================================================================= */}
      {activeTab === 'MY_DOCUMENTS' && (
        <div className="space-y-4">
          <div className="border-b border-border pb-4">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              Arsip Dokumen Saya
            </h1>
            <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
              Unduh surat izin resmi bertanda tangan digital yang telah disahkan Tata Usaha (TU).
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-border rounded-xl">
              <Download className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Belum ada dokumen resmi terbit.</p>
              <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-1">Dokumen hasil pengajuan yang disetujui TU akan tersimpan di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4 bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{doc.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Kategori: {doc.category} • {doc.fileSize}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Diterbitkan: {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showAlert('Unduh Dokumen Resmi', `Memulai proses pengunduhan berkas: ${doc.fileName}`, 'Selesai')}
                    className="gap-1.5 h-8 text-xs font-medium shrink-0 rounded-lg border-border hover:bg-blue-50 hover:text-blue-700 w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Dokumen</span>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          Sidebar Drawer: Lacak & Detail Riwayat Pengajuan Siswa (Panel Kanan)
          ========================================================================= */}
      <Sheet open={!!selectedReqDetail} onOpenChange={(open) => !open && setSelectedReqDetail(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-background border-l border-border z-50">
          {/* 1. Header Drawer */}
          <SheetHeader className="p-5 border-b border-border text-left shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40">
                    Detail Timeline
                  </span>
                  <span className="text-xs font-sans text-muted-foreground">{selectedReqDetail?.id}</span>
                </div>
                <SheetTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50 mt-1 truncate">
                  {selectedReqDetail?.subType}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  Diajukan oleh {selectedReqDetail?.studentName || currentUser?.name} ({currentUser?.class || 'X-IPA 1'})
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* 2. Scrollable Drawer Body */}
          {selectedReqDetail && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Card 1: Ringkasan Pengajuan & Status Card */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Status Pengajuan</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedReqDetail.status)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <span className="text-[11px] block text-slate-400">Tanggal Pengajuan</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {selectedReqDetail.createdAtFormatted || selectedReqDetail.date || 'Hari ini'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[11px] block">Rentang Waktu / Tanggal:</span>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{selectedReqDetail.timeSpanFormatted || `${selectedReqDetail.startDate} s/d ${selectedReqDetail.endDate}`}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[11px] block">Kategori Administrasi:</span>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {selectedReqDetail.type === 'IZIN_TIDAK_HADIR' ? 'Izin Tidak Hadir' : 'Dispensasi Kegiatan'}
                    </p>
                  </div>
                </div>

                {/* Purpose */}
                <div className="pt-2">
                  <span className="text-slate-500 text-[11px] block mb-1">Keperluan / Alasan:</span>
                  <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
                    {selectedReqDetail.purpose}
                  </div>
                </div>
              </div>

              {/* Card 2: Catatan Verifikasi (Wali Kelas / TU) */}
              {(selectedReqDetail.teacherNote || selectedReqDetail.tuNote || selectedReqDetail.notes) && (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Catatan & Umpan Balik Verifikator</span>
                  </div>
                  {selectedReqDetail.teacherNote && (
                    <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Catatan Wali Kelas:</span>
                      <p className="italic">"{selectedReqDetail.teacherNote}"</p>
                    </div>
                  )}
                  {selectedReqDetail.tuNote && (
                    <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Catatan Tata Usaha:</span>
                      <p className="italic">"{selectedReqDetail.tuNote}"</p>
                    </div>
                  )}
                  {!selectedReqDetail.teacherNote && !selectedReqDetail.tuNote && selectedReqDetail.notes && (
                    <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">Catatan:</span>
                      <p className="italic">"{selectedReqDetail.notes}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Card 3: Lampiran Dokumen Bukti */}
              {selectedReqDetail.attachments && selectedReqDetail.attachments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/80 dark:border-blue-900/60">
                        <Paperclip className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        Lampiran Dokumen Bukti
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-medium bg-blue-50/70 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                      {selectedReqDetail.attachments.length} Berkas
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {selectedReqDetail.attachments.map((att, i) => {
                      const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp)$/i);
                      const ext = att.name?.split('.').pop()?.toUpperCase() || (isImg ? 'IMG' : 'DOC');
                      
                      return (
                        <div
                          key={i}
                          className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-card overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-800/80 transition-all"
                        >
                          {/* Visual Canvas Area */}
                          {isImg && att.previewUrl ? (
                            <div 
                              onClick={() => setPreviewImageModal({ url: att.previewUrl, name: att.name, size: att.size })}
                              className="relative h-48 sm:h-52 w-full bg-slate-100 dark:bg-zinc-900/90 flex items-center justify-center p-3 cursor-pointer overflow-hidden border-b border-border/80"
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

                              {/* Top Badge on Canvas */}
                              <div className="absolute top-2.5 left-2.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-sans font-medium shadow-xs">
                                  <ImageIcon className="w-3 h-3 text-blue-300" />
                                  <span>{ext}</span>
                                </span>
                              </div>

                              {/* Hover Action Overlay */}
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
                            <div className="h-24 w-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border-b border-border/80">
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">Dokumen Berkas</span>
                                  <span className="text-[10px] text-muted-foreground">{ext} File</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bottom Metadata & Actions Bar */}
                          <div className="p-3.5 bg-background flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate block">
                                  {att.name}
                                </span>
                                <span className="shrink-0 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-sans text-[9px] font-semibold uppercase">
                                  {ext}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {att.size || 'Ukuran tidak diketahui'} • Dokumen Terverifikasi
                              </p>
                            </div>

                            {/* Action Buttons */}
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

              {/* Card 4: Jejak Langkah Verifikasi (Timeline Tracker) */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jejak Langkah Verifikasi</span>
                </span>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="space-y-4 relative pl-5 border-l-2 border-blue-200 dark:border-blue-900/60 ml-2">
                    {selectedReqDetail.timeline && selectedReqDetail.timeline.length > 0 ? (
                      selectedReqDetail.timeline.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-background shadow-xs"></div>
                          <p className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">{step.note}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            Oleh: <span className="font-medium text-slate-700 dark:text-zinc-300">{step.byName}</span> • {step.timestamp}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="relative">
                        <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-background"></div>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">Pengajuan dibuat oleh siswa</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Oleh: {selectedReqDetail.studentName || currentUser?.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 5: Dokumen Resmi Terbit (jika status DISETUJUI) */}
              {selectedReqDetail.status === 'DISETUJUI' && (
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-emerald-950 dark:text-emerald-200">Surat Izin / Keterangan Resmi</h4>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5">Telah disahkan & terbit secara digital di sistem.</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      showAlert('Mengunduh Surat', `Surat izin resmi dengan nomor ${selectedReqDetail.id} sedang disiapkan.`, 'Selesai');
                    }}
                    className="bg-white dark:bg-zinc-900 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-medium gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Surat (.PDF)</span>
                  </Button>
                </div>
              )}

            </div>
          )}

          {/* 3. Drawer Footer */}
          <SheetFooter className="p-4 border-t border-border flex items-center justify-between bg-muted/20 shrink-0">
            {selectedReqDetail && selectedReqDetail.status === 'MENUNGGU_VERIFIKASI' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  showAlert(
                    'Batalkan Pengajuan?',
                    `Apakah Anda yakin ingin membatalkan pengajuan ${selectedReqDetail.id}? Tindakan ini tidak dapat diurungkan.`,
                    'Ya, Batalkan',
                    'Kembali',
                    'destructive',
                    () => {
                      cancelRequest(selectedReqDetail.id);
                      setSelectedReqDetail(null);
                      loadData();
                    }
                  );
                }}
                className="h-8 px-3 text-xs font-medium gap-1.5 rounded-lg"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Batalkan Pengajuan</span>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">SchoolAdmin Portal Siswa</span>
            )}

            <Button
              variant="outline"
              onClick={() => setSelectedReqDetail(null)}
              className="h-8 px-4 text-xs font-medium rounded-lg"
            >
              Tutup Panel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* =========================================================================
          Submission Success Modal with 2 CTAs: "Kembali ke Beranda" & "Lacak Status"
          ========================================================================= */}
      <Dialog open={!!submittedSuccessModal} onOpenChange={(open) => !open && setSubmittedSuccessModal(null)}>
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
                  onClick={() => {
                    setSubmittedSuccessModal(null);
                    setActiveTab('OVERVIEW');
                  }}
                  className="w-full text-xs font-medium h-9 rounded-lg"
                >
                  Kembali ke Beranda
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    const req = submittedSuccessModal;
                    setSubmittedSuccessModal(null);
                    setActiveTab('MY_REQUESTS');
                    setSelectedReqDetail(req);
                  }}
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
            <span>Pratinjau berkas dokumen sah siswa</span>
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
            {alertState.cancelLabel && (
              <AlertDialogCancel
                onClick={() => setAlertState(prev => ({ ...prev, open: false }))}
                className="h-9 px-3.5 text-xs font-medium rounded-lg"
              >
                {alertState.cancelLabel}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className={cn(
                "h-9 px-4 text-xs font-medium rounded-lg",
                alertState.variant === 'destructive' ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
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

    </div>
  );
}
