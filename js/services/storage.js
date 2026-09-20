/**
 * Storage Service - LocalStorage Persistence & Mock Database for SchoolAdmin (Vanilla ES6)
 */

export const STORAGE_KEYS = {
  CURRENT_USER: 'schooladmin_current_user',
  USERS: 'schooladmin_users',
  STUDENTS: 'schooladmin_students',
  REQUESTS: 'schooladmin_requests',
  DOCUMENTS: 'schooladmin_documents',
  NOTIFICATIONS: 'schooladmin_notifications',
};

// Default Sample Data (Used for 1-Click Demo)
export const SEED_DATA = {
  users: [
    {
      id: 'usr-admin-1',
      username: 'admin.tu',
      password: 'password123',
      name: 'Hj. Ratna Sari, S.E.',
      role: 'ADMIN',
      roleLabel: 'Staf TU / Admin Utama',
      email: 'tu.admin@sma1negeri.sch.id',
      phone: '0812-9900-1122',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-teacher-1',
      username: 'guru.ahmad',
      password: 'password123',
      name: 'Ahmad Dahlan, S.Pd.',
      role: 'TEACHER',
      roleLabel: 'Wali Kelas X-IPA 1',
      assignedClass: 'X-IPA 1',
      email: 'ahmad.dahlan@sma1negeri.sch.id',
      phone: '0813-8877-6655',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-student-1',
      username: 'siswa.budi',
      password: 'password123',
      name: 'Budi Santoso',
      role: 'STUDENT',
      roleLabel: 'Siswa Kelas X-IPA 1',
      nis: '20261001',
      nisn: '0081234567',
      class: 'X-IPA 1',
      gender: 'Laki-laki',
      guardianName: 'Bambang Santoso',
      guardianPhone: '0815-4433-2211',
      address: 'Jl. Merdeka No. 45, Jakarta Pusat',
      email: 'budi.santoso@siswa.sch.id',
      phone: '0896-1234-5678',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-student-2',
      username: 'siswa.anisa',
      password: 'password123',
      name: 'Anisa Putri',
      role: 'STUDENT',
      roleLabel: 'Siswa Kelas X-IPA 1',
      nis: '20261002',
      nisn: '0081234568',
      class: 'X-IPA 1',
      gender: 'Perempuan',
      guardianName: 'Hendra Putri',
      guardianPhone: '0815-9988-7766',
      address: 'Jl. Melati Indah No. 12, Jakarta Pusat',
      email: 'anisa.putri@siswa.sch.id',
      phone: '0896-8765-4321',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  ],
  students: [
    {
      id: 'usr-student-1',
      nis: '20261001',
      nisn: '0081234567',
      name: 'Budi Santoso',
      class: 'X-IPA 1',
      gender: 'Laki-laki',
      guardianName: 'Bambang Santoso',
      guardianPhone: '0815-4433-2211',
      email: 'budi.santoso@siswa.sch.id',
      phone: '0896-1234-5678',
      status: 'Aktif'
    },
    {
      id: 'usr-student-2',
      nis: '20261002',
      nisn: '0081234568',
      name: 'Anisa Putri',
      class: 'X-IPA 1',
      gender: 'Perempuan',
      guardianName: 'Hendra Putri',
      guardianPhone: '0815-9988-7766',
      email: 'anisa.putri@siswa.sch.id',
      phone: '0896-8765-4321',
      status: 'Aktif'
    }
  ],
  requests: [
    {
      id: 'REQ-2026-001',
      type: 'IZIN_TIDAK_HADIR',
      subType: 'Izin Sakit',
      studentId: 'usr-student-1',
      studentName: 'Budi Santoso',
      studentNis: '20261001',
      studentClass: 'X-IPA 1',
      teacherName: 'Ahmad Dahlan, S.Pd.',
      purpose: 'Sakit Demam & Batuk (Istirahat dokter 2 hari)',
      startDate: '2026-08-12',
      endDate: '2026-08-13',
      status: 'MENUNGGU_VERIFIKASI',
      teacherNote: '',
      adminNote: '',
      createdAt: '2026-08-12 07:15',
      updatedAt: '2026-08-12 07:15',
      attachments: [
        { name: 'Surat_Keterangan_Dokter_Klinik.jpg', size: '1.2 MB', type: 'image/jpeg' }
      ],
      timeline: [
        { status: 'MENUNGGU_VERIFIKASI', note: 'Pengajuan dibuat oleh siswa', byName: 'Budi Santoso', timestamp: '2026-08-12 07:15' }
      ]
    },
    {
      id: 'REQ-2026-002',
      type: 'DISPENSASI',
      subType: 'Dispensasi Lomba / Olimpiade',
      studentId: 'usr-student-2',
      studentName: 'Anisa Putri',
      studentNis: '20261002',
      studentClass: 'X-IPA 1',
      teacherName: 'Ahmad Dahlan, S.Pd.',
      purpose: 'Mengikuti Babak Final OSN Informatika Tingkat Provinsi',
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      status: 'DIPROSES_TU',
      teacherNote: 'Sangat didukung. Selamat berjuang untuk Anisa.',
      adminNote: '',
      createdAt: '2026-08-11 10:00',
      updatedAt: '2026-08-11 13:20',
      attachments: [
        { name: 'Surat_Undangan_OSN_Provinsi.pdf', size: '850 KB', type: 'application/pdf' }
      ],
      timeline: [
        { status: 'MENUNGGU_VERIFIKASI', note: 'Pengajuan dibuat oleh siswa', byName: 'Anisa Putri', timestamp: '2026-08-11 10:00' },
        { status: 'DIPROSES_TU', note: 'Disetujui Wali Kelas & diteruskan ke TU', byName: 'Ahmad Dahlan, S.Pd.', timestamp: '2026-08-11 13:20' }
      ]
    }
  ],
  documents: [
    {
      id: 'DOC-2026-001',
      title: 'Surat Dispensasi Lomba OSN - Anisa Putri (X-IPA 1)',
      category: 'Dispensasi',
      requestId: 'REQ-2026-002',
      studentId: 'usr-student-2',
      studentName: 'Anisa Putri',
      fileName: 'Surat_Dispensasi_OSN_20261002.pdf',
      fileSize: '620 KB',
      uploadedBy: 'Hj. Ratna Sari, S.E. (TU)',
      uploadedAt: '2026-08-11 14:15',
      note: 'Diterbitkan secara resmi oleh Tata Usaha.'
    }
  ],
  notifications: [
    {
      id: 'NOTIF-1',
      userId: 'usr-student-2',
      title: 'Pengajuan Disetujui!',
      message: 'Dispensasi Lomba OSN telah disetujui TU dan surat resmi siap diunduh.',
      type: 'success',
      isRead: false,
      createdAt: '2026-08-11 14:15'
    },
    {
      id: 'NOTIF-2',
      userId: 'usr-teacher-1',
      title: 'Pengajuan Izin Baru',
      message: 'Siswa Budi Santoso mengajukan Izin Sakit (REQ-2026-001) membutuhkan verifikasi Anda.',
      type: 'warning',
      isRead: false,
      createdAt: '2026-08-12 07:15'
    }
  ]
};

// Initialize Storage helper
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

// Seed storage with realistic sample data
export const seedSampleData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_DATA.users));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_DATA.students));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_DATA.requests));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(SEED_DATA.documents));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_DATA.notifications));
  return true;
};

