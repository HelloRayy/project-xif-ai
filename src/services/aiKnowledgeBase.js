/**
 * AI Knowledge Base & Intelligent Assistant Engine for SchoolAdmin
 * Features:
 * 1. Fuzzy keyword matching & typo tolerance (Levenshtein distance)
 * 2. Intent classification & synonym normalization
 * 3. Real-time Live Data Querying (checks student's active requests from storage.js)
 * 4. Contextual Deep-link Actions (pre-fills form actions)
 */

import { getRequests } from './storage';

// 1. Comprehensive Knowledge Base
export const KNOWLEDGE_BASE = [
  {
    category: 'Surat Keterangan Aktif',
    synonyms: ['surat keterangan', 'keterangan aktif', 'surat aktif', 'sk aktif', 'beasiswa', 'tunjangan gaji', 'kuliah', 'prestasi', 'daftar lomba', 'surat resmi sekolah'],
    title: 'Prosedur & Syarat Surat Keterangan Siswa Aktif',
    answer: `Untuk mengajukan **Surat Keterangan Siswa Aktif** (keperluan beasiswa, tunjangan gaji orang tua, atau pendaftaran perlombaan):\n\n` +
      `📋 **Dokumen Persyaratan Wajib:**\n` +
      `1. Kartu Pelajar / NISN resmi siswa\n` +
      `2. Fotokopi KTP / KK Orang Tua (diunggah dalam format JPG/PDF)\n` +
      `3. Catatan tujuan instansi yang jelas\n\n` +
      `⏱️ **Estimasi Waktu:** 1 - 2 Hari Kerja.\n` +
      `🔄 **Alur:** Pengajuan oleh Siswa ➔ Verifikasi Wali Kelas ➔ Penerbitan & Cap Stempel Resmi TU ➔ Pengunduhan PDF di tab Dokumen.`,
    actionSuggest: 'BUAT_PENGAJUAN_SURAT',
    actionPayload: { tab: 'NEW_REQUEST', requestType: 'SURAT_KETERANGAN', subType: 'Surat Keterangan Siswa Aktif' }
  },
  {
    category: 'Izin Sakit / Tidak Hadir',
    synonyms: ['sakit', 'izin sakit', 'tidak masuk', 'demam', 'flu', 'pusing', 'rawat', 'opname', 'dokter', 'klinik', 'puskesmas', 'ijin sakit', 'surat sakit', 'males masuk', 'tidak enak badan', 'keluarga', 'halangan', 'acara keluarga'],
    title: 'Prosedur & Syarat Pengajuan Izin Sakit / Tidak Hadir',
    answer: `Untuk mengajukan **Izin Tidak Hadir (Sakit / Kepentingan Keluarga)**:\n\n` +
      `📋 **Ketentuan & Dokumen Pendukung:**\n` +
      `1. **Izin Sakit (≥ 2 Hari):** Wajib melampirkan foto Surat Keterangan Dokter / Klinik / Puskesmas.\n` +
      `2. **Izin Sakit Ringan (1 Hari):** Lampirkan surat izin tertulis bertandatangan orang tua.\n` +
      `3. **Izin Keperluan Keluarga:** Lampirkan surat keterangan izin dari wali murid.\n\n` +
      `⏱️ **Batas Waktu Pengajuan:** Maksimal diajukan pukul 07.30 WIB pada hari H.\n` +
      `🔄 **Alur:** Pengajuan oleh Siswa ➔ Persetujuan Langsung oleh Wali Kelas ➔ Otomatis memperbarui Rekapitulasi Presensi.`,
    actionSuggest: 'BUAT_PENGAJUAN_IZIN',
    actionPayload: { tab: 'NEW_REQUEST', requestType: 'IZIN_TIDAK_HADIR', subType: 'Izin Sakit' }
  },
  {
    category: 'Dispensasi Kegiatan & Lomba',
    synonyms: ['dispensasi', 'dispen', 'lomba', 'olimpiade', 'osn', 'o2sn', 'fls2n', 'paskibra', 'pramuka', 'futsal', 'basket', 'tanding', 'tugas luar', 'kegiatan osis', 'undangan lomba'],
    title: 'Prosedur & Syarat Pengajuan Dispensasi Kegiatan',
    answer: `Untuk mengajukan **Dispensasi (Meninggalkan Jam Pelajaran / Bertugas di Luar Sekolah)**:\n\n` +
      `📋 **Dokumen Persyaratan Wajib:**\n` +
      `1. Surat Undangan Resmi / Surat Tugas dari Penyelenggara atau Pembina Ekstrakulikuler.\n` +
      `2. Jadwal / Rundown kegiatan yang memuat tanggal dan waktu jelas.\n\n` +
      `⏱️ **Batas Waktu Pengajuan:** Minimal H-2 sebelum pelaksanaan kegiatan.\n` +
      `🔄 **Alur:** Pengajuan oleh Siswa ➔ Persetujuan Wali Kelas ➔ Verifikasi & Pengesahan oleh TU / Kesiswaan.`,
    actionSuggest: 'BUAT_PENGAJUAN_DISPENSASI',
    actionPayload: { tab: 'NEW_REQUEST', requestType: 'DISPENSASI', subType: 'Dispensasi Lomba / Olimpiade' }
  },
  {
    category: 'Jam Operasional & Pelayanan TU',
    synonyms: ['jam tu', 'jam operasional', 'jam kerja', 'lokasi tu', 'buka jam berapa', 'tutup jam berapa', 'kontak tu', 'tata usaha', 'ruang tu'],
    title: 'Jam Kerja & Pelayanan Ruang Tata Usaha (TU)',
    answer: `Ruang Tata Usaha (TU) melayani administrasi fisik, cap stempel, dan legalisir dokumen pada:\n\n` +
      `🕒 **Senin - Kamis:** 07.00 - 15.30 WIB\n` +
      `🕒 **Jumat:** 07.00 - 14.30 WIB *(Istirahat 11.30 - 13.00 WIB)*\n` +
      `📍 **Lokasi:** Gedung Utama Lantai 1 (Sebelah Ruang Kepala Sekolah)\n` +
      `📧 **Email Resmi:** tu@sma6semarang.sch.id`,
    actionSuggest: null
  },
  {
    category: 'Ketentuan Upload Lampiran Dokumen',
    synonyms: ['upload', 'format file', 'ukuran file', 'lampiran', 'foto buram', 'pdf', 'jpg', 'png', 'maksimal ukuran'],
    title: 'Panduan & Ketentuan Unggah Berkas Lampiran',
    answer: `Agar pengajuan Anda cepat disetujui tanpa kendala verifikasi:\n\n` +
      `📎 **Format File yang Didukung:** JPG, JPEG, PNG, dan PDF.\n` +
      `📏 **Ukuran Maksimal:** 5 MB per berkas.\n` +
      `✨ **Tips:** Pastikan foto surat dokter atau undangan terlihat jelas, tidak terpotong, dan dapat terbaca tanda tangan serta cap instansinya.`,
    actionSuggest: null
  }
];

