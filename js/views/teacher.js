import { getRequests, updateRequestStatus, getStudents } from '../services/storage.js';

export function renderTeacherDashboard(currentUser, activeTab, onSelectTab) {
  const teacherClass = currentUser.assignedClass || 'X-IPA 1';
  const requests = getRequests().filter(r => r.studentClass === teacherClass || !r.studentClass);
  const students = getStudents().filter(s => s.class === teacherClass);

  const pendingQueue = requests.filter(r => r.status === 'MENUNGGU_VERIFIKASI');

  const html = `
    <div class="space-y-6">
      
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-white via-blue-50/40 to-white p-6 rounded-2xl border border-blue-100 shadow-card">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-[11px] font-bold text-blue-700 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100">
              Wali Kelas: ${teacherClass}
            </span>
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Selamat Datang, ${currentUser.name}
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">Portal Verifikasi Pengajuan & Rekap Perizinan Siswa Kelas ${teacherClass}</p>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <p class="text-[10px] text-slate-400 font-bold uppercase">Antrean Verifikasi</p>
              <p class="text-lg font-bold text-amber-600">${pendingQueue.length}</p>
            </div>
            <div class="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <p class="text-[10px] text-slate-400 font-bold uppercase">Total Siswa</p>
              <p class="text-lg font-bold text-teal-700">${students.length}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: OVERVIEW (Antrean Verifikasi) -->
      ${activeTab === 'OVERVIEW' ? `
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <i data-lucide="check-square" class="w-5 h-5 text-blue-600"></i>
              Antrean Pengajuan Menunggu Verifikasi (${pendingQueue.length})
            </h2>

            ${pendingQueue.length === 0 ? `
              <div class="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <i data-lucide="check-circle-2" class="w-10 h-10 text-emerald-400 mx-auto mb-2"></i>
                <p class="text-xs font-bold text-slate-600">Semua pengajuan telah diverifikasi!</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Tidak ada pengajuan pending untuk kelas ${teacherClass}.</p>
              </div>
            ` : `
              <div class="space-y-3">
                ${pendingQueue.map(r => `
                  <div class="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold text-slate-700">${r.id}</span>
                        <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">${r.subType}</span>
                        <span class="text-[10px] text-slate-400">• ${r.createdAt}</span>
                      </div>
                      <h4 class="text-sm font-bold text-slate-900">${r.studentName} (${r.studentNis})</h4>
                      <p class="text-xs text-slate-600">Alasan: ${r.purpose}</p>
                      <p class="text-[11px] text-slate-500">Periode: ${r.startDate} s/d ${r.endDate}</p>
                      ${r.attachments && r.attachments.length > 0 ? `
                        <div class="pt-1 flex items-center gap-2 text-[11px] text-teal-700 font-medium">
                          <i data-lucide="paperclip" class="w-3.5 h-3.5"></i>
                          <span>Ada ${r.attachments.length} lampiran file</span>
                        </div>
                      ` : ''}
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <button data-verify-id="${r.id}" class="btn-open-verify px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm">
                        Verifikasi Pengajuan
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      ` : ''}

      <!-- Tab: CLASS_ATTENDANCE -->
      ${activeTab === 'CLASS_ATTENDANCE' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="calendar-check" class="w-5 h-5 text-blue-600"></i> Rekap Absensi & Perizinan Kelas ${teacherClass}
            </h2>
            <p class="text-xs text-slate-500 mt-1">Data rekapitulasi izin sakit dan dispensasi siswa kelas ${teacherClass}.</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                  <th class="py-3 px-4">Nama Siswa</th>
                  <th class="py-3 px-4">NIS</th>
                  <th class="py-3 px-4">Jenis Perizinan</th>
                  <th class="py-3 px-4">Tanggal / Durasi</th>
                  <th class="py-3 px-4">Keterangan</th>
                  <th class="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${requests.map(r => `
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-4 font-bold text-slate-800">${r.studentName}</td>
                    <td class="py-3 px-4 font-mono text-slate-500">${r.studentNis}</td>
                    <td class="py-3 px-4 font-semibold text-blue-700">${r.subType}</td>
                    <td class="py-3 px-4 text-slate-600">${r.startDate} s/d ${r.endDate}</td>
                    <td class="py-3 px-4 text-slate-600">${r.purpose}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded ${r.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-800' : r.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'} font-bold text-[10px]">
                        ${r.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Tab: ALL_STUDENTS -->
      ${activeTab === 'ALL_STUDENTS' ? `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="mb-6">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="users" class="w-5 h-5 text-blue-600"></i> Daftar Siswa Kelas ${teacherClass}
            </h2>
            <p class="text-xs text-slate-500 mt-1">Data kontak dan identitas siswa binaan.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${students.map(s => `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-bold text-slate-900">${s.name}</h4>
                  <span class="text-xs font-mono font-bold text-slate-500">${s.nis}</span>
                </div>
                <div class="text-xs text-slate-600 space-y-1">
                  <p><strong class="text-slate-700">NISN:</strong> ${s.nisn}</p>
                  <p><strong class="text-slate-700">Orang Tua / Wali:</strong> ${s.guardianName}</p>
                  <p class="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <i data-lucide="phone" class="w-3.5 h-3.5 text-blue-600"></i>
                    <span>${s.guardianPhone}</span>
                  </p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Verification Modal Container -->
      <div id="modal-verify-action" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Verifikasi Pengajuan Siswa</h3>
            <button id="btn-close-verify" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div id="verify-info-box" class="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200"></div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Alasan Wali Kelas (Wajib jika Menolak)</label>
            <textarea id="verify-note" rows="3" placeholder="Catatan persetujuan atau alasan apabila pengajuan ditolak..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"></textarea>
          </div>

          <div class="flex gap-2 pt-2">
            <button id="btn-verify-reject" class="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
              Tolak Pengajuan
            </button>
            <button id="btn-verify-approve" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm">
              Setujui Pengajuan
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach Event Handlers
  setTimeout(() => {
    let currentSelectedReq = null;
    const modalVerify = document.getElementById('modal-verify-action');
    const verifyInfo = document.getElementById('verify-info-box');
    const verifyNote = document.getElementById('verify-note');

    document.querySelectorAll('.btn-open-verify').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-verify-id');
        currentSelectedReq = getRequests().find(r => r.id === rId);
        if (currentSelectedReq && modalVerify && verifyInfo) {
          verifyInfo.innerHTML = `
            <p><strong class="text-slate-700">Siswa:</strong> ${currentSelectedReq.studentName} (${currentSelectedReq.studentClass})</p>
            <p><strong class="text-slate-700">Layanan:</strong> ${currentSelectedReq.subType}</p>
            <p><strong class="text-slate-700">Alasan:</strong> ${currentSelectedReq.purpose}</p>
          `;
          if (verifyNote) verifyNote.value = '';
          modalVerify.classList.remove('hidden');
        }
      });
    });

    document.getElementById('btn-close-verify')?.addEventListener('click', () => {
      modalVerify?.classList.add('hidden');
    });

    document.getElementById('btn-verify-approve')?.addEventListener('click', () => {
      if (!currentSelectedReq) return;
      const note = document.getElementById('verify-note')?.value || 'Disetujui oleh Wali Kelas';
      const targetStatus = currentSelectedReq.type === 'IZIN_TIDAK_HADIR' ? 'DISETUJUI' : 'DIPROSES_TU';
      
      updateRequestStatus(currentSelectedReq.id, targetStatus, note, currentUser);
      alert(`Pengajuan ${currentSelectedReq.id} telah disetujui!`);
      modalVerify?.classList.add('hidden');
      onSelectTab('OVERVIEW');
    });

    document.getElementById('btn-verify-reject')?.addEventListener('click', () => {
      if (!currentSelectedReq) return;
      const note = document.getElementById('verify-note')?.value?.trim();
      if (!note) {
        alert('Mohon isi alasan penolakan untuk disampaikan ke siswa.');
        return;
      }
      updateRequestStatus(currentSelectedReq.id, 'DITOLAK', note, currentUser);
      alert(`Pengajuan ${currentSelectedReq.id} telah ditolak.`);
      modalVerify?.classList.add('hidden');
      onSelectTab('OVERVIEW');
    });

    if (window.lucide) window.lucide.createIcons();
  }, 0);

  return html;
}
