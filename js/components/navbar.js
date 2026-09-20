import { getNotifications, markNotificationsRead, seedSampleData, clearStorageData } from '../services/storage.js';

export function renderNavbar(currentUser, onLogout, onToggleAI) {
  const notifs = currentUser ? getNotifications(currentUser.id) : [];
  const unreadCount = notifs.filter(n => !n.isRead).length;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-teal-600"></i> TU / Admin
        </span>`;
      case 'TEACHER':
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <i data-lucide="user-check" class="w-3.5 h-3.5 text-blue-600"></i> Wali Kelas
        </span>`;
      case 'STUDENT':
      default:
        return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-600"></i> Siswa
        </span>`;
    }
  };

  const navHtml = `
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <i data-lucide="graduation-cap" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 tracking-tight">
                  SchoolAdmin
                </span>
                <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 border border-teal-200">
                  MVP Pilot
                </span>
              </div>
              <p class="text-xs text-slate-500 hidden sm:block">Digitalisasi Administrasi Sekolah & Asisten AI</p>
            </div>
          </div>

          <!-- Tools & Profile -->
          <div class="flex items-center gap-3">
            
            <!-- AI Assistant Button -->
            <button id="btn-toggle-ai" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4 text-teal-600 animate-pulse"></i>
              <span class="hidden md:inline font-semibold">Asisten AI</span>
            </button>

            <!-- Quick Demo Data Menu -->
            <div class="relative">
              <button id="btn-demo-data" class="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-all" title="Pengelolaan Data Demo">
                <i data-lucide="database" class="w-5 h-5"></i>
              </button>
              
              <div id="menu-demo-data" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
                <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                  Opsi Data Demo
                </div>
                <button id="btn-seed-data" class="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 rounded-lg flex items-center gap-2 font-medium">
                  <span class="w-2 h-2 rounded-full bg-teal-500"></span>
                  Isi Sample Data Demo
                </button>
                <button id="btn-clear-data" class="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-lg flex items-center gap-2 font-medium">
                  <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                  Reset Database Kosong
                </button>
              </div>
            </div>

            <!-- In-App Notifications -->
            <div class="relative">
              <button id="btn-notifs" class="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-all" title="Notifikasi In-App">
                <i data-lucide="bell" class="w-5 h-5"></i>
                ${unreadCount > 0 ? `
                  <span class="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    ${unreadCount}
                  </span>
                ` : ''}
              </button>

              <div id="popover-notifs" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div class="flex items-center gap-2">
                    <i data-lucide="bell" class="w-4 h-4 text-teal-600"></i>
                    <h4 class="text-sm font-semibold text-slate-800">Notifikasi Sistem</h4>
                  </div>
                  <button id="btn-close-notifs" class="text-slate-400 hover:text-slate-600 p-1">
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                </div>

                <div class="max-h-72 overflow-y-auto space-y-2 pr-1">
                  ${notifs.length === 0 ? `
                    <div class="py-8 text-center text-slate-400 text-xs">Belum ada notifikasi baru.</div>
                  ` : notifs.map(n => `
                    <div class="p-3 rounded-xl border text-xs ${n.isRead ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-teal-50/60 border-teal-100 text-slate-800'}">
                      <div class="flex items-start gap-2">
                        <i data-lucide="${n.type === 'success' ? 'check-circle-2' : n.type === 'warning' ? 'alert-circle' : n.type === 'danger' ? 'alert-triangle' : 'info'}" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                        <div class="flex-1">
                          <p class="font-semibold text-slate-800 mb-0.5">${n.title}</p>
                          <p class="text-slate-600 text-[11px] leading-relaxed">${n.message}</p>
                          <p class="text-[10px] text-slate-400 mt-1.5">${n.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="h-6 w-px bg-slate-200"></div>

            <!-- User Info & Logout -->
            ${currentUser ? `
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2.5">
                  <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${currentUser.name}" class="w-8 h-8 rounded-full object-cover border border-teal-300 shadow-sm" />
                  <div class="hidden sm:block text-left">
                    <p class="text-xs font-semibold text-slate-800 truncate max-w-[140px] leading-tight">${currentUser.name}</p>
                    <div class="mt-0.5">${getRoleBadge(currentUser.role)}</div>
                  </div>
                </div>

                <button id="btn-logout" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 hover:border-rose-200" title="Logout dari Sesi Ini">
                  <i data-lucide="log-out" class="w-4 h-4"></i>
                  <span class="hidden md:inline">Keluar</span>
                </button>
              </div>
            ` : ''}

          </div>
        </div>
      </div>
    </header>
  `;

  // Attach Event Listeners
  setTimeout(() => {
    document.getElementById('btn-toggle-ai')?.addEventListener('click', onToggleAI);
    
    // Demo data dropdown
    const demoBtn = document.getElementById('btn-demo-data');
    const demoMenu = document.getElementById('menu-demo-data');
    demoBtn?.addEventListener('click', () => {
      demoMenu?.classList.toggle('hidden');
    });

    document.getElementById('btn-seed-data')?.addEventListener('click', () => {
      if (confirm('Isi data demo lengkap ke database lokal?')) {
        seedSampleData();
        alert('Data demo berhasil dimasukkan! Silakan login ulang.');
        onLogout();
      }
    });

    document.getElementById('btn-clear-data')?.addEventListener('click', () => {
      if (confirm('Kosongkan seluruh data di database lokal?')) {
        clearStorageData();
        alert('Database lokal berhasil dikosongkan.');
        onLogout();
      }
    });

    // Notifications popover
    const notifBtn = document.getElementById('btn-notifs');
    const notifPopover = document.getElementById('popover-notifs');
    notifBtn?.addEventListener('click', () => {
      notifPopover?.classList.toggle('hidden');
      if (currentUser && !notifPopover?.classList.contains('hidden')) {
        markNotificationsRead(currentUser.id);
      }
    });

    document.getElementById('btn-close-notifs')?.addEventListener('click', () => {
      notifPopover?.classList.add('hidden');
    });

    document.getElementById('btn-logout')?.addEventListener('click', onLogout);

    if (window.lucide) window.lucide.createIcons();
  }, 0);

  return navHtml;
}
