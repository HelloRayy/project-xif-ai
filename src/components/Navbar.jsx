import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  X,
  Database,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { cn } from '../lib/utils';
import { getNotifications, markNotificationsRead, seedSampleData, clearStorageData } from '../services/storage';

export default function Navbar({ currentUser, onLogout, toggleAIChat }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDataMenu, setShowDataMenu] = useState(false);

  // shadcn AlertDialog State
  const [alertState, setAlertState] = useState({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Mengerti',
    cancelLabel: null,
    variant: 'default',
    onConfirm: null
  });

  const showAlert = (title, description, confirmLabel = 'Mengerti', cancelLabel = null, variant = 'default', onConfirm = null) => {
    setAlertState({
      open: true,
      title,
      description,
      confirmLabel,
      cancelLabel,
      variant,
      onConfirm
    });
  };

  useEffect(() => {
    if (currentUser) {
      loadNotifs();
    }
  }, [currentUser]);

  const loadNotifs = () => {
    if (!currentUser) return;
    const notifs = getNotifications(currentUser.id);
    setNotifications(notifs);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = () => {
    if (!currentUser) return;
    markNotificationsRead(currentUser.id);
    loadNotifs();
  };

  const handleSeedData = () => {
    setShowDataMenu(false);
    showAlert(
      'Isi Sample Data Demo',
      'Apakah Anda ingin mengisi database lokal dengan data contoh pengajuan, siswa, dan dokumen? Anda akan logout secara otomatis untuk menyinkronkan data.',
      'Ya, Isi Data Demo',
      'Batal',
      'default',
      () => {
        seedSampleData();
        onLogout();
      }
    );
  };

  const handleClearData = () => {
    setShowDataMenu(false);
    showAlert(
      'Reset Database Lokal',
      'Apakah Anda yakin ingin mengosongkan seluruh database lokal aplikasi? Seluruh data riwayat pengajuan dan akun uji coba akan dibersihkan.',
      'Ya, Kosongkan Data',
      'Batal',
      'destructive',
      () => {
        clearStorageData();
        onLogout();
      }
    );
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="default" className="gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>TU / Admin</span>
          </Badge>
        );
      case 'TEACHER':
        return (
          <Badge variant="secondary" className="gap-1">
            <UserCheck className="w-3 h-3" />
            <span>Wali Kelas</span>
          </Badge>
        );
      case 'STUDENT':
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <BookOpen className="w-3 h-3" />
            <span>Siswa</span>
          </Badge>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                  SchoolAdmin
                </span>
                <Badge variant="secondary" className="text-[10px] uppercase font-medium">
                  MVP Pilot
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Digitalisasi Administrasi Sekolah & Asisten AI</p>
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick AI Assistant Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAIChat}
              className="gap-1.5 text-xs font-medium"
              title="Tanyakan Prosedur ke Asisten AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Asisten AI</span>
            </Button>

            {/* Quick Demo Data Options */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="h-8 w-8 text-slate-600 dark:text-zinc-400"
                title="Pengelolaan Data Demo"
              >
                <Database className="w-4 h-4" />
              </Button>
              
              {showDataMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-lg shadow-md border border-border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase px-2.5 py-1">
                    Opsi Data Demo
                  </div>
                  <button
                    onClick={handleSeedData}
                    className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground rounded-md flex items-center gap-2 transition-colors font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Isi Sample Data Demo
                  </button>
                  <button
                    onClick={handleClearData}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md flex items-center gap-2 transition-colors font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    Reset Database Kosong
                  </button>
                </div>
              )}
            </div>

            {/* In-App Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) handleMarkRead();
                }}
                className="relative h-8 w-8 text-slate-600 dark:text-zinc-400"
                title="Notifikasi In-App"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Popover Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-popover text-popover-foreground rounded-xl shadow-lg border border-border p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-foreground" />
                      <h4 className="text-sm font-semibold">Notifikasi Sistem</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotifs(false)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-xs">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-lg border text-xs transition-colors ${
                            n.isRead ? 'bg-muted/40 border-border text-muted-foreground' : 'bg-muted/80 border-border text-foreground'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                            {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                            {n.type === 'danger' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                            {n.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                            <div className="flex-1">
                              <p className="font-semibold mb-0.5">{n.title}</p>
                              <p className="text-[11px] leading-relaxed text-muted-foreground">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/80 mt-1.5">{n.createdAt}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="h-5" />

            {/* Current User Profile & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[140px] leading-tight">
                      {currentUser.name}
                    </p>
                    <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="gap-1 text-muted-foreground hover:text-foreground h-8 text-xs font-medium"
                  title="Logout dari Sesi Ini"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Keluar</span>
                </Button>
              </div>
            ) : null}

          </div>
        </div>
      </div>

      {/* =========================================================================
          Standard Shadcn AlertDialog Component
          ========================================================================= */}
      <AlertDialog open={alertState.open} onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertState.cancelLabel && (
              <AlertDialogCancel
                onClick={() => setAlertState(prev => ({ ...prev, open: false }))}
                className="h-9 px-3.5 text-xs font-medium rounded-lg"
              >
                {alertState.cancelLabel}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className={cn(
                "h-9 px-4 text-xs font-medium rounded-lg",
                alertState.variant === 'destructive' ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              onClick={() => {
                if (alertState.onConfirm) alertState.onConfirm();
                setAlertState(prev => ({ ...prev, open: false }));
              }}
            >
              {alertState.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
}