// Clear all storage back to empty
export const clearStorageData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Getters & Setters
export const getCurrentUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getUsers = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (newUser) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === newUser.id || u.username === newUser.username);
  if (index >= 0) {
    users[index] = { ...users[index], ...newUser };
  } else {
    users.push(newUser);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  if (newUser.role === 'STUDENT') {
    saveStudent({
      id: newUser.id,
      nis: newUser.nis || '2026999',
      nisn: newUser.nisn || '0089999',
      name: newUser.name,
      class: newUser.class || 'X-IPA 1',
      gender: newUser.gender || 'Laki-laki',
      guardianName: newUser.guardianName || '-',
      guardianPhone: newUser.guardianPhone || '-',
      email: newUser.email || '',
      phone: newUser.phone || '',
      status: 'Aktif'
    });
  }
  return newUser;
};

export const getStudents = () => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveStudent = (studentData) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === studentData.id || s.nis === studentData.nis);
  if (index >= 0) {
    students[index] = { ...students[index], ...studentData };
  } else {
    students.push(studentData);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const deleteStudent = (studentId) => {
  const students = getStudents().filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  const users = getUsers().filter(u => u.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getRequests = () => {
  const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  return data ? JSON.parse(data) : [];
};

export const createRequest = (requestData) => {
  const requests = getRequests();
  const newId = `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newReq = {
    id: newId,
    status: 'MENUNGGU_VERIFIKASI',
    createdAt: now,
    updatedAt: now,
    teacherNote: '',
    adminNote: '',
    attachments: requestData.attachments || [],
    timeline: [
      {
        status: 'MENUNGGU_VERIFIKASI',
        note: 'Pengajuan berhasil dibuat oleh siswa',
        byName: requestData.studentName,
        byRole: 'STUDENT',
        timestamp: now
      }
    ],
    ...requestData
  };

  requests.unshift(newReq);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Notify Homeroom Teacher
  const users = getUsers();
  const teachers = users.filter(u => u.role === 'TEACHER');
  teachers.forEach(t => {
    addNotification({
      userId: t.id,
      title: 'Pengajuan Baru Membutuhkan Verifikasi',
      message: `${requestData.studentName} (${requestData.studentClass}) mengajukan ${requestData.subType}.`,
      type: 'warning'
    });
  });

  return newReq;
};

export const updateRequestStatus = (requestId, newStatus, note = '', currentUser) => {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) return null;

  const req = requests[index];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  req.status = newStatus;
  req.updatedAt = now;

  if (currentUser?.role === 'TEACHER') {
    req.teacherNote = note;
  } else if (currentUser?.role === 'ADMIN') {
    req.adminNote = note;
  }

  const statusLabels = {
    MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
    DIPROSES_TU: 'Disetujui Wali Kelas & Diteruskan ke TU',
    DISETUJUI: 'Disetujui & Diterbitkan secara Resmi',
    DITOLAK: 'Ditolak dengan Catatan',
    DIBATALKAN: 'Dibatalkan oleh Siswa'
  };

  req.timeline.push({
    status: newStatus,
    note: note || `Status diperbarui menjadi: ${statusLabels[newStatus]}`,
    byName: currentUser?.name || 'Sistem',
    byRole: currentUser?.role || 'SYSTEM',
    timestamp: now
  });

  requests[index] = req;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Notify student
  addNotification({
    userId: req.studentId,
    title: `Status Pengajuan ${req.id}: ${statusLabels[newStatus]}`,
    message: note ? `Catatan: "${note}"` : `Pengajuan ${req.subType} telah diperbarui oleh ${currentUser?.name}.`,
    type: newStatus === 'DISETUJUI' ? 'success' : newStatus === 'DITOLAK' ? 'danger' : 'info'
  });

  return req;
};

export const cancelRequest = (requestId, studentId) => {
  const requests = getRequests();
  const req = requests.find(r => r.id === requestId && r.studentId === studentId);
  if (req && req.status === 'MENUNGGU_VERIFIKASI') {
    return updateRequestStatus(requestId, 'DIBATALKAN', 'Pengajuan dibatalkan oleh siswa secara mandiri', { name: req.studentName, role: 'STUDENT' });
  }
  return null;
};

export const getDocuments = () => {
  const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveDocument = (docData) => {
  const docs = getDocuments();
  const newId = `DOC-2026-${String(docs.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newDoc = {
    id: newId,
    uploadedAt: now,
    ...docData
  };

  docs.unshift(newDoc);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  return newDoc;
};

export const getNotifications = (userId) => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const allNotifs = data ? JSON.parse(data) : [];
  return allNotifs.filter(n => n.userId === userId);
};

export const addNotification = ({ userId, title, message, type = 'info' }) => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  const allNotifs = data ? JSON.parse(data) : [];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newNotif = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: now
  };

  allNotifs.unshift(newNotif);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
};

export const markNotificationsRead = (userId) => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  let allNotifs = data ? JSON.parse(data) : [];
  allNotifs = allNotifs.map(n => n.userId === userId ? { ...n, isRead: true } : n);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs));
};
