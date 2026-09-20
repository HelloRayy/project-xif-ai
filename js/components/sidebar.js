export function renderSidebar(currentUser, activeTab, onSelectTab, onToggleAI) {
  if (!currentUser) return '';

  const role = currentUser.role;

  const studentMenus = [
    { id: 'OVERVIEW', label: 'Ringkasan', icon: 'layout-dashboard' },
    { id: 'NEW_REQUEST', label: 'Pengajuan Baru', icon: 'file-plus' },
    { id: 'MY_REQUESTS', label: 'Riwayat & Lacak Status', icon: 'file-text' },
    { id: 'MY_DOCUMENTS', label: 'Dokumen Saya', icon: 'folder-down' },
  ];

  const teacherMenus = [
    { id: 'OVERVIEW', label: 'Antrean Verifikasi Kelas', icon: 'check-square' },
    { id: 'CLASS_ATTENDANCE', label: 'Rekap Absensi & Izin', icon: 'calendar-check' },
    { id: 'ALL_STUDENTS', label: 'Data Siswa Ampuan', icon: 'users' },
  ];

  const adminMenus = [
    { id: 'OVERVIEW', label: 'Dashboard Monitoring', icon: 'layout-dashboard' },
    { id: 'MANAGE_REQUESTS', label: 'Kelola Seluruh Pengajuan', icon: 'file-text' },
    { id: 'MANAGE_STUDENTS', label: 'Data Siswa (CRUD)', icon: 'users' },
    { id: 'DOCUMENTS_STORE', label: 'Master Dokumen Sekolah', icon: 'folder-archive' },
    { id: 'REPORTS', label: 'Statistik & Ekspor Laporan', icon: 'bar-chart-3' },
  ];

  const menus = role === 'ADMIN' ? adminMenus : role === 'TEACHER' ? teacherMenus : studentMenus;

  const sidebarHtml = `
    <aside class="w-full md:w-64 bg-white border-r border-teal-100 flex-shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div class="space-y-6">
        
        <!-- User Info Card -->
        <div class="p-3.5 rounded-xl bg-gradient-tosca-card border border-teal-100 shadow-sm">
          <p class="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">Peran Login Saat Ini</p>
          <p class="text-sm font-bold text-slate-800 mt-0.5 truncate">${currentUser.name}</p>
          <p class="text-xs text-slate-500">${currentUser.roleLabel || currentUser.role}</p>
        </div>

        <!-- Navigation Section -->
        <div>
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </p>
          <nav class="space-y-1">
            ${menus.map(item => `
              <button
                data-tab-id="${item.id}"
                class="btn-sidebar-tab w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
                }"
              >
                <i data-lucide="${item.icon}" class="w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}"></i>
                <span>${item.label}</span>
              </button>
            `).join('')}
          </nav>
        </div>

        <!-- AI Assistant Banner -->
        <div class="pt-4 border-t border-slate-100">
          <div class="p-3.5 rounded-xl bg-gradient-to-br from-teal-900 to-teal-800 text-white shadow-md relative overflow-hidden">
            <div class="flex items-center gap-2 text-teal-200 text-xs font-semibold mb-1">
              <i data-lucide="sparkles" class="w-4 h-4 text-teal-300"></i>
              Asisten AI Sekolah
            </div>
            <p class="text-[11px] text-teal-100 leading-relaxed mb-3">
              Bingung syarat atau alur izin? Tanyakan instan ke AI Knowledge Base.
            </p>
            <button id="btn-sidebar-ai" class="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-teal-900 text-xs font-bold rounded-lg hover:bg-teal-50 transition-all shadow-sm">
              <i data-lucide="help-circle" class="w-3.5 h-3.5 text-teal-700"></i>
              Tanya AI Sekarang
            </button>
          </div>
        </div>

      </div>
    </aside>
  `;

  // Attach Event Listeners
  setTimeout(() => {
    document.querySelectorAll('.btn-sidebar-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab-id');
        if (tabId) onSelectTab(tabId);
      });
    });

    document.getElementById('btn-sidebar-ai')?.addEventListener('click', onToggleAI);
    if (window.lucide) window.lucide.createIcons();
  }, 0);

  return sidebarHtml;
}
