import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sparkles, GraduationCap, Building2, UserCheck } from "lucide-react"

export function SiteHeader({
  currentUser,
  activeTab,
  toggleAIChat
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'OVERVIEW': return 'Ringkasan Dashboard'
      case 'NEW_REQUEST': return 'Pengajuan Izin / Surat'
      case 'MY_REQUESTS': return 'Riwayat Pengajuan'
      case 'MY_DOCUMENTS': return 'Arsip Dokumen Saya'
      case 'VERIFY': return 'Verifikasi Izin Siswa'
      case 'CLASS_STUDENTS': return 'Daftar & Rekap Siswa'
      case 'STUDENTS': return 'Master Data Siswa'
      case 'ALL_REQUESTS': return 'Pengesahan & Surat'
      case 'ARCHIVE': return 'Arsip & Dokumen Resmi'
      case 'REPORTS': return 'Laporan & Statistik'
      default: return 'Portal Administrasi'
    }
  }

  const getRoleBadge = () => {
    if (currentUser?.role === 'ADMIN') {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] font-medium border-primary/30 text-primary bg-primary/5 shrink-0">
          <Building2 className="w-3 h-3" />
          <span className="hidden sm:inline">Tata Usaha (TU)</span>
          <span className="sm:hidden">TU</span>
        </Badge>
      )
    }
    if (currentUser?.role === 'TEACHER') {
      return (
        <Badge variant="outline" className="gap-1 text-[11px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/5 shrink-0">
          <UserCheck className="w-3 h-3" />
          <span className="hidden sm:inline">Wali Kelas</span>
          <span className="sm:hidden">Guru</span>
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1 text-[11px] font-medium border-blue-500/30 text-blue-600 bg-blue-500/5 shrink-0">
        <GraduationCap className="w-3 h-3" />
        <span>Siswa</span>
      </Badge>
    )
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6">
      
      {/* Left: Mobile Sidebar Trigger + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="md:hidden h-8 w-8 text-slate-700 dark:text-zinc-300 shrink-0" />
        
        {/* Mobile Page Title */}
        <span className="sm:hidden font-semibold text-xs text-foreground truncate">
          {getTabTitle()}
        </span>

        {/* Desktop Breadcrumb */}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="font-normal text-muted-foreground hover:text-foreground">
                SMA N 6 Semarang
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {getTabTitle()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Role Badge & AI Quick Action */}
      <div className="flex items-center gap-2 shrink-0">
        {currentUser && getRoleBadge()}
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={toggleAIChat}
          className="gap-1.5 h-8 px-2.5 text-xs font-semibold border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Asisten AI</span>
        </Button>
      </div>

    </header>
  )
}
