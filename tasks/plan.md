# Implementation Plan: Migrasi SchoolAdmin ke Pure Vanilla HTML, CSS, & JavaScript

## Overview
Rencana komprehensif migrasi aplikasi web **SchoolAdmin** dari React+Vite ke **Pure Vanilla HTML5, CSS3, & Modern Vanilla JavaScript (ES6 Modules)**. Migrasi ini menghasilkan aplikasi yang **100% Zero-Build-Step** (dapat dibuka langsung di browser tanpa `npm`, Node.js, atau bundler), sangat portabel, ringan, dan mudah dijalankan di komputer sekolah manapun.

---

## Analisis Perbandingan (React vs Vanilla HTML/CSS/JS)

| Parameter | React + Vite (Saat Ini) | Vanilla HTML + CSS + JS (Rencana Migrasi) |
| :--- | :--- | :--- |
| **Kebutuhan Node.js / Build** | Wajib `npm install` & `npm run dev` | **Zero Build**. Cukup buka `index.html` di browser atau Live Server |
| **Ukuran & Kompleksitas** | Memerlukan folder `node_modules` (~100MB) | **Sangat Ringan** (< 2MB total aset) |
| **Portabilitas Demo** | Harus ada environment Node.js | **Dapat di-zip / di-copy ke flashdisk** & langsung jalan di PC manapun |
| **Penyimpanan Data** | Browser `localStorage` | Browser `localStorage` (tetap sama & kompatibel 100%) |
| **Kemudahan Modifikasi** | Memerlukan pemahaman JSX & React State | Struktur file standar HTML, CSS, JS yang dipahami semua kalangan |

---

## Arsitektur Desain Vanilla Modular

Aplikasi akan disusun secara modular menggunakan **ES6 Modules (`type="module"`)**:

```plaintext
/home/rayhan/project-ai-xif/
├── index.html                # Single-Page Application Shell (Tailwind CDN, Lucide CDN, SheetJS CDN)
├── css/
│   └── styles.css            # Desain kustom tema Tosca & White, animasi mikro, scrollbar
├── js/
│   ├── app.js                # Router, Event Bus, & State Manager utama
│   ├── services/
│   │   ├── storage.js        # Data engine persistent localStorage (User, Siswa, Izin, Dokumen, Notif)
│   │   └── ai-engine.js      # AI Knowledge Base & prosedur FAQ engine
│   ├── components/
│   │   ├── navbar.js         # Header bar, badge peran, dropdown notifikasi in-app
│   │   ├── sidebar.js        # Navigasi samping dinamis & widget AI
│   │   └── ai-modal.js       # Widget popup chat Asisten AI dengan simulasi mengetik
│   └── views/
│       ├── login.js          # Tampilan Login Formal, role tab, registrasi & seed data
│       ├── student.js        # Dashboard Siswa (Form izin/dispensasi, status tracking, dokumen)
│       ├── teacher.js        # Dashboard Wali Kelas (Antrean verifikasi & rekap absensi)
│       └── admin.js          # Dashboard TU (Monitoring terpusat, CRUD Siswa, ekspor Excel)
```

---

## Task List Breakdown

### Phase 1: Fondasi & Core Engine
- [ ] **Task 1.1**: Buat struktur `index.html` dan `css/styles.css` dengan Tailwind CDN, Lucide Icons, SheetJS, dan styling tema Tosca & White.
- [ ] **Task 1.2**: Konversi `src/services/storage.js` menjadi vanilla ES6 module `js/services/storage.js`.
- [ ] **Task 1.3**: Konversi `src/services/aiKnowledgeBase.js` menjadi vanilla ES6 module `js/services/ai-engine.js`.

### Checkpoint 1: Engine & Shared Services
- [ ] Storage CRUD, seeder data, dan AI engine teruji di browser console tanpa error.

### Phase 2: Komponen Navigasi & Sistem Login
- [ ] **Task 2.1**: Buat komponen `js/components/navbar.js` (profil peran, notifikasi in-app, tombol data demo).
- [ ] **Task 2.2**: Buat komponen `js/components/sidebar.js` (navigasi peran & menu utama).
- [ ] **Task 2.3**: Buat komponen `js/components/ai-modal.js` (popup chat AI, topik cepat, pengetikan realistis).
- [ ] **Task 2.4**: Buat view `js/views/login.js` (pilihan peran Siswa/Wali/TU, tombol seed demo instan, registrasi akun).

### Checkpoint 2: Autentikasi & Shell Layout
- [ ] Pengguna dapat login/logout dengan 3 peran, berpindah menu di sidebar, dan membuka chat AI.

### Phase 3: Dashboard Multi-Peran (Siswa, Wali Kelas, TU)
- [ ] **Task 3.1**: Buat view `js/views/student.js` (Statistik, form izin/dispensasi digital, upload file, lacak status timeline, dokumen saya).
- [ ] **Task 3.2**: Buat view `js/views/teacher.js` (Antrean verifikasi kelas, persetujuan/penolakan + catatan, rekap absensi).
- [ ] **Task 3.3**: Buat view `js/views/admin.js` (Monitoring terpusat, takeover TU, CRUD siswa + import Excel massal, ekspor laporan `.xlsx`).
- [ ] **Task 3.4**: Integrasikan seluruh views ke dalam `js/app.js`.

### Checkpoint 3: End-to-End Verification
- [ ] Alur pengajuan Siswa ➔ Verifikasi Wali Kelas ➔ Pengesahan TU ➔ Notifikasi Siswa teruji sempurna.
- [ ] Fitur ekspor Excel dan Asisten AI bekerja 100%.

---

## Risiko & Mitigasi
| Risiko | Dampak | Strategi Mitigasi |
| :--- | :--- | :--- |
| DOM re-rendering glitch saat ganti tab | Rendah | Menggunakan fungsi render view modular yang bersih dan terisolasi. |
| CORS saat membuka file via `file://` | Sedang | Menggunakan struktur modular standar yang didukung `python3 -m http.server` atau Live Server ekstensi. |
| Dependensi CDN external offline | Rendah | Menggunakan CDN terpercaya (Tailwind CDN, Lucide, SheetJS) dengan fallback. |
