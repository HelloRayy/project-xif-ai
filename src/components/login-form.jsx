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

  // Siswa Form State - clean empty default
  const [studentName, setStudentName] = useState("")
  const [studentNisn, setStudentNisn] = useState("")
  const [detectedClass, setDetectedClass] = useState("")
  const [isNameFocused, setIsNameFocused] = useState(false)
  const [selectedStudentObj, setSelectedStudentObj] = useState(null)

  // Guru Form State - clean empty default
  const [teacherName, setTeacherName] = useState("")
  const [teacherNip, setTeacherNip] = useState("")
  const [teacherAssignedClass, setTeacherAssignedClass] = useState("")

  // BK / TU Form State - clean empty default
  const [adminName, setAdminName] = useState("")
  const [adminNip, setAdminNip] = useState("")

  const studentSearchRef = useRef(null)

  // All student options (216 students across XI-A s/d XI-F)
  const allStudents = useMemo(() => initialStudents || [], [])

  // Filtered student suggestions based on user keystrokes
  const filteredStudentSuggestions = useMemo(() => {
    const q = studentName.toLowerCase().trim()
    if (!q) return []
    return allStudents.filter(s => {
      const matchName = s.name.toLowerCase().includes(q)
      const matchNisn = (s.nisn || "").includes(q)
      return matchName || matchNisn
    }).slice(0, 8)
  }, [studentName, allStudents])

  // Select a student from the autocomplete dropdown
  const handleSelectStudent = (st) => {
    setStudentName(st.name)
    setStudentNisn(st.nisn)
    setDetectedClass(st.class)
    setSelectedStudentObj(st)
    setIsNameFocused(false)
    setErrorMsg("")
  }

  // Handle typing inside the student name input field
  const handleStudentNameInput = (val) => {
    setStudentName(val)
    setErrorMsg("")
    
    // Check for exact matching
    const exactMatch = allStudents.find(
      s => s.name.toLowerCase().trim() === val.toLowerCase().trim()
    )
    if (exactMatch) {
      setStudentNisn(exactMatch.nisn)
      setDetectedClass(exactMatch.class)
      setSelectedStudentObj(exactMatch)
    } else {
      setDetectedClass("")
      setSelectedStudentObj(null)
    }
  }

  // Clear student form inputs
  const handleClearStudent = () => {
    setStudentName("")
    setStudentNisn("")
    setDetectedClass("")
    setSelectedStudentObj(null)
    setErrorMsg("")
  }

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
      const cleanName = studentName.toLowerCase().trim()
      const cleanNisn = studentNisn.replace(/[^0-9]/g, "").trim()

      if (!cleanName && !cleanNisn) {
        setErrorMsg("Mohon masukkan Nama Lengkap atau NISN siswa.")
        return
      }

      // Find in storage or initialData
      foundUser = users.find(u => {
        if (u.role !== "STUDENT") return false
        const uName = (u.name || "").toLowerCase().trim()
        const uNisn = (u.nisn || "").replace(/[^0-9]/g, "")
        const uNis = (u.nis || "").replace(/[^0-9]/g, "")

        const nameMatches = cleanName && (uName === cleanName || uName.includes(cleanName) || cleanName.includes(uName))
        const nisnMatches = cleanNisn && (uNisn === cleanNisn || uNis === cleanNisn)

        if (cleanName && cleanNisn) {
          return nameMatches && (nisnMatches || !uNisn)
        }
        return nameMatches || nisnMatches
      })

      // Fallback: search in initialStudents and build full student user object
      if (!foundUser) {
        const matchStudent = allStudents.find(s => {
          const sName = s.name.toLowerCase().trim()
          const sNisn = (s.nisn || "").replace(/[^0-9]/g, "")
          return (cleanName && (sName === cleanName || sName.includes(cleanName))) || (cleanNisn && sNisn === cleanNisn)
        })
        if (matchStudent) {
          foundUser = {
            id: matchStudent.id,
            username: matchStudent.username,
            name: matchStudent.name,
            role: "STUDENT",
            roleLabel: `Siswa Kelas ${matchStudent.class}`,
            nis: matchStudent.nis,
            nisn: matchStudent.nisn,
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
        setErrorMsg("Data siswa tidak ditemukan. Ketik nama untuk melihat saran nama siswa atau periksa kembali NISN.")
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
            ROLE: SISWA (NAMA LENGKAP DENGAN NATURAL AUTOCOMPLETE + NISN)
            ==================================================================== */}
        {selectedRole === "STUDENT" && (
          <div className="flex flex-col gap-3.5 bg-card p-3.5 rounded-xl border border-border shadow-xs">
            
            {/* Input Nama Lengkap Siswa dengan Direct Dropdown Suggestion */}
            <div className="flex flex-col gap-1.5 relative" ref={studentSearchRef}>
              <div className="flex items-center justify-between">
                <Label htmlFor="student-name-input" className="text-xs font-semibold text-foreground">
                  Nama Lengkap Siswa
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  Cakup Kelas XI-A s/d XI-F
                </span>
              </div>

              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="student-name-input"
                  type="text"
                  autoComplete="off"
                  placeholder="Ketik nama lengkap siswa..."
                  value={studentName}
                  onFocus={() => setIsNameFocused(true)}
                  onChange={(e) => handleStudentNameInput(e.target.value)}
                  className="pl-9 pr-8 h-10 text-xs shadow-xs focus-visible:ring-primary"
                />
                {studentName ? (
                  <button
                    type="button"
                    onClick={handleClearStudent}
                    className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 pointer-events-none opacity-40" />
                )}
              </div>

              {/* Seamless Autocomplete Dropdown */}
              {isNameFocused && filteredStudentSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="p-1 text-[10px] font-semibold text-muted-foreground bg-muted/30 border-b border-border px-3 py-1.5">
                    Pilih Nama Siswa:
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-border/40">
                    {filteredStudentSuggestions.map((st) => (
                      <div
                        key={st.id}
                        onMouseDown={() => handleSelectStudent(st)}
                        className="flex items-center justify-between px-3 py-2 text-xs hover:bg-muted/80 cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col pr-2">
                          <span className="font-medium text-foreground">{st.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">NISN: {st.nisn}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                          {st.class}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input NISN Siswa */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-nisn-input" className="text-xs font-semibold text-foreground">
                Nomor Induk Siswa Nasional (NISN)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="student-nisn-input"
                  type="text"
                  placeholder="10 Digit NISN (terisi otomatis saat nama dipilih)"
                  value={studentNisn}
                  onChange={(e) => {
                    setStudentNisn(e.target.value)
                    setErrorMsg("")
                  }}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary font-mono"
                />
              </div>
            </div>

            {/* Status Deteksi Otomatis Kelas */}
            {detectedClass ? (
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="text-[11px] leading-snug">
                  Siswa terdaftar di <strong>Kelas {detectedClass}</strong>. Langsung terhubung ke portal kelas.
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic px-1">
                Ketik nama lengkap siswa di atas untuk mengisi NISN dan kelas secara otomatis.
              </p>
            )}

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
              <select
                value={teacherName}
                onChange={(e) => {
                  const selected = defaultTeachers.find(t => t.name === e.target.value)
                  if (selected) {
                    handleSelectTeacher(selected)
                  } else {
                    setTeacherName("")
                    setTeacherNip("")
                    setTeacherAssignedClass("")
                  }
                }}
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">-- Pilih Guru / Wali Kelas (XI-A s/d XI-F) --</option>
                {defaultTeachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.assignedClass} • {t.name} (NIP: {t.nip})
                  </option>
                ))}
              </select>
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
              <select
                value={adminName}
                onChange={(e) => {
                  const selected = defaultAdmins.find(a => a.name === e.target.value)
                  if (selected) {
                    handleSelectAdmin(selected)
                  } else {
                    setAdminName("")
                    setAdminNip("")
                  }
                }}
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">-- Pilih Petugas BK / TU --</option>
                {defaultAdmins.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.roleLabel})
                  </option>
                ))}
              </select>
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
                <li><strong>Siswa</strong>: Masuk menggunakan <em>Nama Lengkap</em> & <em>NISN</em>. Kelas akan otomatis terdeteksi.</li>
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
