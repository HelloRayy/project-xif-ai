# Database Skema untuk SchoolAdmin (Supabase SQL)
# Jalankan kode SQL ini di dashboard Supabase: Menu "SQL Editor" -> "New query" -> "Run"

-- 1. Tabel Pengguna (Users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_label TEXT,
  assigned_class TEXT,
  class TEXT,
  nip TEXT,
  nisn TEXT,
  nis TEXT,
  status TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Permohonan Izin (Requests)
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  sub_type TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_nis TEXT,
  student_class TEXT NOT NULL,
  teacher_name TEXT,
  purpose TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  time_span_formatted TEXT,
  start_period INT,
  end_period INT,
  period_time TEXT,
  is_multi_day BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'MENUNGGU_VERIFIKASI',
  teacher_note TEXT,
  tu_note TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Nonaktifkan RLS (Row Level Security) untuk akses mudah awal (atau izinkan publik)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;

-- 4. Aktifkan Realtime agar perubahan instan antar-perangkat
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
