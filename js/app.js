import { initStorage, getCurrentUser, setCurrentUser } from './services/storage.js';
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { renderAIModal } from './components/ai-modal.js';
import { renderLoginView } from './views/login.js';
import { renderStudentDashboard } from './views/student.js';
import { renderTeacherDashboard } from './views/teacher.js';
import { renderAdminDashboard } from './views/admin.js';

// Global App State
let currentUser = null;
let currentActiveTab = 'OVERVIEW';
let isAIOpen = false;

export function initApp() {
  initStorage();
  currentUser = getCurrentUser();
  renderApp();
}

function handleLoginSuccess(user) {
  currentUser = user;
  currentActiveTab = 'OVERVIEW';
  renderApp();
}

function handleLogout() {
  setCurrentUser(null);
  currentUser = null;
  currentActiveTab = 'OVERVIEW';
  renderApp();
}

function handleSelectTab(tabId) {
  currentActiveTab = tabId;
  renderMainView();
}

function handleToggleAI() {
  isAIOpen = !isAIOpen;
  renderAI();
}

function renderApp() {
  const appMount = document.getElementById('app');
  if (!appMount) return;

  if (!currentUser) {
    renderLoginView(handleLoginSuccess);
    return;
  }

  appMount.innerHTML = `
    <!-- Top Navbar -->
    <div id="navbar-container"></div>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <!-- Sidebar -->
      <div id="sidebar-container"></div>

      <!-- Active View Body -->
      <main id="main-view-container" class="flex-1 min-w-0"></main>
    </div>

    <!-- AI Modal -->
    <div id="ai-modal-container"></div>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 SchoolAdmin Digitalization System. All rights reserved.</p>
        <p class="text-[11px] text-teal-700 font-medium">Pure Vanilla HTML/CSS/JS Architecture (Zero-Build-Step)</p>
      </div>
    </footer>
  `;

  renderNavAndSidebar();
  renderMainView();
  renderAI();
}

function renderNavAndSidebar() {
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    navContainer.innerHTML = renderNavbar(currentUser, handleLogout, handleToggleAI);
  }

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar(currentUser, currentActiveTab, handleSelectTab, handleToggleAI);
  }
}

function renderMainView() {
  const mainContainer = document.getElementById('main-view-container');
  if (!mainContainer || !currentUser) return;

  if (currentUser.role === 'STUDENT') {
    mainContainer.innerHTML = renderStudentDashboard(currentUser, currentActiveTab, handleSelectTab);
  } else if (currentUser.role === 'TEACHER') {
    mainContainer.innerHTML = renderTeacherDashboard(currentUser, currentActiveTab, handleSelectTab);
  } else if (currentUser.role === 'ADMIN') {
    mainContainer.innerHTML = renderAdminDashboard(currentUser, currentActiveTab, handleSelectTab);
  }

  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar(currentUser, currentActiveTab, handleSelectTab, handleToggleAI);
  }
}

function renderAI() {
  const aiContainer = document.getElementById('ai-modal-container');
  if (aiContainer) {
    aiContainer.innerHTML = renderAIModal(isAIOpen, () => {
      isAIOpen = false;
      renderAI();
    }, (targetTab) => {
      currentActiveTab = targetTab;
      renderMainView();
    });
  }
}

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', initApp);
