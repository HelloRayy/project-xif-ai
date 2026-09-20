import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  FolderDown, 
  CheckSquare, 
  Users, 
  CalendarCheck, 
  FolderArchive, 
  BarChart3, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function Sidebar({ currentUser, activeTab, setActiveTab, toggleAIChat }) {
  if (!currentUser) return null;

  const role = currentUser.role;

  const studentMenus = [
    { id: 'OVERVIEW', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'NEW_REQUEST', label: 'Pengajuan Baru', icon: FilePlus },
    { id: 'MY_REQUESTS', label: 'Riwayat & Lacak Status', icon: FileText },
    { id: 'MY_DOCUMENTS', label: 'Dokumen Saya', icon: FolderDown },
  ];

  const teacherMenus = [
    { id: 'OVERVIEW', label: 'Antrean Verifikasi Kelas', icon: CheckSquare },
    { id: 'CLASS_ATTENDANCE', label: 'Rekap Absensi & Izin', icon: CalendarCheck },
    { id: 'ALL_STUDENTS', label: 'Data Siswa Ampuan', icon: Users },
  ];

  const adminMenus = [
    { id: 'OVERVIEW', label: 'Dashboard Monitoring', icon: LayoutDashboard },
    { id: 'MANAGE_REQUESTS', label: 'Kelola Seluruh Pengajuan', icon: FileText },
    { id: 'MANAGE_STUDENTS', label: 'Data Siswa (CRUD)', icon: Users },
    { id: 'DOCUMENTS_STORE', label: 'Master Dokumen Sekolah', icon: FolderArchive },
    { id: 'REPORTS', label: 'Statistik & Ekspor Laporan', icon: BarChart3 },
  ];

  const menus = role === 'ADMIN' ? adminMenus : role === 'TEACHER' ? teacherMenus : studentMenus;

  return (
    <aside className="w-full md:w-64 bg-card border-r border-border flex-shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        
        {/* User Info Card */}
        <Card className="p-3.5 bg-muted/40 shadow-none border-border">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Peran Login Saat Ini</p>
          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.roleLabel || currentUser.role}</p>
        </Card>

        {/* Navigation Section */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {menus.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full justify-start gap-3 h-9 px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

      </div>
    </aside>
  );
}
