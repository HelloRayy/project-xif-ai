import studentsList from './students.json';

export const initialStudents = studentsList;

export const defaultTeachers = [
  {
    id: 'usr-teacher-1',
    username: 'guru.ahmad',
    password: 'password123',
    name: 'Ahmad Dahlan, S.Pd.',
    role: 'TEACHER',
    roleLabel: 'Wali Kelas XI-A',
    assignedClass: 'XI-A',
    email: 'ahmad.dahlan@sman6.sch.id',
    phone: '0813-8877-6655',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-teacher-2',
    username: 'guru.siti',
    password: 'password123',
    name: 'Siti Rahmawati, M.Pd.',
    role: 'TEACHER',
    roleLabel: 'Wali Kelas XI-B',
    assignedClass: 'XI-B',
    email: 'siti.rahma@sman6.sch.id',
    phone: '0813-1122-3344',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-teacher-3',
    username: 'guru.bambang',
    password: 'password123',
    name: 'Drs. Bambang Wijaya',
    role: 'TEACHER',
    roleLabel: 'Wali Kelas XI-C',
    assignedClass: 'XI-C',
    email: 'bambang.wijaya@sman6.sch.id',
    phone: '0813-2233-4455',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-teacher-4',
    username: 'guru.dewi',
    password: 'password123',
    name: 'Dewi Sartika, S.Pd.',
    role: 'TEACHER',
    roleLabel: 'Wali Kelas XI-D',
    assignedClass: 'XI-D',
    email: 'dewi.sartika@sman6.sch.id',
    phone: '0813-3344-5566',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-teacher-5',
    username: 'guru.hendra',
    password: 'password123',
    name: 'Hendra Kusuma, M.Si.',
    role: 'TEACHER',
    roleLabel: 'Wali Kelas XI-E',
    assignedClass: 'XI-E',
    email: 'hendra.kusuma@sman6.sch.id',
    phone: '0813-4455-6677',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-teacher-6',
    username: 'guru.rina',
    password: 'password123',
    name: 'Rina Marlina, S.Pd.',
    role: 'TEACHER',
    roleLabel: 'Wali Kelas XI-F',
    assignedClass: 'XI-F',
    email: 'rina.marlina@sman6.sch.id',
    phone: '0813-5566-7788',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  }
];

