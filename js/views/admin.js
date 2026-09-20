import { 
  getRequests, 
  updateRequestStatus, 
  getStudents, 
  saveStudent, 
  deleteStudent, 
  getDocuments, 
  saveDocument 
} from '../services/storage.js';

let filterStatus = 'ALL';
let filterClass = 'ALL';
let searchQuery = '';
let currentSelectedReqTU = null;
let currentEditingStudent = null;

export function renderAdminDashboard(currentUser, activeTab, onSelectTab) {
  const requests = getRequests();
  const students = getStudents();
  const documents = getDocuments();

  const pendingCount = requests.filter(r => r.status === 'DIPROSES_TU' || r.status === 'MENUNGGU_VERIFIKASI').length;
  const approvedTotal = requests.filter(r => r.status === 'DISETUJUI').length;

  const filteredRequests = requests.filter(r => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchClass = filterClass === 'ALL' || r.studentClass === filterClass;
    const matchSearch = r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.subType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchClass && matchSearch;
  });

  const html = `
    <div class="space-y-6">
      
      <!-- Admin Banner -->
      <div class="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white p-6 rounded-2xl shadow-card">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-teal-700 text-teal-200 text-[10px] font-bold uppercase tracking-wider border border-teal-600">
                Dashboard Utama Tata Usaha
              </span>
            </div>
            <h1 class="text-xl font-extrabold text-white tracking-tight mt-1">Portal Administrasi & Kontrol Sekolah</h1>
            <p class="text-xs text-teal-200 mt-0.5">Kelola verifikasi pengajuan, data siswa terpusat, dan arsip dokumen resmi.</p>
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-export-excel" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
              <span>Ekspor Rekap (Excel)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: OVERVIEW (Monitoring) -->
      ${activeTab === 'OVERVIEW' ? `
        <div class="space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p class="text-[11px] font-semibold text-slate-400 uppercase">Total Pengajuan</p>
              <p class="text-2xl font-bold text-slate-800 mt-1">${requests.length}</p>
            </div>
            <div class="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
              <p class="text-[11px] font-semibold text-amber-600 uppercase">Perlu Aksi TU / Wali</p>
              <p class="text-2xl font-bold text-amber-700 mt-1">${pendingCount}</p>
            </div>
            <div class="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
              <p class="text-[11px] font-semibold text-emerald-600 uppercase">Pengesahan Selesai</p>
              <p class="text-2xl font-bold text-emerald-700 mt-1">${approvedTotal}</p>
            </div>
            <div class="bg-white p-4 rounded-xl border border-teal-200 shadow-xs">
              <p class="text-[11px] font-semibold text-teal-700 uppercase">Total Siswa Terdaftar</p>
              <p class="text-2xl font-bold text-teal-800 mt-1">${students.length}</p>
            </div>
          </div>

          <!-- Monitoring Table -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="layout-dashboard" class="w-5 h-5 text-teal-600"></i> Monitoring Seluruh Pengajuan
              </h3>

              <div class="flex flex-wrap items-center gap-2">
                <div class="relative">
                  <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                  <input id="admin-search-input" type="text" placeholder="Cari siswa / ID..." value="${searchQuery}" class="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                <select id="filter-status-select" class="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option value="ALL" ${filterStatus === 'ALL' ? 'selected' : ''}>Semua Status</option>
                  <option value="MENUNGGU_VERIFIKASI" ${filterStatus === 'MENUNGGU_VERIFIKASI' ? 'selected' : ''}>Menunggu Wali Kelas</option>
                  <option value="DIPROSES_TU" ${filterStatus === 'DIPROSES_TU' ? 'selected' : ''}>Diproses TU</option>
                  <option value="DISETUJUI" ${filterStatus === 'DISETUJUI' ? 'selected' : ''}>Disetujui</option>
                  <option value="DITOLAK" ${filterStatus === 'DITOLAK' ? 'selected' : ''}>Ditolak</option>
                </select>

                <select id="filter-class-select" class="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option value="ALL" ${filterClass === 'ALL' ? 'selected' : ''}>Semua Kelas</option>
                  <option value="X-IPA 1" ${filterClass === 'X-IPA 1' ? 'selected' : ''}>X-IPA 1</option>
                  <option value="XI-IPS 2" ${filterClass === 'XI-IPS 2' ? 'selected' : ''}>XI-IPS 2</option>
                  <option value="XII-IPA 1" ${filterClass === 'XII-IPA 1' ? 'selected' : ''}>XII-IPA 1</option>
                </select>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th class="py-3 px-4">ID</th>
                    <th class="py-3 px-4">Nama Siswa</th>
                    <th class="py-3 px-4">Kelas</th>
                    <th class="py-3 px-4">Layanan</th>
                    <th class="py-3 px-4">Tujuan</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4 text-right">Aksi TU</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${filteredRequests.map(r => `
                    <tr class="hover:bg-teal-50/20 transition-all">
                      <td class="py-3.5 px-4 font-mono font-bold text-slate-700">${r.id}</td>
                      <td class="py-3.5 px-4 font-bold text-slate-800">${r.studentName}</td>
                      <td class="py-3.5 px-4 text-slate-600">${r.studentClass}</td>
                      <td class="py-3.5 px-4 font-semibold text-teal-800">${r.subType}</td>
                      <td class="py-3.5 px-4 text-slate-500 max-w-xs truncate">${r.purpose}</td>
                      <td class="py-3.5 px-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-800' : r.status === 'DIPROSES_TU' ? 'bg-blue-100 text-blue-800' : r.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
                          ${r.status}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <button data-tu-action="${r.id}" class="btn-open-tu-modal px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-xs">
                          Kelola & Sahkan
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Tab: MANAGE_REQUESTS -->
      ${activeTab === 'MANAGE_REQUESTS' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Manajemen Persetujuan Surat & Dispensasi TU</h2>
          <div class="space-y-3">
            ${requests.map(r => `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p class="font-bold text-slate-800">${r.studentName} (${r.studentClass}) - ${r.subType}</p>
                  <p class="text-xs text-slate-500">Tujuan: ${r.purpose} | Status: ${r.status}</p>
                </div>
                <button data-tu-action="${r.id}" class="btn-open-tu-modal px-3 py-1.5 bg-teal-600 text-white font-bold rounded-lg text-xs">
                  Proses Pengesahan
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Tab: MANAGE_STUDENTS (CRUD & Mass Import) -->
      ${activeTab === 'MANAGE_STUDENTS' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="users" class="w-5 h-5 text-teal-600"></i> Manajemen Data Siswa Sekolah
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Tambah, ubah, hapus, dan import massal via Excel/CSV.</p>
            </div>

            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all">
                <i data-lucide="upload" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>Import CSV / Excel</span>
                <input id="input-mass-import" type="file" accept=".xlsx, .xls, .csv" class="hidden" />
              </label>

              <button id="btn-add-student-modal" class="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Tambah Siswa Baru</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase">
                  <th class="py-3 px-4">Nama Siswa</th>
                  <th class="py-3 px-4">NIS</th>
                  <th class="py-3 px-4">NISN</th>
                  <th class="py-3 px-4">Kelas</th>
                  <th class="py-3 px-4">Orang Tua / Wali</th>
                  <th class="py-3 px-4">No. HP Wali</th>
                  <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${students.map(st => `
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-4 font-bold text-slate-800">${st.name}</td>
                    <td class="py-3 px-4 font-mono">${st.nis}</td>
                    <td class="py-3 px-4 font-mono text-slate-500">${st.nisn}</td>
                    <td class="py-3 px-4 font-bold text-teal-700">${st.class}</td>
                    <td class="py-3 px-4 text-slate-600">${st.guardianName || '-'}</td>
                    <td class="py-3 px-4 text-slate-600">${st.guardianPhone || '-'}</td>
                    <td class="py-3 px-4 text-right space-x-2">
                      <button data-edit-student="${st.id}" class="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit Data">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                      </button>
                      <button data-delete-student="${st.id}" class="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Hapus Siswa">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Tab: DOCUMENTS_STORE -->
      ${activeTab === 'DOCUMENTS_STORE' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="folder-archive" class="w-5 h-5 text-teal-600"></i> Arsip Terpusat Dokumen Sekolah
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Seluruh file hasil pengajuan & template surat terpusat.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${documents.map(doc => `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-bold text-slate-900">${doc.title}</h4>
                  <p class="text-[11px] text-slate-500 mt-1">Siswa: ${doc.studentName} | ${doc.fileSize}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">Diupload Oleh: ${doc.uploadedBy}</p>
                </div>
                <button onclick="alert('Mengunduh file resmi: ${doc.fileName}')" class="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i>
                  <span>Unduh</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Tab: REPORTS -->
      ${activeTab === 'REPORTS' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-5 h-5 text-teal-600"></i> Statistik Ringkasan Administrasi Sekolah
            </h2>
            <button id="btn-export-excel-2" class="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
              <span>Ekspor Ke Excel (.xlsx)</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-5 rounded-xl bg-teal-50 border border-teal-100 text-center">
              <p class="text-xs font-bold text-teal-800">Tingkat Penyelesaian Pengajuan</p>
              <p class="text-3xl font-extrabold text-teal-700 mt-2">
                ${requests.length > 0 ? `${((approvedTotal / requests.length) * 100).toFixed(0)}%` : '100%'}
              </p>
              <p class="text-[11px] text-slate-500 mt-1">Status Disetujui Secara Digital</p>
            </div>
            <div class="p-5 rounded-xl bg-blue-50 border border-blue-100 text-center">
              <p class="text-xs font-bold text-blue-800">Rata-rata Waktu Proses</p>
              <p class="text-3xl font-extrabold text-blue-700 mt-2">1 Hari</p>
              <p class="text-[11px] text-slate-500 mt-1">Memangkas dari manual (3-5 hari)</p>
            </div>
            <div class="p-5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p class="text-xs font-bold text-emerald-800">Penghematan Kertas</p>
              <p class="text-3xl font-extrabold text-emerald-700 mt-2">100% Digital</p>
              <p class="text-[11px] text-slate-500 mt-1">Bebas formulir fisik kertas</p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- TU Action Modal Container -->
      <div id="modal-tu-action" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-teal-100 p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Pengesahan & Penerbitan Surat TU</h3>
            <button id="btn-close-tu-modal" class="text-slate-400">✕</button>
          </div>

          <div id="tu-modal-info" class="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200"></div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Pengesahan TU / Catatan Alasan</label>
            <textarea id="tu-action-note" rows="2" placeholder="Catatan nomor surat atau instruksi tambahan..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"></textarea>
          </div>

          <div class="flex gap-2 pt-2">
            <button id="btn-tu-reject" class="flex-1 py-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
              Tolak Pengajuan
            </button>
            <button id="btn-tu-approve" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm">
              Sahkan & Terbitkan Surat
            </button>
          </div>
        </div>
      </div>

      <!-- Student Add/Edit Modal Container -->
      <div id="modal-student-crud" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 id="student-modal-title" class="text-base font-bold text-slate-900">Tambah Siswa Baru</h3>
            <button id="btn-close-student-crud" class="text-slate-400">✕</button>
          </div>

          <form id="form-student-crud" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold mb-1">Nama Lengkap</label>
              <input id="crud-st-name" type="text" required class="w-full p-2.5 bg-slate-50 border rounded-xl" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold mb-1">NIS</label>
                <input id="crud-st-nis" type="text" required class="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label class="block font-semibold mb-1">NISN</label>
                <input id="crud-st-nisn" type="text" class="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold mb-1">Kelas</label>
                <select id="crud-st-class" class="w-full p-2.5 bg-slate-50 border rounded-xl">
                  <option value="X-IPA 1">X-IPA 1</option>
                  <option value="X-IPA 2">X-IPA 2</option>
                  <option value="XI-IPS 1">XI-IPS 1</option>
                  <option value="XI-IPS 2">XI-IPS 2</option>
                  <option value="XII-IPA 1">XII-IPA 1</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold mb-1">Jenis Kelamin</label>
                <select id="crud-st-gender" class="w-full p-2.5 bg-slate-50 border rounded-xl">
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">Nama Orang Tua / Wali</label>
              <input id="crud-st-guardian" type="text" class="w-full p-2.5 bg-slate-50 border rounded-xl" />
            </div>

            <div>
              <label class="block font-semibold mb-1">No. HP Wali</label>
              <input id="crud-st-phone" type="text" class="w-full p-2.5 bg-slate-50 border rounded-xl" />
            </div>

            <div class="flex gap-2 justify-end pt-3">
              <button type="button" id="btn-cancel-student-crud" class="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                Batal
              </button>
              <button type="submit" class="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold shadow-sm">
                Simpan Siswa
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;

  // Attach Event Handlers
  setTimeout(() => {
    // Filter Handlers
    document.getElementById('admin-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderAdminDashboard(currentUser, activeTab, onSelectTab);
    });

    document.getElementById('filter-status-select')?.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      renderAdminDashboard(currentUser, activeTab, onSelectTab);
    });

    document.getElementById('filter-class-select')?.addEventListener('change', (e) => {
      filterClass = e.target.value;
      renderAdminDashboard(currentUser, activeTab, onSelectTab);
    });

    // Excel Export via SheetJS
    const exportExcelHandler = () => {
      if (!window.XLSX) {
        alert('Library Excel belum siap.');
        return;
      }
      const data = filteredRequests.map(r => ({
        'ID Pengajuan': r.id,
        'Nama Siswa': r.studentName,
        'Kelas': r.studentClass,
        'NIS': r.studentNis,
        'Kategori': r.type,
        'Jenis Layanan': r.subType,
        'Tujuan': r.purpose,
        'Tanggal Mulai': r.startDate,
        'Tanggal Selesai': r.endDate,
        'Status Pengajuan': r.status,
        'Catatan Wali Kelas': r.teacherNote || '',
        'Catatan TU': r.adminNote || '',
        'Tanggal Dibuat': r.createdAt
      }));

      const ws = window.XLSX.utils.json_to_sheet(data);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'Rekap Pengajuan');
      window.XLSX.writeFile(wb, `Rekap_Administrasi_SchoolAdmin_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    document.getElementById('btn-export-excel')?.addEventListener('click', exportExcelHandler);
    document.getElementById('btn-export-excel-2')?.addEventListener('click', exportExcelHandler);

    // TU Action Modal
    const modalTU = document.getElementById('modal-tu-action');
    const tuInfo = document.getElementById('tu-modal-info');
    const tuNote = document.getElementById('tu-action-note');

    document.querySelectorAll('.btn-open-tu-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-tu-action');
        currentSelectedReqTU = getRequests().find(r => r.id === rId);
        if (currentSelectedReqTU && modalTU && tuInfo) {
          tuInfo.innerHTML = `
            <p><strong>ID:</strong> ${currentSelectedReqTU.id}</p>
            <p><strong>Siswa:</strong> ${currentSelectedReqTU.studentName} (${currentSelectedReqTU.studentClass})</p>
            <p><strong>Layanan:</strong> ${currentSelectedReqTU.subType}</p>
            <p><strong>Tujuan:</strong> ${currentSelectedReqTU.purpose}</p>
          `;
          if (tuNote) tuNote.value = '';
          modalTU.classList.remove('hidden');
        }
      });
    });

    document.getElementById('btn-close-tu-modal')?.addEventListener('click', () => {
      modalTU?.classList.add('hidden');
    });

    document.getElementById('btn-tu-approve')?.addEventListener('click', () => {
      if (!currentSelectedReqTU) return;
      const note = document.getElementById('tu-action-note')?.value || 'Surat resmi diterbitkan & disahkan oleh Tata Usaha.';
      
      updateRequestStatus(currentSelectedReqTU.id, 'DISETUJUI', note, currentUser);

      saveDocument({
        title: `${currentSelectedReqTU.subType} - ${currentSelectedReqTU.studentName} (${currentSelectedReqTU.studentClass})`,
        category: currentSelectedReqTU.subType,
        requestId: currentSelectedReqTU.id,
        studentId: currentSelectedReqTU.studentId,
        studentName: currentSelectedReqTU.studentName,
        fileName: `Surat_Resmi_${currentSelectedReqTU.id}.pdf`,
        fileSize: '512 KB',
        uploadedBy: currentUser.name,
        note: note
      });

      alert(`Pengajuan ${currentSelectedReqTU.id} berhasil disetujui & surat resmi diarsipkan!`);
      modalTU?.classList.add('hidden');
      onSelectTab(activeTab);
    });

    document.getElementById('btn-tu-reject')?.addEventListener('click', () => {
      if (!currentSelectedReqTU) return;
      const note = document.getElementById('tu-action-note')?.value?.trim();
      if (!note) {
        alert('Mohon isi alasan penolakan.');
        return;
      }
      updateRequestStatus(currentSelectedReqTU.id, 'DITOLAK', note, currentUser);
      alert(`Pengajuan ${currentSelectedReqTU.id} ditolak.`);
      modalTU?.classList.add('hidden');
      onSelectTab(activeTab);
    });

    // Mass Student Import (SheetJS)
    document.getElementById('input-mass-import')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file || !window.XLSX) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = window.XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = window.XLSX.utils.sheet_to_json(ws);

          let count = 0;
          rawData.forEach((row, i) => {
            if (row.Nama || row.name) {
              saveStudent({
                id: `usr-student-imp-${Date.now()}-${i}`,
                name: row.Nama || row.name,
                nis: String(row.NIS || row.nis || `202699${i}`),
                nisn: String(row.NISN || row.nisn || `00899${i}`),
                class: row.Kelas || row.class || 'X-IPA 1',
                gender: row.Gender || 'Laki-laki',
                guardianName: row.Wali || 'Orang Tua',
                guardianPhone: row.HP || '0812-3456-7890',
                status: 'Aktif'
              });
              count++;
            }
          });

          alert(`Berhasil mengimpor ${count} data siswa dari file!`);
          onSelectTab('MANAGE_STUDENTS');
        } catch (err) {
          alert('Gagal membaca file Excel/CSV. Pastikan format tabel memiliki kolom: Nama, NIS, NISN, Kelas.');
        }
      };
      reader.readAsBinaryString(file);
    });

    // Student CRUD Modal
    const modalStudent = document.getElementById('modal-student-crud');
    const openStudentModal = (st = null) => {
      currentEditingStudent = st;
      const title = document.getElementById('student-modal-title');
      const inName = document.getElementById('crud-st-name');
      const inNis = document.getElementById('crud-st-nis');
      const inNisn = document.getElementById('crud-st-nisn');
      const inClass = document.getElementById('crud-st-class');
      const inGender = document.getElementById('crud-st-gender');
      const inGuard = document.getElementById('crud-st-guardian');
      const inPhone = document.getElementById('crud-st-phone');

      if (st) {
        if (title) title.innerText = 'Edit Data Siswa';
        if (inName) inName.value = st.name;
        if (inNis) inNis.value = st.nis;
        if (inNisn) inNisn.value = st.nisn || '';
        if (inClass) inClass.value = st.class;
        if (inGender) inGender.value = st.gender || 'Laki-laki';
        if (inGuard) inGuard.value = st.guardianName || '';
        if (inPhone) inPhone.value = st.guardianPhone || '';
      } else {
        if (title) title.innerText = 'Tambah Siswa Baru';
        if (inName) inName.value = '';
        if (inNis) inNis.value = `2026${Math.floor(100 + Math.random() * 900)}`;
        if (inNisn) inNisn.value = `008${Math.floor(1000000 + Math.random() * 9000000)}`;
        if (inClass) inClass.value = 'X-IPA 1';
        if (inGender) inGender.value = 'Laki-laki';
        if (inGuard) inGuard.value = '';
        if (inPhone) inPhone.value = '';
      }

      modalStudent?.classList.remove('hidden');
    };

    document.getElementById('btn-add-student-modal')?.addEventListener('click', () => openStudentModal(null));
    document.getElementById('btn-close-student-crud')?.addEventListener('click', () => modalStudent?.classList.add('hidden'));
    document.getElementById('btn-cancel-student-crud')?.addEventListener('click', () => modalStudent?.classList.add('hidden'));

    document.querySelectorAll('[data-edit-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-edit-student');
        const st = getStudents().find(s => s.id === sId);
        if (st) openStudentModal(st);
      });
    });

    document.querySelectorAll('[data-delete-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-delete-student');
        if (confirm('Yakin ingin menghapus data siswa ini?')) {
          deleteStudent(sId);
          onSelectTab('MANAGE_STUDENTS');
        }
      });
    });

    document.getElementById('form-student-crud')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const inName = document.getElementById('crud-st-name')?.value?.trim();
      const inNis = document.getElementById('crud-st-nis')?.value?.trim();
      const inNisn = document.getElementById('crud-st-nisn')?.value?.trim();
      const inClass = document.getElementById('crud-st-class')?.value;
      const inGender = document.getElementById('crud-st-gender')?.value;
      const inGuard = document.getElementById('crud-st-guardian')?.value?.trim();
      const inPhone = document.getElementById('crud-st-phone')?.value?.trim();

      if (!inName || !inNis) return;

      const stData = {
        id: currentEditingStudent ? currentEditingStudent.id : `usr-student-${Date.now()}`,
        name: inName,
        nis: inNis,
        nisn: inNisn,
        class: inClass,
        gender: inGender,
        guardianName: inGuard,
        guardianPhone: inPhone,
        status: 'Aktif'
      };

      saveStudent(stData);
      alert('Data siswa berhasil disimpan!');
      modalStudent?.classList.add('hidden');
      onSelectTab('MANAGE_STUDENTS');
    });

    if (window.lucide) window.lucide.createIcons();
  }, 0);

  return html;
}
