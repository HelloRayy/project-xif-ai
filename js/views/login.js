import { getUsers, saveUser, seedSampleData, setCurrentUser } from '../services/storage.js';

let selectedRole = 'STUDENT';

export function renderLoginView(onLoginSuccess) {
  const users = getUsers();
  const isEmptyDB = users.length === 0;

  const html = `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <!-- Background Soft Gradients -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/60 to-transparent pointer-events-none -z-10"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Logo -->
        <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 text-white flex items-center justify-center shadow-xl shadow-teal-600/30 mb-4">
          <i data-lucide="graduation-cap" class="w-9 h-9"></i>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">SchoolAdmin Portal</h2>
        <p class="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">Digitalisasi Administrasi & Layanan Surat Sekolah Terpadu</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        
        <!-- Role Tabs -->
        <div class="bg-slate-200/70 p-1.5 rounded-2xl flex gap-1 mb-4 border border-slate-300/60 shadow-inner">
          <button id="tab-role-student" class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedRole === 'STUDENT' ? 'bg-white text-teal-800 shadow-md border border-teal-100' : 'text-slate-600 hover:text-slate-900'}">
            <i data-lucide="book-open" class="w-4 h-4 text-emerald-600"></i>
            <span>Siswa</span>
          </button>
          <button id="tab-role-teacher" class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedRole === 'TEACHER' ? 'bg-white text-teal-800 shadow-md border border-teal-100' : 'text-slate-600 hover:text-slate-900'}">
            <i data-lucide="user-check" class="w-4 h-4 text-blue-600"></i>
            <span>Wali Kelas</span>
          </button>
          <button id="tab-role-admin" class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedRole === 'ADMIN' ? 'bg-white text-teal-800 shadow-md border border-teal-100' : 'text-slate-600 hover:text-slate-900'}">
            <i data-lucide="shield-check" class="w-4 h-4 text-teal-600"></i>
            <span>TU / Admin</span>
          </button>
        </div>

        <!-- Main Card -->
        <div class="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-teal-100/80 relative">
          
          ${isEmptyDB ? `
            <div class="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <div class="flex items-start gap-2.5">
                <i data-lucide="alert-circle" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"></i>
                <div>
                  <p class="font-bold mb-1">Database Lokal Masih Kosong</p>
                  <p class="text-slate-600 leading-relaxed mb-3">Klik tombol di bawah ini untuk mengisi data sampel secara instan.</p>
                  <button id="btn-seed-empty" class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all">
                    <i data-lucide="database" class="w-3.5 h-3.5"></i>
                    Isi Sample Data Demo (1 Klik)
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <div id="login-error-box" class="hidden mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span id="login-error-text"></span>
          </div>

          <form id="form-login" class="space-y-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Username Akses (<span id="role-label-login">${selectedRole === 'ADMIN' ? 'TU' : selectedRole === 'TEACHER' ? 'Guru' : 'Siswa'}</span>)
              </label>
              <div class="relative">
                <i data-lucide="user" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                <input
                  id="input-username"
                  type="text"
                  required
                  placeholder="Contoh: siswa.budi / admin.tu"
                  class="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi (Password)</label>
              <div class="relative">
                <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                <input
                  id="input-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 hover:from-teal-800 hover:to-teal-900 transition-all shadow-lg shadow-teal-600/25 active:scale-[0.99]"
            >
              <i data-lucide="log-in" class="w-4 h-4"></i>
              <span>Masuk ke Portal (<span id="role-btn-label">${selectedRole === 'ADMIN' ? 'TU' : selectedRole === 'TEACHER' ? 'Wali Kelas' : 'Siswa'}</span>)</span>
            </button>
          </form>

          <!-- Preset Demo Accounts -->
          ${!isEmptyDB ? `
            <div class="mt-6 pt-5 border-t border-slate-100">
              <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Pilih Akun Demo Instan (1 Klik Login)
              </p>
              <div class="space-y-1.5 text-xs">
                <button id="quick-student" class="w-full p-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-lg flex items-center justify-between text-slate-700 font-medium transition-all">
                  <span class="flex items-center gap-2">
                    <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-600"></i>
                    Siswa: Budi Santoso (X-IPA 1)
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">siswa.budi</span>
                </button>
                <button id="quick-teacher" class="w-full p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg flex items-center justify-between text-slate-700 font-medium transition-all">
                  <span class="flex items-center gap-2">
                    <i data-lucide="user-check" class="w-3.5 h-3.5 text-blue-600"></i>
                    Wali Kelas: Ahmad Dahlan, S.Pd.
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">guru.ahmad</span>
                </button>
                <button id="quick-admin" class="w-full p-2 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-lg flex items-center justify-between text-slate-700 font-medium transition-all">
                  <span class="flex items-center gap-2">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5 text-teal-600"></i>
                    Admin TU: Hj. Ratna Sari, S.E.
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">admin.tu</span>
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Register button -->
          <div class="mt-5 text-center">
            <button id="btn-open-register" class="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 hover:underline">
              <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
              <span>Tambah / Registrasi Akun Pengguna Baru</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Registration Modal Container -->
      <div id="modal-register" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-teal-100 p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-5 h-5 text-teal-600"></i>
              Registrasi Akun Baru
            </h3>
            <button id="btn-close-register" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form id="form-register-new" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Peran Akun</label>
              <select id="reg-role" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="STUDENT">Siswa</option>
                <option value="TEACHER">Wali Kelas / Guru</option>
                <option value="ADMIN">Staf Tata Usaha (TU) / Admin</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="reg-name" type="text" required placeholder="Contoh: Muhammad Rizky" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Username</label>
                <input id="reg-username" type="text" required placeholder="Contoh: rizky123" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Password</label>
                <input id="reg-password" type="password" required placeholder="••••••••" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div id="reg-class-container">
              <label class="block font-semibold text-slate-700 mb-1">Kelas</label>
              <select id="reg-class" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="X-IPA 1">X-IPA 1</option>
                <option value="X-IPA 2">X-IPA 2</option>
                <option value="XI-IPS 1">XI-IPS 1</option>
                <option value="XI-IPS 2">XI-IPS 2</option>
                <option value="XII-IPA 1">XII-IPA 1</option>
              </select>
            </div>

            <div class="pt-3 flex gap-2 justify-end">
              <button type="button" id="btn-cancel-register" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">
                Batal
              </button>
              <button type="submit" class="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-sm">
                Simpan & Buat Akun
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;

  setTimeout(() => {
    // Role tabs switching
    const setRole = (role) => {
      selectedRole = role;
      document.getElementById('tab-role-student')?.classList.toggle('bg-white', role === 'STUDENT');
      document.getElementById('tab-role-student')?.classList.toggle('text-teal-800', role === 'STUDENT');
      document.getElementById('tab-role-teacher')?.classList.toggle('bg-white', role === 'TEACHER');
      document.getElementById('tab-role-teacher')?.classList.toggle('text-teal-800', role === 'TEACHER');
      document.getElementById('tab-role-admin')?.classList.toggle('bg-white', role === 'ADMIN');
      document.getElementById('tab-role-admin')?.classList.toggle('text-teal-800', role === 'ADMIN');
      
      const label = role === 'ADMIN' ? 'TU' : role === 'TEACHER' ? 'Wali Kelas' : 'Siswa';
      const roleLogin = document.getElementById('role-label-login');
      const roleBtn = document.getElementById('role-btn-label');
      if (roleLogin) roleLogin.innerText = label;
      if (roleBtn) roleBtn.innerText = label;
    };

    document.getElementById('tab-role-student')?.addEventListener('click', () => setRole('STUDENT'));
    document.getElementById('tab-role-teacher')?.addEventListener('click', () => setRole('TEACHER'));
    document.getElementById('tab-role-admin')?.addEventListener('click', () => setRole('ADMIN'));

    // Seed empty DB
    document.getElementById('btn-seed-empty')?.addEventListener('click', () => {
      seedSampleData();
      renderLoginView(onLoginSuccess);
    });

    // Quick login credentials
    const fillLogin = (u, p, r) => {
      setRole(r);
      const userInp = document.getElementById('input-username');
      const passInp = document.getElementById('input-password');
      if (userInp) userInp.value = u;
      if (passInp) passInp.value = p;
    };

    document.getElementById('quick-student')?.addEventListener('click', () => fillLogin('siswa.budi', 'password123', 'STUDENT'));
    document.getElementById('quick-teacher')?.addEventListener('click', () => fillLogin('guru.ahmad', 'password123', 'TEACHER'));
    document.getElementById('quick-admin')?.addEventListener('click', () => fillLogin('admin.tu', 'password123', 'ADMIN'));

    // Form submit
    document.getElementById('form-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('input-username')?.value?.trim();
      const password = document.getElementById('input-password')?.value;
      const errorBox = document.getElementById('login-error-box');
      const errorText = document.getElementById('login-error-text');

      const allUsers = getUsers();
      const foundUser = allUsers.find(
        u => u.username.toLowerCase() === username?.toLowerCase() &&
             u.password === password &&
             u.role === selectedRole
      );

      if (foundUser) {
        setCurrentUser(foundUser);
        onLoginSuccess(foundUser);
      } else {
        if (errorBox && errorText) {
          errorText.innerText = 'Kredensial atau peran login tidak sesuai. Periksa kembali username & password.';
          errorBox.classList.remove('hidden');
        }
      }
    });

    // Registration Modal
    const modalReg = document.getElementById('modal-register');
    document.getElementById('btn-open-register')?.addEventListener('click', () => {
      modalReg?.classList.remove('hidden');
    });
    document.getElementById('btn-close-register')?.addEventListener('click', () => {
      modalReg?.classList.add('hidden');
    });
    document.getElementById('btn-cancel-register')?.addEventListener('click', () => {
      modalReg?.classList.add('hidden');
    });

    document.getElementById('form-register-new')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const rRole = document.getElementById('reg-role')?.value;
      const rName = document.getElementById('reg-name')?.value?.trim();
      const rUser = document.getElementById('reg-username')?.value?.trim();
      const rPass = document.getElementById('reg-password')?.value;
      const rClass = document.getElementById('reg-class')?.value;

      if (!rName || !rUser || !rPass) return;

      const newUser = {
        id: `usr-${rRole?.toLowerCase()}-${Date.now()}`,
        username: rUser,
        password: rPass,
        name: rName,
        role: rRole,
        roleLabel: rRole === 'ADMIN' ? 'Staf TU / Admin Utama' : rRole === 'TEACHER' ? `Wali Kelas ${rClass}` : `Siswa Kelas ${rClass}`,
        assignedClass: rRole === 'TEACHER' ? rClass : undefined,
        class: rRole === 'STUDENT' ? rClass : undefined,
        nis: rRole === 'STUDENT' ? '2026' + Math.floor(1000 + Math.random() * 9000) : undefined,
        email: `${rUser}@schooladmin.sch.id`
      };

      saveUser(newUser);
      alert('Akun berhasil dibuat! Silakan login.');
      modalReg?.classList.add('hidden');
      fillLogin(rUser, rPass, rRole);
    });

    if (window.lucide) window.lucide.createIcons();
  }, 0);

  const appMount = document.getElementById('app');
  if (appMount) {
    appMount.innerHTML = html;
  }
}
