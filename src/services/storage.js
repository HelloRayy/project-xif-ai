/**
 * Storage Service - LocalStorage Persistence & Mock Database for SchoolAdmin
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'schooladmin_current_user',
  USERS: 'schooladmin_users',
  STUDENTS: 'schooladmin_students',
  TEACHERS: 'schooladmin_teachers',
  REQUESTS: 'schooladmin_requests',
  DOCUMENTS: 'schooladmin_documents',
  NOTIFICATIONS: 'schooladmin_notifications',
  TEMPLATES: 'schooladmin_templates',
  PORTAL_LOCK: 'schooladmin_portal_lock_mode', // 'AUTO' | 'FORCE_UNLOCK' | 'FORCE_LOCKED'
};

import {
  initialStudents,
  allInitialUsers,
  initialRequests,
  initialDocuments,
  initialNotifications
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default Sample Data (used when Seed Data button is triggered or for reference)
export const SEED_DATA = {
  users: allInitialUsers,
  students: initialStudents,
  requests: initialRequests,
  documents: initialDocuments,
  notifications: initialNotifications
};

// Initialize Storage helper
export const initStorage = () => {
  // Always ensure default users and students are populated
  getUsers();
  getStudents();
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(initialRequests));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(initialDocuments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }

  // If Supabase is configured, pull latest remote users and requests in background
  if (isSupabaseConfigured && supabase) {
    syncFromSupabase();
  }
};

export const syncFromSupabase = async () => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: remoteUsers, error: uErr } = await supabase.from('users').select('*');
    if (!uErr && remoteUsers && remoteUsers.length > 0) {
      const localUsers = getUsers();
      const userMap = new Map();
      localUsers.forEach(u => userMap.set(u.username?.toLowerCase(), u));
      remoteUsers.forEach(ru => {
        userMap.set(ru.username?.toLowerCase(), {
          id: ru.id,
          username: ru.username,
          password: ru.password,
          name: ru.name,
          role: ru.role,
          roleLabel: ru.role_label,
          assignedClass: ru.assigned_class,
          class: ru.class,
          nip: ru.nip,
          nisn: ru.nisn,
          nis: ru.nis,
          status: ru.status
        });
      });
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(Array.from(userMap.values())));
    }

    const { data: remoteReqs, error: rErr } = await supabase.from('requests').select('*');
    if (!rErr && remoteReqs && remoteReqs.length > 0) {
      const localReqs = getRequests();
      const reqMap = new Map();
      localReqs.forEach(r => reqMap.set(r.id, r));
      remoteReqs.forEach(rr => {
        reqMap.set(rr.id, {
          id: rr.id,
          type: rr.type,
          subType: rr.sub_type,
          studentId: rr.student_id,
          studentName: rr.student_name,
          studentNis: rr.student_nis,
          studentClass: rr.student_class,
          teacherName: rr.teacher_name,
          purpose: rr.purpose,
          startDate: rr.start_date,
          endDate: rr.end_date,
          timeSpanFormatted: rr.time_span_formatted,
          startPeriod: rr.start_period,
          endPeriod: rr.end_period,
          periodTime: rr.period_time,
          isMultiDay: rr.is_multi_day,
          status: rr.status,
          teacherNote: rr.teacher_note,
          tuNote: rr.tu_note,
          notes: rr.notes,
          attachments: rr.attachments || [],
          timeline: rr.timeline || [],
          createdAt: rr.created_at,
          updatedAt: rr.updated_at
        });
      });
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(Array.from(reqMap.values())));
    }
  } catch (err) {
    console.warn('Cloud sync background error:', err);
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
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    const existing = data ? JSON.parse(data) : [];
    
    const map = new Map();
    // 1. Initial base users (admin, teachers for XI-A to XI-F, and all 216 students)
    allInitialUsers.forEach(u => {
      map.set(u.username.toLowerCase(), u);
    });
    // 2. Merge any user data from localStorage
    existing.forEach(u => {
      if (u && u.username) {
        const base = map.get(u.username.toLowerCase()) || {};
        const updated = { ...base, ...u };
        if (updated.role === 'TEACHER' || updated.role === 'ADMIN') {
          updated.nip = '12345';
        }
        map.set(u.username.toLowerCase(), updated);
      }
    });

    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return allInitialUsers;
  }
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

  // If user is student, also sync to students store
  if (newUser.role === 'STUDENT') {
    saveStudent({
      id: newUser.id,
      nis: newUser.nis || '2026999',
      nisn: newUser.nisn || '0089999',
      name: newUser.name,
      class: newUser.class || 'XI-A',
      gender: newUser.gender || 'Laki-laki',
      guardianName: newUser.guardianName || '-',
      guardianPhone: newUser.guardianPhone || '-',
      email: newUser.email || '',
      phone: newUser.phone || '',
      status: 'Aktif'
    });
  }

  // Push to Supabase if connected
  if (isSupabaseConfigured && supabase) {
    supabase.from('users').upsert({
      id: newUser.id,
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      role: newUser.role,
      role_label: newUser.roleLabel,
      assigned_class: newUser.assignedClass,
      class: newUser.class,
      nip: newUser.nip,
      nisn: newUser.nisn,
      nis: newUser.nis,
      status: newUser.status || 'Aktif'
    }).then(({ error }) => {
      if (error) console.warn('Supabase saveUser error:', error);
    });
  }

  return newUser;
};

export const getStudents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const existing = data ? JSON.parse(data) : [];
    
    const map = new Map();
    initialStudents.forEach(s => {
      map.set(s.id, s);
    });
    existing.forEach(s => {
      if (s && s.id) {
        map.set(s.id, { ...map.get(s.id), ...s });
      }
    });

    const merged = Array.from(map.values());
    if (merged.length !== existing.length) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
    }
    return merged;
  } catch (err) {
    console.error('Error reading students from storage:', err);
    return initialStudents;
  }
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
  if (!data) return [];
  const reqs = JSON.parse(data);
  return reqs.map(r => ({
    ...r,
    attachments: (r.attachments || []).map(att => {
      const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png)$/i);
      if (isImg && !att.previewUrl) {
        return {
          ...att,
          previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80'
        };
      }
      return att;
    })
  }));
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

  // Push to Supabase
  if (isSupabaseConfigured && supabase) {
    supabase.from('requests').upsert({
      id: newReq.id,
      type: newReq.type,
      sub_type: newReq.subType,
      student_id: newReq.studentId,
      student_name: newReq.studentName,
      student_nis: newReq.studentNis,
      student_class: newReq.studentClass,
      teacher_name: newReq.teacherName,
      purpose: newReq.purpose,
      start_date: newReq.startDate,
      end_date: newReq.endDate,
      time_span_formatted: newReq.timeSpanFormatted,
      start_period: newReq.startPeriod,
      end_period: newReq.endPeriod,
      period_time: newReq.periodTime,
      is_multi_day: newReq.isMultiDay,
      status: newReq.status,
      teacher_note: newReq.teacherNote,
      tu_note: newReq.tuNote,
      notes: newReq.notes,
      attachments: newReq.attachments || [],
      timeline: newReq.timeline || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Supabase createRequest error:', error);
    });
  }

  // Create notification for Homeroom Teacher / TU
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

  // Record timeline
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

  // Push updated status to Supabase
  if (isSupabaseConfigured && supabase) {
    supabase.from('requests').update({
      status: req.status,
      teacher_note: req.teacherNote,
      admin_note: req.adminNote,
      updated_at: new Date().toISOString(),
      timeline: req.timeline
    }).eq('id', req.id).then(({ error }) => {
      if (error) console.warn('Supabase updateRequestStatus error:', error);
    });
  }

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
    id: `NOTIF-${Date.now()}`,
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

/**
 * Portal Access Lock Helper for Students:
 * Operates between 07:30 and 15:30 WIB by default.
 * Mode: 'AUTO' (follows 07:30 - 15:30 schedule) | 'FORCE_UNLOCK' (emergency BK override) | 'FORCE_LOCKED'
 */
export const getPortalLockMode = () => {
  return localStorage.getItem(STORAGE_KEYS.PORTAL_LOCK) || 'AUTO';
};

export const setPortalLockMode = (mode) => {
  localStorage.setItem(STORAGE_KEYS.PORTAL_LOCK, mode);
  window.dispatchEvent(new Event('portal_lock_changed'));
};

export const isPortalLockedNow = () => {
  const mode = getPortalLockMode();
  if (mode === 'FORCE_UNLOCK') return false;
  if (mode === 'FORCE_LOCKED') return true;

  // AUTO Mode: Check current system time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lockStartMinutes = 7 * 60 + 30;  // 07:30
  const lockEndMinutes = 15 * 60 + 30;  // 15:30

  return currentMinutes >= lockStartMinutes && currentMinutes < lockEndMinutes;
};
