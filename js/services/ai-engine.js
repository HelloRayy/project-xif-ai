/**
 * AI Knowledge Base Assistant Engine for SchoolAdmin (Vanilla ES6)
 * Strict knowledge-base driven answers for school administration procedures & guidelines.
 */

export const KNOWLEDGE_BASE = [
  {
    category: 'Izin Sakit / Tidak Hadir',
    keywords: ['sakit', 'izin sakit', 'tidak masuk', 'izin keluarga', 'acara keluarga', 'alpa', 'halangan', 'tidak hadir'],
    title: 'Prosedur & Syarat Pengajuan Izin Sakit / Tidak Hadir',
    answer: `Untuk mengajukan **Izin Tidak Hadir (Sakit / Izin Keluarga)**:\n\n` +
      `📋 **Dokumen Persyaratan Wajib:**\n` +
      `1. **Izin Sakit:** Surat Keterangan Sakit dari Dokter/Klinik/Puskesmas atau Surat Pernyataan Orang Tua jika sakit ringan (1 hari).\n` +
      `2. **Izin Keluarga:** Surat Izin Tertulis dari Orang Tua/Wali murid.\n\n` +
      `⏱️ **Batas Waktu Pengajuan:** Maksimal diajukan pukul 07.30 WIB pada hari H atau H-1 sebelum ketidakhadiran.\n` +
      `🔄 **Alur:** Pengajuan oleh Siswa ➔ Verifikasi & Persetujuan Langsung oleh Wali Kelas ➔ Otomatis memperbarui Rekap Absensi.`,
    actionSuggest: 'NEW_REQUEST'
  },
  {
    category: 'Dispensasi',
    keywords: ['dispensasi', 'lomba', 'kegiatan luar', 'tugas sekolah', 'olimpiade', 'osn', 'o2sn', 'paskibra'],
    title: 'Prosedur & Syarat Pengajuan Dispensasi Kegiatan',
    answer: `Untuk mengajukan **Dispensasi (Meninggalkan Kelas / Mengikuti Kegiatan Luar)**:\n\n` +
      `📋 **Dokumen Persyaratan Wajib:**\n` +
      `1. Surat Undangan / Mandat Kegiatan resmi dari Penyelenggara / Pembina Ekstrakulikuler.\n` +
      `2. Jadwal/Rundown acara kegiatan.\n\n` +
      `⏱️ **Estimasi Waktu:** H-2 sebelum pelaksanaan kegiatan.\n` +
      `🔄 **Alur:** Pengajuan oleh Siswa ➔ Persetujuan Wali Kelas ➔ Pengesahan TU / Kesiswaan.`,
    actionSuggest: 'NEW_REQUEST'
  },
  {
    category: 'Jam Operasional TU',
    keywords: ['jam buka tu', 'jam operasional', 'lokasi tu', 'kontak tu', 'tata usaha', 'jam kerja'],
    title: 'Jam Operasional & Pelayanan Ruang Tata Usaha (TU)',
    answer: `Ruang Tata Usaha (TU) melayani administrasi fisik & verifikasi dokumen pada:\n\n` +
      `🕒 **Senin - Kamis:** 07.00 - 15.30 WIB\n` +
      `🕒 **Jumat:** 07.00 - 14.30 WIB (Istirahat 11.30 - 13.00 WIB)\n` +
      `📍 **Lokasi:** Gedung Utama Lantai 1 (Samping Ruang Kepala Sekolah)\n` +
      `📧 **Email Resmi:** tu@sma1negeri.sch.id`
  },
  {
    category: 'Status Pengajuan',
    keywords: ['status', 'lacak', 'lama proses', 'kenapa ditolak', 'revisi', 'menunggu verifikasi'],
    title: 'Penjelasan Status Pengajuan Administrasi',
    answer: `Status pengajuan Anda dapat dipantau secara real-time di Dashboard Siswa:\n\n` +
      `• 🟡 **Menunggu Verifikasi:** Pengajuan baru masuk, menunggu ditinjau oleh Wali Kelas Anda.\n` +
      `• 🔵 **Diproses TU:** Wali Kelas telah menyetujui, saat ini sedang dalam proses penerbitan oleh Tata Usaha.\n` +
      `• 🟢 **Disetujui:** Surat telah terbit / izin disahkan. Dokumen resmi dapat diunduh di tab 'Dokumen Saya'.\n` +
      `• 🔴 **Ditolak:** Pengajuan ditolak dengan alasan/catatan khusus (misal: dokumen pendukung tidak lengkap).`
  }
];

export const getAIResponse = (userMessage) => {
  const query = userMessage.toLowerCase().trim();

  let matchedTopic = null;
  let highestScore = 0;

  for (const topic of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (query.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      matchedTopic = topic;
    }
  }

  if (matchedTopic && highestScore >= 3) {
    return {
      isKB: true,
      category: matchedTopic.category,
      title: matchedTopic.title,
      text: matchedTopic.answer,
      actionSuggest: matchedTopic.actionSuggest || null,
      shouldEscalate: false
    };
  }

  return {
    isKB: false,
    title: 'Pertanyaan di Luar Cakupan Otomatis',
    text: `Mohon maaf, pertanyaan Anda membutuhkan penanganan langsung atau keputusan dari pihak sekolah.\n\n` +
      `AI Assistant SchoolAdmin diposisikan sebagai informasi prosedur dasar dan tidak memiliki wewenang pengambil keputusan.\n\n` +
      `Silakan hubungi staf terkait:`,
    shouldEscalate: true,
    escalationOptions: [
      { label: 'Hubungi Wali Kelas', roleTarget: 'TEACHER', note: 'Bertanya langsung mengenai perizinan kelas' },
      { label: 'Hubungi Staf TU / Admin', roleTarget: 'ADMIN', note: 'Bertanya seputar penerbitan surat resmi & arsip' }
    ]
  };
};
