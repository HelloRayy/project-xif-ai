import { getRequests, createRequest, cancelRequest, getDocuments } from '../services/storage.js';

let studentAttachments = [];

export function renderStudentDashboard(currentUser, activeTab, onSelectTab) {
  const requests = getRequests().filter(r => r.studentId === currentUser.id);
  const documents = getDocuments().filter(d => d.studentId === currentUser.id);

  const approvedCount = requests.filter(r => r.status === 'DISETUJUI').length;
  const pendingCount = requests.filter(r => r.status === 'MENUNGGU_VERIFIKASI' || r.status === 'DIPROSES_TU').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MENUNGGU_VERIFIKASI':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <i data-lucide="clock" class="w-3.5 h-3.5"></i> Menunggu Verifikasi
        </span>`;
      case 'DIPROSES_TU':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <i data-lucide="clock" class="w-3.5 h-3.5"></i> Diproses TU
        </span>`;
      case 'DISETUJUI':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i> Disetujui
        </span>`;
      case 'DITOLAK':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <i data-lucide="x-circle" class="w-3.5 h-3.5 text-rose-600"></i> Ditolak
        </span>`;
      case 'DIBATALKAN':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <i data-lucide="ban" class="w-3.5 h-3.5"></i> Dibatalkan Siswa
        </span>`;
      default:
        return '';
    }
  };

  const html = `
    <div class="space-y-6">
      
      <!-- Welcome Card -->
      <div class="bg-gradient-to-r from-white via-teal-50/50 to-white p-6 rounded-2xl border border-teal-100 shadow-card">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Selamat Datang, ${currentUser.name}! 👋</h1>
            <p class="text-xs text-slate-500 mt-1">NIS: ${currentUser.nis || '20261001'} | Kelas: ${currentUser.class || 'X-IPA 1'} | Portal Pengajuan Digital</p>
          </div>
          <button id="btn-goto-new-req" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all">
            <i data-lucide="file-plus" class="w-4 h-4"></i>
            <span>Buat Pengajuan Baru</span>
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p class="text-[11px] font-semibold text-slate-400 uppercase">Total Pengajuan</p>
            <p class="text-2xl font-bold text-slate-800 mt-1">${requests.length}</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <p class="text-[11px] font-semibold text-emerald-600 uppercase">Disetujui</p>
            <p class="text-2xl font-bold text-emerald-700 mt-1">${approvedCount}</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
            <p class="text-[11px] font-semibold text-amber-600 uppercase">Dalam Proses</p>
            <p class="text-2xl font-bold text-amber-700 mt-1">${pendingCount}</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-teal-100 shadow-xs">
            <p class="text-[11px] font-semibold text-teal-600 uppercase">Dokumen Terbit</p>
            <p class="text-2xl font-bold text-teal-700 mt-1">${documents.length}</p>
          </div>
        </div>
      </div>

      <!-- Tab: OVERVIEW -->
      ${activeTab === 'OVERVIEW' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="clock" class="w-5 h-5 text-teal-600"></i> Pengajuan Terbaru Anda
            </h3>
            <button id="btn-see-all-reqs" class="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          ${requests.length === 0 ? `
            <div class="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <i data-lucide="file-text" class="w-10 h-10 text-slate-300 mx-auto mb-2"></i>
              <p class="text-xs font-semibold text-slate-600">Belum ada pengajuan izin atau dispensasi.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Klik 'Buat Pengajuan Baru' untuk membuat izin secara digital.</p>
            </div>
          ` : `
            <div class="space-y-3">
              ${requests.slice(0, 3).map(r => `
                <div class="p-4 rounded-xl border border-slate-200 bg-white hover:bg-teal-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-mono font-bold text-slate-500">${r.id}</span>
                      ${getStatusBadge(r.status)}
                    </div>
                    <h4 class="text-sm font-bold text-slate-800">${r.subType}</h4>
                    <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">Tujuan: ${r.purpose}</p>
                  </div>
                  <button data-req-id="${r.id}" class="btn-track-timeline px-3 py-1.5 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-all self-start sm:self-center">
                    Lacak Timeline
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- Tab: NEW_REQUEST -->
      ${activeTab === 'NEW_REQUEST' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <div class="border-b border-slate-100 pb-4 mb-6">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="file-plus" class="w-5 h-5 text-teal-600"></i> Formulir Pengajuan Izin / Dispensasi Digital
            </h2>
            <p class="text-xs text-slate-500 mt-1">Isi data pengajuan izin tidak hadir atau dispensasi kegiatan secara lengkap.</p>
          </div>

          <form id="form-new-request" class="space-y-6 text-xs">
            
            <!-- Type Selector -->
            <div>
              <label class="block font-bold text-slate-700 mb-2">Kategori Pengajuan</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" id="btn-type-leave" class="p-3 rounded-xl border text-left transition-all border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-400/30">
                  <p class="font-bold text-xs">Izin Tidak Hadir</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">Sakit, Acara Keluarga, Halangan</p>
                </button>
                <button type="button" id="btn-type-dispensation" class="p-3 rounded-xl border text-left transition-all border-slate-200 hover:bg-slate-50 text-slate-700">
                  <p class="font-bold text-xs">Dispensasi Kegiatan</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">Lomba OSN, O2SN, Paskibra, Event</p>
                </button>
              </div>
            </div>

            <!-- Specific SubType -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Jenis Layanan Spesifik</label>
              <select id="select-subtype" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                <option value="Izin Sakit">Izin Sakit (Surat Dokter / Orang Tua)</option>
                <option value="Izin Kepentingan Keluarga">Izin Kepentingan Keluarga</option>
              </select>
            </div>

            <!-- Guide Box -->
            <div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs">
              <div class="flex items-start gap-2">
                <i data-lucide="info" class="w-4 h-4 text-blue-600 shrink-0 mt-0.5"></i>
                <div>
                  <p class="font-bold mb-1">Dokumen Pendukung Wajib Lampirkan:</p>
                  <ul id="guide-list" class="list-disc list-inside space-y-0.5 text-[11px] text-blue-800">
                    <li>Surat Dokter / Klinik (apabila sakit lebih dari 1 hari).</li>
                    <li>Surat Pernyataan Orang Tua (apabila izin keluarga).</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                <input id="req-start-date" type="date" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                <input id="req-end-date" type="date" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <!-- Purpose -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Alasan / Detail Tujuan Pengajuan</label>
              <textarea id="req-purpose" rows="3" required placeholder="Jelaskan alasan izin / dispensasi secara singkat dan jelas..." class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400"></textarea>
            </div>

            <!-- Attachments -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Lampiran File Dokumen Pendukung (PDF/JPG)</label>
              <div class="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center bg-slate-50/50 transition-all">
                <i data-lucide="upload" class="w-8 h-8 text-slate-400 mx-auto mb-2"></i>
                <p class="text-xs font-semibold text-slate-700">Pilih file dokumen pendukung</p>
                <p class="text-[10px] text-slate-400 mt-1">Format PDF, JPG, atau PNG</p>
                <input id="file-upload-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden" />
                <label for="file-upload-input" class="mt-3 inline-block px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 cursor-pointer shadow-xs">
                  Pilih File Dari Perangkat
                </label>
              </div>

              <div id="attachments-container" class="mt-3 space-y-2"></div>
            </div>

            <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button type="button" id="btn-cancel-form" class="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100">
                Batal
              </button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 transition-all">
                Kirim Pengajuan
              </button>
            </div>

          </form>
        </div>
      ` : ''}

      <!-- Tab: MY_REQUESTS -->
      ${activeTab === 'MY_REQUESTS' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="file-text" class="w-5 h-5 text-teal-600"></i> Riwayat & Pelacakan Status Pengajuan
              </h2>
              <p class="text-xs text-slate-500 mt-1">Pantau proses verifikasi Wali Kelas dan pengesahan TU secara real-time.</p>
            </div>
            <button id="btn-new-req-shortcut" class="px-3.5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 shadow-sm">
              + Pengajuan Baru
            </button>
          </div>

          ${requests.length === 0 ? `
            <div class="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <i data-lucide="file-text" class="w-12 h-12 text-slate-300 mx-auto mb-2"></i>
              <p class="text-xs font-bold text-slate-600">Belum ada riwayat pengajuan.</p>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th class="py-3 px-4">No. Pengajuan</th>
                    <th class="py-3 px-4">Jenis Izin/Dispensasi</th>
                    <th class="py-3 px-4">Tanggal Diajukan</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${requests.map(r => `
                    <tr class="hover:bg-teal-50/20 transition-all">
                      <td class="py-3.5 px-4 font-mono font-bold text-slate-800">${r.id}</td>
                      <td class="py-3.5 px-4">
                        <p class="font-bold text-slate-800">${r.subType}</p>
                        <p class="text-[11px] text-slate-500 line-clamp-1">${r.purpose}</p>
                      </td>
                      <td class="py-3.5 px-4 text-slate-500">${r.createdAt}</td>
                      <td class="py-3.5 px-4">${getStatusBadge(r.status)}</td>
                      <td class="py-3.5 px-4 text-right space-x-2">
                        <button data-req-id="${r.id}" class="btn-track-timeline px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[11px] font-bold border border-teal-200">
                          Lacak Progress
                        </button>
                        ${r.status === 'MENUNGGU_VERIFIKASI' ? `
                          <button data-cancel-id="${r.id}" class="btn-cancel-req px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200">
                            Batalkan
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      ` : ''}

      <!-- Tab: MY_DOCUMENTS -->
      ${activeTab === 'MY_DOCUMENTS' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="folder-down" class="w-5 h-5 text-teal-600"></i> Arsip Dokumen Saya
            </h2>
            <p class="text-xs text-slate-500 mt-1">Unduh surat keterangan atau dokumen resmi yang telah diterbitkan oleh Tata Usaha (TU).</p>
          </div>

          ${documents.length === 0 ? `
            <div class="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <i data-lucide="folder-down" class="w-12 h-12 text-slate-300 mx-auto mb-2"></i>
              <p class="text-xs font-bold text-slate-600">Belum ada dokumen resmi terbit.</p>
              <p class="text-[11px] text-slate-400 mt-1">Dokumen hasil pengajuan yang disetujui TU akan tersimpan di sini secara otomatis.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${documents.map(doc => `
                <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50/40 transition-all flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <i data-lucide="file-text" class="w-5 h-5"></i>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-800">${doc.title}</h4>
                      <p class="text-[10px] text-slate-500 mt-0.5">Kategori: ${doc.category} | ${doc.fileSize}</p>
                      <p class="text-[10px] text-slate-400 mt-1">Diterbitkan: ${doc.uploadedAt}</p>
                    </div>
                  </div>
                  <button onclick="alert('Mengunduh file resmi: ${doc.fileName}')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    <span>Unduh</span>
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- Timeline Modal Container -->
      <div id="modal-timeline" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div id="modal-timeline-content" class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-teal-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto"></div>
      </div>

    </div>
  `;

  // Attach Event Handlers
  setTimeout(() => {
    document.getElementById('btn-goto-new-req')?.addEventListener('click', () => onSelectTab('NEW_REQUEST'));
    document.getElementById('btn-see-all-reqs')?.addEventListener('click', () => onSelectTab('MY_REQUESTS'));
    document.getElementById('btn-new-req-shortcut')?.addEventListener('click', () => onSelectTab('NEW_REQUEST'));
    document.getElementById('btn-cancel-form')?.addEventListener('click', () => onSelectTab('OVERVIEW'));

    // Category Buttons
    let selectedReqType = 'IZIN_TIDAK_HADIR';
    const btnLeave = document.getElementById('btn-type-leave');
    const btnDisp = document.getElementById('btn-type-dispensation');
    const selectSubType = document.getElementById('select-subtype');
    const guideList = document.getElementById('guide-list');

    const updateTypeUI = (t) => {
      selectedReqType = t;
      if (t === 'IZIN_TIDAK_HADIR') {
        btnLeave?.classList.add('border-teal-500', 'bg-teal-50', 'text-teal-900', 'font-bold', 'ring-2', 'ring-teal-400/30');
        btnLeave?.classList.remove('border-slate-200', 'hover:bg-slate-50', 'text-slate-700');
        btnDisp?.classList.remove('border-teal-500', 'bg-teal-50', 'text-teal-900', 'font-bold', 'ring-2', 'ring-teal-400/30');
        btnDisp?.classList.add('border-slate-200', 'hover:bg-slate-50', 'text-slate-700');

        if (selectSubType) {
          selectSubType.innerHTML = `
            <option value="Izin Sakit">Izin Sakit (Surat Dokter / Orang Tua)</option>
            <option value="Izin Kepentingan Keluarga">Izin Kepentingan Keluarga</option>
          `;
        }
        if (guideList) {
          guideList.innerHTML = `
            <li>Surat Dokter / Klinik (apabila sakit lebih dari 1 hari).</li>
            <li>Surat Pernyataan Orang Tua (apabila izin keluarga).</li>
          `;
        }
      } else {
        btnDisp?.classList.add('border-teal-500', 'bg-teal-50', 'text-teal-900', 'font-bold', 'ring-2', 'ring-teal-400/30');
        btnDisp?.classList.remove('border-slate-200', 'hover:bg-slate-50', 'text-slate-700');
        btnLeave?.classList.remove('border-teal-500', 'bg-teal-50', 'text-teal-900', 'font-bold', 'ring-2', 'ring-teal-400/30');
        btnLeave?.classList.add('border-slate-200', 'hover:bg-slate-50', 'text-slate-700');

        if (selectSubType) {
          selectSubType.innerHTML = `
            <option value="Dispensasi Lomba / Olimpiade">Dispensasi Lomba / Olimpiade</option>
            <option value="Dispensasi Tampil Seni & Budaya">Dispensasi Tampil Seni & Budaya</option>
            <option value="Dispensasi Tugas Organisasi OSIS">Dispensasi Tugas Organisasi OSIS</option>
          `;
        }
        if (guideList) {
          guideList.innerHTML = `
            <li>Surat Undangan / Surat Mandat Lomba Resmi.</li>
            <li>Rundown Acara Kegiatan.</li>
          `;
        }
      }
    };

    btnLeave?.addEventListener('click', () => updateTypeUI('IZIN_TIDAK_HADIR'));
    btnDisp?.addEventListener('click', () => updateTypeUI('DISPENSASI'));

    // File upload
    const fileInp = document.getElementById('file-upload-input');
    const attContainer = document.getElementById('attachments-container');

    const renderAttachments = () => {
      if (!attContainer) return;
      attContainer.innerHTML = studentAttachments.map((att, idx) => `
        <div class="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <i data-lucide="paperclip" class="w-4 h-4 text-teal-600"></i>
            <div>
              <p class="font-semibold text-slate-800">${att.name}</p>
              <p class="text-[10px] text-slate-400">${att.size}</p>
            </div>
          </div>
          <button type="button" data-del-att="${idx}" class="text-rose-500 hover:text-rose-700 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `).join('');

      document.querySelectorAll('[data-del-att]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-del-att') || '0', 10);
          studentAttachments.splice(idx, 1);
          renderAttachments();
        });
      });
      if (window.lucide) window.lucide.createIcons();
    };

    fileInp?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(f => {
        studentAttachments.push({
          name: f.name,
          size: `${(f.size / 1024).toFixed(0)} KB`,
          type: f.type || 'application/pdf',
          uploadedAt: new Date().toLocaleDateString()
        });
      });
      renderAttachments();
    });

    // Form Submission
    document.getElementById('form-new-request')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const stDate = document.getElementById('req-start-date')?.value;
      const enDate = document.getElementById('req-end-date')?.value;
      const purpose = document.getElementById('req-purpose')?.value;
      const subType = document.getElementById('select-subtype')?.value;

      createRequest({
        type: selectedReqType,
        subType: subType || 'Izin Sakit',
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentNis: currentUser.nis || '20261001',
        studentClass: currentUser.class || 'X-IPA 1',
        teacherName: 'Ahmad Dahlan, S.Pd.',
        purpose: purpose || '',
        startDate: stDate,
        endDate: enDate || stDate,
        attachments: [...studentAttachments]
      });

      alert('Pengajuan berhasil dibuat! Menunggu verifikasi Wali Kelas.');
      studentAttachments = [];
      onSelectTab('MY_REQUESTS');
    });

    // Timeline Modal
    const modalTimeline = document.getElementById('modal-timeline');
    const modalContent = document.getElementById('modal-timeline-content');

    document.querySelectorAll('.btn-track-timeline').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        const req = getRequests().find(r => r.id === reqId);
        if (req && modalContent && modalTimeline) {
          modalContent.innerHTML = `
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-mono font-bold text-teal-700 uppercase">Detail Timeline</span>
                <h3 class="text-base font-bold text-slate-900">${req.subType}</h3>
              </div>
              <button id="btn-close-timeline-modal" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div class="text-xs space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p><strong class="text-slate-700">No. Pengajuan:</strong> ${req.id}</p>
              <p><strong class="text-slate-700">Tujuan:</strong> ${req.purpose}</p>
              <p><strong class="text-slate-700">Periode:</strong> ${req.startDate} s/d ${req.endDate}</p>
              <p><strong class="text-slate-700">Status Saat Ini:</strong> ${getStatusBadge(req.status)}</p>
              ${req.teacherNote ? `
                <p class="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Catatan Wali Kelas:</strong> "${req.teacherNote}"
                </p>
              ` : ''}
              ${req.adminNote ? `
                <p class="text-teal-900 bg-teal-50 p-2 rounded border border-teal-200">
                  <strong>Catatan Tata Usaha:</strong> "${req.adminNote}"
                </p>
              ` : ''}
            </div>

            <div class="pt-2">
              <h4 class="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Jejak Langkah Verifikasi</h4>
              <div class="space-y-4 relative pl-6 border-l-2 border-teal-200">
                ${req.timeline.map(step => `
                  <div class="relative">
                    <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-teal-600 border-2 border-white"></div>
                    <p class="font-bold text-slate-800 text-xs">${step.note}</p>
                    <p class="text-[10px] text-slate-500 mt-0.5">Oleh: ${step.byName} • ${step.timestamp}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex justify-end">
              <button id="btn-close-timeline-modal-2" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                Tutup
              </button>
            </div>
          `;

          modalTimeline.classList.remove('hidden');
          document.getElementById('btn-close-timeline-modal')?.addEventListener('click', () => modalTimeline.classList.add('hidden'));
          document.getElementById('btn-close-timeline-modal-2')?.addEventListener('click', () => modalTimeline.classList.add('hidden'));
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });

    // Cancel Request
    document.querySelectorAll('.btn-cancel-req').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-cancel-id');
        if (confirm('Yakin ingin membatalkan pengajuan ini?')) {
          cancelRequest(reqId, currentUser.id);
          onSelectTab('MY_REQUESTS');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }, 0);

  return html;
}
