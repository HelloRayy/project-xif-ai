# Task Checklist: Migrasi SchoolAdmin ke Vanilla HTML, CSS, & JS

## Phase 1: Foundation & Core Services
- [x] **Task 1.1**: Buat shell `index.html` dan file stylesheet `css/styles.css`.
  - Acceptance Criteria: Template HTML siap dengan Tailwind CDN, Lucide CDN, SheetJS CDN, dan font Inter.
- [x] **Task 1.2**: Buat storage engine `js/services/storage.js`.
  - Acceptance Criteria: Menyediakan method CRUD untuk akun, siswa, pengajuan izin/dispensasi, notifikasi, dan seed sample data.
- [x] **Task 1.3**: Buat AI engine `js/services/ai-engine.js`.
  - Acceptance Criteria: Menjawab alur prosedur & syarat dokumen resmi serta eskalasi staf manusia.

## Phase 2: Navigation, Authentication, & Shared Components
- [x] **Task 2.1**: Buat komponen `js/components/navbar.js`.
  - Acceptance Criteria: Menampilkan profil aktif, role badge, dropdown notifikasi in-app, dan tombol logout.
- [x] **Task 2.2**: Buat komponen `js/components/sidebar.js`.
  - Acceptance Criteria: Menampilkan navigasi dinamis sesuai peran login ("Menu Utama") dan banner Asisten AI.
- [x] **Task 2.3**: Buat komponen `js/components/ai-modal.js`.
  - Acceptance Criteria: Popup chat AI interaktif dengan pengetikan realistis dan tombol topik cepat.
- [x] **Task 2.4**: Buat view login `js/views/login.js`.
  - Acceptance Criteria: Login 3 peran, tombol 1-klik akun demo, dan form registrasi akun baru.

## Phase 3: Role Dashboards & App Router
- [x] **Task 3.1**: Buat view siswa `js/views/student.js`.
  - Acceptance Criteria: Form izin/dispensasi digital, upload file, tracking timeline status, dan unduh dokumen.
- [x] **Task 3.2**: Buat view wali kelas `js/views/teacher.js`.
  - Acceptance Criteria: Antrean verifikasi pengajuan, modal setujui/tolak dengan catatan alasan, dan rekap absensi.
- [x] **Task 3.3**: Buat view admin TU `js/views/admin.js`.
  - Acceptance Criteria: Monitoring terpusat, pengesahan TU, CRUD data siswa + import Excel massal, ekspor rekap ke Excel (.xlsx).
- [x] **Task 3.4**: Integrasikan seluruh views ke dalam `js/app.js`.
  - Acceptance Criteria: Alur routing tab dinamis tanpa reload halaman.

## Verification & Final Check
- [x] Validasi alur pengajuan end-to-end (Siswa ➔ Wali Kelas ➔ TU ➔ Siswa).
- [x] Uji coba Asisten AI dan ekspor file Excel.
- [x] Server statis berjalan aktif di port 3000 dengan status 200 OK.
