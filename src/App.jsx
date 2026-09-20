import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import AIChatbotModal from './components/AIChatbotModal';
import LoginView from './views/LoginView';
import StudentDashboard from './views/StudentDashboard';
import TeacherDashboard from './views/TeacherDashboard';
import AdminDashboard from './views/AdminDashboard';
import { getCurrentUser, setCurrentUser, initStorage } from './services/storage';

export default function App() {
  const [currentUser, setCurrentUserState] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    initStorage();
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUserState(user);
    setActiveTab('OVERVIEW');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setActiveTab('OVERVIEW');
  };

  const toggleAIChat = () => {
    setIsAIChatOpen(prev => !prev);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background font-sans text-foreground antialiased">
        
        {/* Modern shadcn dashboard-01 AppSidebar */}
        <AppSidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleAIChat={toggleAIChat}
          onLogout={handleLogout}
        />

        {/* Main Content Inset */}
        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
          
          {/* Top Sticky Site Header with Breadcrumb & Quick Actions */}
          <SiteHeader
            currentUser={currentUser}
            activeTab={activeTab}
            toggleAIChat={toggleAIChat}
          />

          {/* Dynamic Dashboard Body Content */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentUser.role === 'STUDENT' && (
              <StudentDashboard
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                toggleAIChat={toggleAIChat}
              />
            )}

            {currentUser.role === 'TEACHER' && (
              <TeacherDashboard
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {currentUser.role === 'ADMIN' && (
              <AdminDashboard
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
          </main>

          {/* Clean Portal Footer */}
          <footer className="border-t border-border/80 py-3.5 px-4 sm:px-6 text-xs text-muted-foreground bg-background mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <p>© 2026 SMA Negeri 6 Semarang — SchoolAdmin System. All rights reserved.</p>
              <p className="text-[11px] text-muted-foreground">
                Sistem Digitalisasi Surat & Tata Kelola Administrasi Sekolah Terpadu
              </p>
            </div>
          </footer>

        </SidebarInset>

        {/* AI Chatbot Floating FAB & Assistant Widget */}
        <AIChatbotModal
          isOpen={isAIChatOpen}
          currentUser={currentUser}
          onOpen={() => setIsAIChatOpen(true)}
          onClose={() => setIsAIChatOpen(false)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setIsAIChatOpen(false);
          }}
        />

      </div>
    </SidebarProvider>
  );
}