export const defaultAdmins = [
  {
    id: 'usr-admin-1',
    username: 'admin.tu',
    password: 'password123',
    name: 'Hj. Ratna Sari, S.E.',
    role: 'ADMIN',
    roleLabel: 'Staf TU / Admin Utama',
    email: 'tu.admin@sman6semarang.sch.id',
    phone: '0812-9900-1122',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const studentUsers = initialStudents.map(s => ({
  id: s.id,
  username: s.username,
  password: 'user123',
  name: s.name,
  role: 'STUDENT',
  roleLabel: s.roleLabel || `Siswa Kelas ${s.class}`,
  nis: s.nis,
  nisn: s.nisn,
  class: s.class,
  gender: s.gender,
  guardianName: s.guardianName,
  guardianPhone: s.guardianPhone,
  email: s.email,
  phone: s.phone,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`
}));

export const allInitialUsers = [
  ...defaultAdmins,
  ...defaultTeachers,
  ...studentUsers
];

export const initialRequests = [
  {
    id: 'REQ-2026-001',
    type: 'SURAT_KETERANGAN',
    subType: 'Surat Keterangan Siswa Aktif',
    studentId: 'usr-student-xia-01',
    studentName: 'Aditiya Lukmanul Hakim',
    studentNis: '2026110101',
    studentClass: 'XI-A',
    teacherName: 'Ahmad Dahlan, S.Pd.',
    purpose: 'Persyaratan pengajuan Beasiswa Prestasi Pendidikan 2026',
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    status: 'DISETUJUI',
    teacherNote: 'Disetujui. Siswa aktif dan berkelakuan baik.',
    adminNote: 'Surat Keterangan Aktif telah disahkan dan diterbitkan secara digital.',
    createdAt: '2026-09-10 09:30',
    updatedAt: '2026-09-11 14:15',
    attachments: [
      { name: 'KTP_OrangTua.pdf', size: '420 KB', type: 'application/pdf' }
    ],
    timeline: [
      { status: 'MENUNGGU_VERIFIKASI', note: 'Pengajuan dibuat oleh siswa', byName: 'Aditiya Lukmanul Hakim', timestamp: '2026-09-10 09:30' },
      { status: 'DIPROSES_TU', note: 'Diverifikasi & disetujui Wali Kelas', byName: 'Ahmad Dahlan, S.Pd.', timestamp: '2026-09-10 11:45' },
      { status: 'DISETUJUI', note: 'Surat disahkan & diterbitkan oleh TU', byName: 'Hj. Ratna Sari, S.E.', timestamp: '2026-09-11 14:15' }
    ]
  },
  {
    id: 'REQ-2026-002',
    type: 'IZIN_TIDAK_HADIR',
    subType: 'Izin Sakit',
    studentId: 'usr-student-xia-02',
    studentName: 'Aisyah Aluna Nasyafa',
    studentNis: '2026110102',
    studentClass: 'XI-A',
    teacherName: 'Ahmad Dahlan, S.Pd.',
    purpose: 'Sakit Demam & Batuk (Surat Keterangan Dokter)',
    startDate: '2026-09-20',
    endDate: '2026-09-21',
    status: 'MENUNGGU_VERIFIKASI',
    teacherNote: '',
    adminNote: '',
    createdAt: '2026-09-20 07:15',
    updatedAt: '2026-09-20 07:15',
    attachments: [
      { 
        name: 'Surat_Keterangan_Dokter.jpg', 
        size: '1.2 MB', 
        type: 'image/jpeg',
        previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80' 
      }
    ],
    timeline: [
      { status: 'MENUNGGU_VERIFIKASI', note: 'Pengajuan dibuat oleh siswa', byName: 'Aisyah Aluna Nasyafa', timestamp: '2026-09-20 07:15' }
    ]
  },
  {
    id: 'REQ-2026-003',
    type: 'DISPENSASI',
    subType: 'Dispensasi Lomba & Olimpiade',
    studentId: 'usr-student-xib-05',
    studentName: 'Angwyn Kenji Kusumawardhana Widodo',
    studentNis: '2026110205',
    studentClass: 'XI-B',
    teacherName: 'Siti Rahmawati, M.Pd.',
    purpose: 'Mengikuti Babak Final OSN Tingkat Provinsi Jawa Tengah',
    startDate: '2026-09-22',
    endDate: '2026-09-24',
    status: 'DIPROSES_TU',
    teacherNote: 'Sangat didukung. Selamat berjuang mewakili SMA N 6 Semarang.',
    adminNote: '',
    createdAt: '2026-09-18 10:00',
    updatedAt: '2026-09-19 13:20',
    attachments: [
      { name: 'Surat_Undangan_OSN_Provinsi.pdf', size: '850 KB', type: 'application/pdf' }
    ],
    timeline: [
      { status: 'MENUNGGU_VERIFIKASI', note: 'Pengajuan dibuat oleh siswa', byName: 'Angwyn Kenji Kusumawardhana Widodo', timestamp: '2026-09-18 10:00' },
      { status: 'DIPROSES_TU', note: 'Disetujui Wali Kelas & diteruskan ke TU', byName: 'Siti Rahmawati, M.Pd.', timestamp: '2026-09-19 13:20' }
    ]
  }
];

export const initialDocuments = [
  {
    id: 'DOC-2026-001',
    title: 'Surat Keterangan Siswa Aktif - Aditiya Lukmanul Hakim (XI-A)',
    category: 'Surat Keterangan',
    requestId: 'REQ-2026-001',
    studentId: 'usr-student-xia-01',
    studentName: 'Aditiya Lukmanul Hakim',
    fileName: 'Surat_Keterangan_Aktif_2026110101.pdf',
    fileSize: '512 KB',
    uploadedBy: 'Hj. Ratna Sari, S.E. (TU)',
    uploadedAt: '2026-09-11 14:15',
    note: 'Diterbitkan secara resmi dengan cap stempel TU SMA Negeri 6 Semarang.'
  }
];

export const initialNotifications = [
  {
    id: 'NOTIF-1',
    userId: 'usr-student-xia-01',
    title: 'Pengajuan Disetujui!',
    message: 'Surat Keterangan Siswa Aktif (REQ-2026-001) telah disahkan TU dan siap diunduh.',
    type: 'success',
    isRead: false,
    createdAt: '2026-09-11 14:15'
  },
  {
    id: 'NOTIF-2',
    userId: 'usr-teacher-1',
    title: 'Pengajuan Izin Masuk',
    message: 'Aisyah Aluna Nasyafa (XI-A) mengajukan Izin Sakit (REQ-2026-002) membutuhkan verifikasi.',
    type: 'warning',
    isRead: false,
    createdAt: '2026-09-20 07:15'
  }
];
