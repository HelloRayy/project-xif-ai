import React, { useState, useMemo, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { 
  AlertCircle, 
  ArrowRight, 
  ChevronsUpDown,
  GraduationCap,
  UserCheck,
  Building2,
  User,
  Check,
  CheckCircle2,
  Search,
  IdCard,
  X
} from "lucide-react"
import { getUsers, setCurrentUser } from "@/services/storage"
import { allInitialUsers, initialStudents, defaultTeachers, defaultAdmins } from "@/data/initialData"

const ROLES = [
  {
    value: "STUDENT",
    label: "Siswa (Murid)",
    subLabel: "Nama Lengkap & NISN",
    icon: GraduationCap,
  },
  {
    value: "TEACHER",
    label: "Wali Kelas / Guru",
    subLabel: "Nama Guru & NIP",
    icon: UserCheck,
  },
  {
    value: "ADMIN",
    label: "Guru BK / Staf TU",
    subLabel: "Nama Petugas & NIP",
    icon: Building2,
  },
]

export function LoginForm({
  className,
  onLoginSuccess,
  onSwitchToRegister,
  ...props
}) {
  const [openRole, setOpenRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState("STUDENT")
  const [errorMsg, setErrorMsg] = useState("")
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  // Siswa Form State: Kelas -> Nama Lengkap (Combobox/Dropdown with filter by class) -> NISN
  const [studentClass, setStudentClass] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentNisn, setStudentNisn] = useState("")
  const [openStudentCombobox, setOpenStudentCombobox] = useState(false)

  // Guru Form State
  const [teacherName, setTeacherName] = useState("")
  const [teacherNip, setTeacherNip] = useState("")
  const [teacherAssignedClass, setTeacherAssignedClass] = useState("")

  // BK / TU Form State
  const [adminName, setAdminName] = useState("")
  const [adminNip, setAdminNip] = useState("")

  // All student options (216 students across XI-A s/d XI-F)
  const allStudents = useMemo(() => initialStudents || [], [])

  // Filter students by selected class for accurate matching
  const classStudents = useMemo(() => {
    if (!studentClass) return []
    return allStudents.filter(s => s.class === studentClass)
  }, [studentClass, allStudents])

  // Handle Teacher Selector
  const handleSelectTeacher = (t) => {
    setTeacherName(t.name)
    setTeacherNip(t.nip || "")
    setTeacherAssignedClass(t.assignedClass || "")
    setErrorMsg("")
  }

  // Handle Admin Selector
  const handleSelectAdmin = (a) => {
    setAdminName(a.name)
    setAdminNip(a.nip || "")
    setErrorMsg("")
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setErrorMsg("")

    if (!selectedRole) {
      setErrorMsg("Mohon pilih peran akun terlebih dahulu.")
      return
    }

    const storedUsers = getUsers()
    const users = (storedUsers && storedUsers.length > 0) ? storedUsers : allInitialUsers
    let foundUser = null

    if (selectedRole === "STUDENT") {
      if (!studentClass) {
        setErrorMsg("Mohon pilih Kelas terlebih dahulu.")
        return
      }

      const cleanName = studentName.toLowerCase().trim()
      const cleanNisn = studentNisn.replace(/[^0-9]/g, "").trim()

      if (!cleanName) {
        setErrorMsg("Mohon masukkan Nama Lengkap siswa.")
        return
      }

      // NISN accepted freely: any entered NISN is considered valid
      // Authentication matches the student by class and name
      // 1. Search in users database by class & name
      foundUser = users.find(u => {
        if (u.role !== "STUDENT") return false
        if (u.class !== studentClass) return false

        const uName = (u.name || "").toLowerCase().trim()
        return uName === cleanName || uName.includes(cleanName) || cleanName.includes(uName)
      })

      // 2. Fallback: Search in class students list by class & name
      if (!foundUser) {
        const matchStudent = classStudents.find(s => {
          const sName = s.name.toLowerCase().trim()
          return sName === cleanName || sName.includes(cleanName) || cleanName.includes(sName)
        })

        if (matchStudent) {
          foundUser = {
            id: matchStudent.id,
            username: matchStudent.username,
            name: matchStudent.name,
            role: "STUDENT",
            roleLabel: `Siswa Kelas ${matchStudent.class}`,
            nis: matchStudent.nis,
            nisn: cleanNisn || matchStudent.nisn,
            class: matchStudent.class,
            gender: matchStudent.gender,
            guardianName: matchStudent.guardianName,
            guardianPhone: matchStudent.guardianPhone,
            email: matchStudent.email,
            phone: matchStudent.phone,
            status: "Aktif"
          }
        }
      }

      // If student matched, retain the entered NISN if provided
      if (foundUser && cleanNisn) {
        foundUser = { ...foundUser, nisn: cleanNisn }
      }
    } else if (selectedRole === "TEACHER") {
      const cleanName = teacherName.toLowerCase().trim()
      const cleanNip = teacherNip.replace(/[^0-9]/g, "").trim()

      if (!cleanName && !cleanNip) {
        setErrorMsg("Mohon pilih atau masukkan Nama dan NIP Wali Kelas.")
        return
      }

      foundUser = users.find(u => {
        if (u.role !== "TEACHER") return false
        const uName = (u.name || "").toLowerCase()
        const uNip = (u.nip || "").replace(/[^0-9]/g, "")
        const matchName = !cleanName || uName.includes(cleanName) || cleanName.includes(uName)
        const matchNip = !cleanNip || uNip.includes(cleanNip)
        return matchName && matchNip
      })
    } else if (selectedRole === "ADMIN") {
      const cleanName = adminName.toLowerCase().trim()
      const cleanNip = adminNip.replace(/[^0-9]/g, "").trim()

      if (!cleanName && !cleanNip) {
        setErrorMsg("Mohon pilih atau masukkan Nama Petugas BK/TU.")
        return
      }

      foundUser = users.find(u => {
        if (u.role !== "ADMIN") return false
        const uName = (u.name || "").toLowerCase()
        const uNip = (u.nip || "").replace(/[^0-9]/g, "")
        const matchName = !cleanName || uName.includes(cleanName) || cleanName.includes(uName)
        const matchNip = !cleanNip || uNip.includes(cleanNip)
        return matchName && matchNip
      })
    }

    if (foundUser) {
      setCurrentUser(foundUser)
      onLoginSuccess(foundUser)
    } else {
      if (selectedRole === "STUDENT") {
        setErrorMsg(`Nama siswa "${studentName}" tidak terdaftar di ${studentClass}. Periksa kembali penulisan nama atau kelas.`)
      } else {
        setErrorMsg("Identitas Nama atau NIP tidak ditemukan pada sistem.")
      }
    }
  }

  const activeRole = ROLES.find(r => r.value === selectedRole)
  const ActiveRoleIcon = activeRole ? activeRole.icon : User

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      
      {/* Header Section */}
      <div className="flex flex-col gap-1 text-left sm:text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Portal Layanan Administrasi
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Autentikasi Terpadu SMA Negeri 6 Semarang (Kelas XI-A s/d XI-F)
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        
        {/* Role Selector Combobox */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              Masuk Sebagai (Peran)
            </Label>
            <button
              type="button"
              onClick={() => setShowInfoDialog(true)}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              Panduan Login?
            </button>
          </div>

          <Popover open={openRole} onOpenChange={setOpenRole}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openRole}
                className="w-full justify-between h-10 px-3 text-xs font-medium bg-background border-border hover:bg-muted/40"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ActiveRoleIcon className="w-4 h-4 shrink-0 text-primary" />
                  <span className="truncate text-foreground font-semibold">
                    {activeRole?.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    ({activeRole?.subLabel})
                  </span>
                </div>
                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {ROLES.map((role) => {
                      const RoleIcon = role.icon
                      const isSelected = selectedRole === role.value
                      return (
                        <CommandItem
                          key={role.value}
                          value={role.label}
                          onSelect={() => {
                            setSelectedRole(role.value)
                            setOpenRole(false)
                            setErrorMsg("")
                          }}
                          className={cn(
                            "text-xs cursor-pointer py-2 px-3 flex items-center justify-between rounded-md group transition-colors",
                            isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <RoleIcon className={cn("w-4 h-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                            <div className="flex flex-col">
                              <span>{role.label}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">{role.subLabel}</span>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4 text-primary",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="destructive" className="p-3 text-xs">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* ====================================================================
            ROLE: SISWA (FLOW: KELAS -> INPUT NAMA -> INPUT NISN TANPA SUGGESTION)
            ==================================================================== */}
        {selectedRole === "STUDENT" && (
          <div className="flex flex-col gap-3.5 bg-card p-3.5 rounded-xl border border-border shadow-xs">
            
            {/* 1. Pilih Kelas Siswa */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="student-class-select" className="text-xs font-semibold text-foreground">
                  1. Pilih Kelas
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  XI-A s/d XI-F
                </span>
              </div>
              <Select
                value={studentClass}
                onValueChange={(val) => {
                  setStudentClass(val)
                  setStudentName("")
                  setErrorMsg("")
                }}
              >
                <SelectTrigger id="student-class-select" className="w-full h-10 px-3 text-xs bg-background border-border font-medium">
                  <SelectValue placeholder="-- Pilih Kelas Siswa --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XI-A">Kelas XI-A</SelectItem>
                  <SelectItem value="XI-B">Kelas XI-B</SelectItem>
                  <SelectItem value="XI-C">Kelas XI-C</SelectItem>
                  <SelectItem value="XI-D">Kelas XI-D</SelectItem>
                  <SelectItem value="XI-E">Kelas XI-E</SelectItem>
                  <SelectItem value="XI-F">Kelas XI-F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Nama Lengkap Siswa (Dropdown/Combobox yang hanya memunculkan siswa di kelas terpilih) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="student-name-combobox" className="text-xs font-semibold text-foreground">
                  2. Nama Lengkap Siswa
                </Label>
                {studentClass && (
                  <span className="text-[10px] text-muted-foreground">
                    {classStudents.length} siswa terdaftar di {studentClass}
                  </span>
                )}
              </div>

              <Popover open={openStudentCombobox} onOpenChange={setOpenStudentCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    id="student-name-combobox"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudentCombobox}
                    disabled={!studentClass}
                    className="w-full justify-between h-10 px-3 text-xs font-normal bg-background border-border hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <User className="w-4 h-4 shrink-0 text-muted-foreground opacity-70" />
                      <span className={cn("truncate", studentName ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {studentName || (!studentClass ? "Pilih kelas terlebih dahulu..." : `-- Pilih atau cari nama di ${studentClass} --`)}
                      </span>
                    </div>
                    <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder={`Cari nama siswa di ${studentClass}...`} 
                      className="h-9 text-xs" 
                    />
                    <CommandList className="max-h-[220px] overflow-y-auto">
                      <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                        Nama tidak ditemukan di kelas {studentClass}.
                      </CommandEmpty>
                      <CommandGroup>
                        {classStudents.map((student) => {
                          const isSelected = (studentName || "").toLowerCase().trim() === student.name.toLowerCase().trim()
                          return (
                            <CommandItem
                              key={student.id || student.nisn || student.name}
                              value={student.name}
                              onSelect={() => {
                                setStudentName(student.name)
                                setOpenStudentCombobox(false)
                                setErrorMsg("")
                              }}
                              className={cn(
                                "text-xs cursor-pointer py-2 px-3 flex items-center justify-between rounded-md transition-colors",
                                isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="truncate">{student.name}</span>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-3.5 w-3.5 text-primary shrink-0",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 3. Input NISN Siswa */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-nisn-input" className="text-xs font-semibold text-foreground">
                3. Nomor Induk Siswa Nasional (NISN)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="student-nisn-input"
                  type="text"
                  autoComplete="off"
                  placeholder="Masukkan 10 digit NISN Anda..."
                  disabled={!studentClass}
                  value={studentNisn}
                  onChange={(e) => {
                    setStudentNisn(e.target.value)
                    setErrorMsg("")
                  }}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                Pastikan nama lengkap dan NISN sesuai dengan data sekolah di kelas yang dipilih.
              </p>
            </div>

          </div>
        )}

        {/* ====================================================================
            ROLE: GURU (WALI KELAS XI-A s/d XI-F)
            ==================================================================== */}
        {selectedRole === "TEACHER" && (
          <div className="flex flex-col gap-3.5 bg-card p-3.5 rounded-xl border border-border shadow-xs">
            
            {/* Quick Selector Wali Kelas */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Pilih Wali Kelas
              </Label>
              <Select
                value={teacherName}
                onValueChange={(val) => {
                  const selected = defaultTeachers.find(t => t.name === val)
                  if (selected) {
                    handleSelectTeacher(selected)
                  } else {
                    setTeacherName("")
                    setTeacherNip("")
                    setTeacherAssignedClass("")
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 px-3 text-xs bg-background border-border font-medium">
                  <SelectValue placeholder="-- Pilih Guru / Wali Kelas (XI-A s/d XI-F) --" />
                </SelectTrigger>
                <SelectContent>
                  {defaultTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.assignedClass} • {t.name} (NIP: {t.nip})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nama Guru Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="teacher-name-input" className="text-xs font-semibold text-foreground">
                Nama Lengkap Guru
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="teacher-name-input"
                  type="text"
                  placeholder="Nama Lengkap Guru"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* NIP Guru Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="teacher-nip-input" className="text-xs font-semibold text-foreground">
                Nomor Induk Pegawai (NIP)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="teacher-nip-input"
                  type="text"
                  placeholder="Nomor Induk Pegawai (NIP)"
                  value={teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary font-mono"
                />
              </div>
            </div>

            {teacherAssignedClass && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px]">Wali Kelas Terdaftar: <strong>{teacherAssignedClass}</strong></span>
              </div>
            )}

          </div>
        )}

        {/* ====================================================================
            ROLE: GURU BK / STAF TU
            ==================================================================== */}
        {selectedRole === "ADMIN" && (
          <div className="flex flex-col gap-3.5 bg-card p-3.5 rounded-xl border border-border shadow-xs">
            
            {/* Quick Selector Petugas */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Pilih Akun Petugas
              </Label>
              <Select
                value={adminName}
                onValueChange={(val) => {
                  const selected = defaultAdmins.find(a => a.name === val)
                  if (selected) {
                    handleSelectAdmin(selected)
                  } else {
                    setAdminName("")
                    setAdminNip("")
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 px-3 text-xs bg-background border-border font-medium">
                  <SelectValue placeholder="-- Pilih Petugas BK / TU --" />
                </SelectTrigger>
                <SelectContent>
                  {defaultAdmins.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name} ({a.roleLabel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nama Petugas Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-name-input" className="text-xs font-semibold text-foreground">
                Nama Petugas BK / TU
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="admin-name-input"
                  type="text"
                  placeholder="Nama Lengkap Petugas"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* NIP Petugas Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-nip-input" className="text-xs font-semibold text-foreground">
                Nomor Induk Pegawai (NIP)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="admin-nip-input"
                  type="text"
                  placeholder="NIP Petugas BK / TU"
                  value={adminNip}
                  onChange={(e) => setAdminNip(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary font-mono"
                />
              </div>
            </div>

          </div>
        )}

        {/* Primary Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-[0.98] mt-1"
        >
          <span>Masuk ke Portal {activeRole?.label}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Registration Link */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          Belum terdaftar di database?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-primary hover:underline transition-colors ml-1"
          >
            Registrasi Siswa Baru
          </button>
        </div>

      </form>

      {/* Login Information Alert Dialog */}
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
              Sistem Autentikasi Tanpa Password
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-zinc-400 space-y-2">
              <p>
                Sistem ini tidak menggunakan password untuk memudahkan siswa dan guru:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Siswa</strong>: Pilih <em>Kelas</em>, lalu masukkan <em>Nama Lengkap</em> & <em>NISN</em> Anda.</li>
                <li><strong>Guru (Wali Kelas)</strong>: Masuk menggunakan <em>Nama Lengkap</em> & <em>NIP</em>.</li>
                <li><strong>Guru BK / TU</strong>: Masuk menggunakan <em>Nama Petugas</em> & <em>NIP</em>.</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="h-9 px-4 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowInfoDialog(false)}
            >
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
