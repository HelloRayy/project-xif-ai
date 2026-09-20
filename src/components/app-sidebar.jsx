"use client"

import * as React from "react"
import {
  GraduationCap,
  LayoutDashboard,
  FilePlus,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  FileSignature,
  Settings,
  Sparkles,
  FolderArchive,
  LogOut,
  Building2,
  UserCheck,
  FileText,
  BarChart3
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AppSidebar({
  currentUser,
  activeTab,
  setActiveTab,
  toggleAIChat,
  onLogout,
  ...props
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  if (!currentUser) return null

  const getMenuItems = () => {
    if (currentUser.role === 'STUDENT') {
      return [
        {
          id: 'OVERVIEW',
          title: 'Ringkasan & Status',
          icon: LayoutDashboard,
        },
        {
          id: 'NEW_REQUEST',
          title: 'Pengajuan Izin / Surat',
          icon: FilePlus,
        },
        {
          id: 'MY_REQUESTS',
          title: 'Riwayat Pengajuan',
          icon: Clock,
        },
        {
          id: 'MY_DOCUMENTS',
          title: 'Arsip Dokumen Saya',
          icon: FileText,
        },
      ]
    }
    if (currentUser.role === 'TEACHER') {
      return [
        {
          id: 'OVERVIEW',
          title: 'Monitoring Kelas',
          icon: LayoutDashboard,
        },
        {
          id: 'VERIFY',
          title: 'Verifikasi Izin Siswa',
          icon: CheckCircle2,
        },
        {
          id: 'CLASS_STUDENTS',
          title: 'Daftar & Rekap Siswa',
          icon: FileSpreadsheet,
        },
      ]
    }
    // ADMIN (Tata Usaha)
    return [
      {
        id: 'OVERVIEW',
        title: 'Monitoring & Pengesahan',
        icon: LayoutDashboard,
      },
      {
        id: 'STUDENTS',
        title: 'Master Data Siswa',
        icon: Users,
      },
      {
        id: 'ARCHIVE',
        title: 'Arsip & Dokumen Resmi',
        icon: FolderArchive,
      },
      {
        id: 'REPORTS',
        title: 'Laporan & Statistik',
        icon: BarChart3,
      },
    ]
  }

  const menuItems = getMenuItems()

  const handleItemClick = (id) => {
    setActiveTab(id)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background" {...props}>
      
      {/* Sidebar Header: School Brand */}
      <SidebarHeader className="border-b border-border/80 px-3 py-3.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20 shrink-0">
                <GraduationCap className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-bold text-foreground">SMA N 6 Semarang</span>
                <span className="truncate text-[10px] text-muted-foreground">Portal Administrasi Terpadu</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-2 py-3">
        
        {/* Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
            Menu ({currentUser.role === 'ADMIN' ? 'Staf TU' : currentUser.role === 'TEACHER' ? 'Wali Kelas' : 'Siswa'})
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1 flex flex-col gap-1">
            <SidebarMenu>
              {menuItems.map((item) => {
                const ItemIcon = item.icon
                const isActive = activeTab === item.id || (item.id === 'OVERVIEW' && activeTab === 'ALL_REQUESTS') || (item.id === 'STUDENTS' && activeTab === 'MANAGE_STUDENTS') || (item.id === 'ARCHIVE' && activeTab === 'DOCUMENTS_STORE')
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      onClick={() => handleItemClick(item.id)}
                      className={`h-9 rounded-lg px-2.5 text-xs font-medium ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-foreground'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <ItemIcon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Sidebar Footer: User Profile & Logout */}
      <SidebarFooter className="border-t border-border/80 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/60">
              <Avatar className="h-8 w-8 rounded-md shrink-0 bg-primary/10 text-primary border border-primary/20">
                <AvatarFallback className="text-xs font-bold text-primary">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                <span className="truncate font-semibold text-foreground">{currentUser.name}</span>
                <span className="truncate text-[10px] text-muted-foreground">{currentUser.roleLabel || currentUser.role}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Keluar dari Akun"
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}