// Helper: Levenshtein distance for fuzzy typo matching
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Check if two words are fuzzy similar (typo tolerant)
function isFuzzyMatch(word, target, maxDistance = 2) {
  if (word === target) return true;
  if (Math.abs(word.length - target.length) > maxDistance) return false;
  return levenshteinDistance(word, target) <= maxDistance;
}

// 2. Intelligent AI Response Engine
export const getAIResponse = (userMessage, currentUser = null) => {
  const query = userMessage.toLowerCase().trim();
  const queryTokens = query.split(/\s+/);

  // A. INTENT: Cek Status / Lacak Pengajuan Real-time Siswa
  const statusKeywords = ['status', 'lacak', 'pengajuanku', 'suratku', 'izin saya', 'progres', 'sudah disetujui', 'apakah disetujui', 'apakah selesai', 'cek status'];
  const isStatusIntent = statusKeywords.some(kw => query.includes(kw));

  if (isStatusIntent && currentUser) {
    const allRequests = getRequests();
    // Filter requests for current student
    const studentRequests = allRequests.filter(r => 
      r.studentId === currentUser.id || 
      (currentUser.name && r.studentName?.toLowerCase() === currentUser.name.toLowerCase())
    );

    if (studentRequests.length > 0) {
      const latest = studentRequests[0];
      const statusText = {
        MENUNGGU_VERIFIKASI: '🟡 Menunggu Verifikasi Wali Kelas',
        DIPROSES_TU: '🔵 Disetujui Wali Kelas & Sedang Diproses TU',
        DISETUJUI: '🟢 Telah Disetujui & Diterbitkan',
        DITOLAK: '🔴 Ditolak dengan Catatan',
        DIBATALKAN: '⚪ Dibatalkan oleh Siswa'
      }[latest.status] || latest.status;

      let responseText = `Halo **${currentUser.name || 'Siswa'}**, saya telah memeriksa data pengajuan aktif Anda di sistem:\n\n` +
        `📑 **ID Pengajuan:** \`${latest.id}\`\n` +
        `📝 **Jenis Permohonan:** ${latest.subType}\n` +
        `⏱️ **Periode:** ${latest.timeSpanFormatted || `${latest.startDate} s/d ${latest.endDate}`}\n` +
        `📊 **Status Terkini:** ${statusText}\n\n`;

      if (latest.teacherNote) {
        responseText += `💬 **Catatan Wali Kelas:** "${latest.teacherNote}"\n\n`;
      }
      if (latest.adminNote) {
        responseText += `🏢 **Catatan Tata Usaha:** "${latest.adminNote}"\n\n`;
      }

      responseText += `Anda dapat memantau riwayat lengkap atau mengunduh surat resmi pada tab **Riwayat Pengajuan**.`;

      return {
        isKB: true,
        category: 'Status Pengajuan Real-Time',
        title: `Pelacakan Status: ${latest.id}`,
        text: responseText,
        actionSuggest: 'LIHAT_RIWAYAT_PENGAJUAN',
        actionPayload: { tab: 'MY_REQUESTS' },
        shouldEscalate: false
      };
    } else {
      return {
        isKB: true,
        category: 'Status Pengajuan',
        title: 'Belum Ada Pengajuan Aktif',
        text: `Halo **${currentUser.name || 'Siswa'}**, saat ini belum ditemukan riwayat perizinan atau surat aktif atas nama Anda di sistem.\n\n` +
          `Jika Anda ingin membuat permohonan baru, silakan klik tombol **Buka Form Pengajuan** di bawah ini.`,
        actionSuggest: 'BUAT_PENGAJUAN',
        actionPayload: { tab: 'NEW_REQUEST' },
        shouldEscalate: false
      };
    }
  }

  // B. KNOWLEDGE BASE MATCHING WITH FUZZY SCORING & SYNONYMS
  let bestMatch = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;

    for (const syn of item.synonyms) {
      const synLower = syn.toLowerCase();
      
      // Exact substring match (high score)
      if (query.includes(synLower)) {
        score += synLower.length * 3;
      } else {
        // Token-by-token fuzzy match (handles typos like 'syrat', 'doktr', 'dispen')
        const synTokens = synLower.split(/\s+/);
        for (const sTok of synTokens) {
          for (const qTok of queryTokens) {
            if (qTok.length >= 3 && isFuzzyMatch(qTok, sTok, 1)) {
              score += sTok.length * 2;
            }
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold: If high enough match, return standard procedural answer
  if (bestMatch && highestScore >= 6) {
    return {
      isKB: true,
      category: bestMatch.category,
      title: bestMatch.title,
      text: bestMatch.answer,
      actionSuggest: bestMatch.actionSuggest || null,
      actionPayload: bestMatch.actionPayload || null,
      shouldEscalate: false
    };
  }

  // C. FALLBACK / OUT-OF-BOUND ESCALATION
  return {
    isKB: false,
    title: 'Pertanyaan Khusus / Diluar Prosedur Baku',
    text: `Mohon maaf, pertanyaan Anda berkaitan dengan kebijakan khusus yang memerlukan konfirmasi langsung dari guru atau staf sekolah.\n\n` +
      `Asisten AI SchoolAdmin diprogram untuk panduan resmi standar (Izin Sakit, Surat Keterangan, Dispensasi, dan Jam Kerja TU).\n\n` +
      `Silakan hubungi pihak terkait di bawah ini untuk konsultasi langsung:`,
    shouldEscalate: true,
    escalationOptions: [
      { label: 'Wali Kelas', roleTarget: 'TEACHER', note: 'Untuk izin khusus, konsultasi presensi, dan dispensasi kelas' },
      { label: 'Staf Tata Usaha (TU)', roleTarget: 'ADMIN', note: 'Untuk legalisir, surat rekomendasi dinas, dan nomor surat' }
    ]
  };
};
