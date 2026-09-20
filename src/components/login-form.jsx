import React, { useState, useMemo } from "react"
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
  CommandInput,
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
  IdCard
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

  // Siswa State
  const [openStudentSearch, setOpenStudentSearch] = useState(false)
  const [studentName, setStudentName] = useState("Aditiya Lukmanul Hakim")
  const [studentNisn, setStudentNisn] = useState("0081101001")
  const [detectedClass, setDetectedClass] = useState("XI-A")

  // Guru State
  const [teacherName, setTeacherName] = useState("Ahmad Dahlan, S.Pd.")
  const [teacherNip, setTeacherNip] = useState("19790812 200501 1 004")

  // BK / TU State
  const [adminName, setAdminName] = useState("Hj. Ratna Sari, S.E.")
  const [adminNip, setAdminNip] = useState("19750618 200112 2 003")

  // All student options
  const allStudents = useMemo(() => initialStudents || [], [])

  const handleSelectStudent = (st) => {
    setStudentName(st.name)
    setStudentNisn(st.nisn)
    setDetectedClass(st.class)
    setOpenStudentSearch(false)
    setErrorMsg("")
  }

  const handleStudentNameChange = (val) => {
    setStudentName(val)
    const match = allStudents.find(
      s => s.name.toLowerCase().trim() === val.toLowerCase().trim()
    )
    if (match) {
      setStudentNisn(match.nisn)
      setDetectedClass(match.class)
    } else {
      setDetectedClass("")
    }
  }

  const handleSelectTeacherPreset = (t) => {
    setTeacherName(t.name)
    setTeacherNip(t.nip || "")
    setErrorMsg("")
  }

  const handleSelectAdminPreset = (a) => {
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

      // Find by exact/partial match
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

      // Fallback: search in initialStudents and build user
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
        setErrorMsg("Data siswa tidak ditemukan. Pilih nama dari saran atau periksa ejaan NISN.")
      } else {
        setErrorMsg("Identitas Nama atau NIP tidak ditemukan pada database sekolah.")
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
          Portal Administrasi Siswa
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Autentikasi resmi tanpa password • Identitas Nama & NISN / NIP
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
                className="w-full justify-between h-10 px-3 text-xs font-medium bg-background border-primary/40 ring-1 ring-primary/10 hover:bg-muted/40"
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
            ROLE: SISWA (NAMA LENGKAP + NISN, OTOMATIS MASUK KELAS)
            ==================================================================== */}
        {selectedRole === "STUDENT" && (
          <div className="flex flex-col gap-3.5 bg-muted/20 p-3.5 rounded-xl border border-border">
            
            {/* Nama Siswa dengan Autocomplete Search Popover */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="student-name" className="text-xs font-semibold text-foreground">
                  Nama Lengkap Siswa
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  Total 216 Siswa (XI-A s/d XI-F)
                </span>
              </div>

              <Popover open={openStudentSearch} onOpenChange={setOpenStudentSearch}>
                <PopoverTrigger asChild>
                  <div className="relative flex items-center cursor-pointer">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                    <Input
                      id="student-name"
                      type="text"
                      placeholder="Ketik atau cari nama siswa..."
                      value={studentName}
                      onChange={(e) => handleStudentNameChange(e.target.value)}
                      className="pl-9 pr-8 h-10 text-xs shadow-xs focus-visible:ring-primary"
                    />
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 pointer-events-none opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari dari 216 nama siswa..." className="h-9 text-xs" />
                    <CommandList className="max-h-56">
                      <CommandEmpty className="text-xs py-3 text-center text-muted-foreground">
                        Siswa tidak ditemukan.
                      </CommandEmpty>
                      <CommandGroup heading="Daftar Siswa Sekolah">
                        {allStudents.slice(0, 40).map((st) => (
                          <CommandItem
                            key={st.id}
                            value={`${st.name} ${st.class} ${st.nisn}`}
                            onSelect={() => handleSelectStudent(st)}
                            className="text-xs py-2 px-3 flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{st.name}</span>
                              <span className="text-[10px] text-muted-foreground">NISN: {st.nisn}</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {st.class}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* NISN Siswa (Auto-filled or manual) */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student-nisn" className="text-xs font-semibold text-foreground">
                Nomor Induk Siswa Nasional (NISN)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="student-nisn"
                  type="text"
                  placeholder="Contoh: 0081101001 (10 Digit)"
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary font-mono"
                />
              </div>
            </div>

            {/* Auto-detected Class Notification Banner */}
            {detectedClass && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="text-[11px] leading-tight">
                  Siswa terdaftar di <strong>Kelas {detectedClass}</strong>. Langsung terhubung ke dashboard kelas tanpa pilih manual.
                </div>
              </div>
            )}

            {/* Quick Demo Student Pills */}
            <div className="pt-1">
              <span className="text-[10px] font-medium text-muted-foreground block mb-1.5">
                Cepat Pilih Contoh Siswa Demo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "Aditiya Lukmanul Hakim", nisn: "0081101001", class: "XI-A" },
                  { name: "Afifah Nurul Hikmah", nisn: "0081102001", class: "XI-B" },
                  { name: "Adyttia Churniawan", nisn: "0081103001", class: "XI-C" },
                  { name: "Aaliya Syahquita Putri", nisn: "0081104001", class: "XI-D" }
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setStudentName(sample.name)
                      setStudentNisn(sample.nisn)
                      setDetectedClass(sample.class)
                      setErrorMsg("")
                    }}
                    className="text-[10px] px-2 py-1 rounded-md bg-background border border-border hover:border-primary text-slate-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    {sample.class}: {sample.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ====================================================================
            ROLE: GURU (WALI KELAS / GURU: NAMA & NIP)
            ==================================================================== */}
        {selectedRole === "TEACHER" && (
          <div className="flex flex-col gap-3.5 bg-muted/20 p-3.5 rounded-xl border border-border">
            
            {/* Quick Preset Selector for Teachers */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Pilih Wali Kelas (XI-A s/d XI-F)
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {defaultTeachers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTeacherPreset(t)}
                    className={cn(
                      "text-left p-2 rounded-lg border text-xs transition-colors",
                      teacherName === t.name 
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-background border-border hover:bg-muted text-slate-700 dark:text-zinc-300"
                    )}
                  >
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.roleLabel}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Guru Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="teacher-name" className="text-xs font-semibold text-foreground">
                Nama Lengkap Guru
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="teacher-name"
                  type="text"
                  placeholder="Contoh: Ahmad Dahlan, S.Pd."
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* NIP Guru Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="teacher-nip" className="text-xs font-semibold text-foreground">
                Nomor Induk Pegawai (NIP)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="teacher-nip"
                  type="text"
                  placeholder="Contoh: 19790812 200501 1 004"
                  value={teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary font-mono"
                />
              </div>
            </div>

          </div>
        )}

        {/* ====================================================================
            ROLE: GURU BK / STAF TU (NAMA & NIP)
            ==================================================================== */}
        {selectedRole === "ADMIN" && (
          <div className="flex flex-col gap-3.5 bg-muted/20 p-3.5 rounded-xl border border-border">
            
            {/* Quick Preset Selector for Admin */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Petugas Bimbingan Konseling (BK) & TU
              </Label>
              <div className="flex flex-col gap-1.5">
                {defaultAdmins.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectAdminPreset(a)}
                    className={cn(
                      "text-left p-2.5 rounded-lg border text-xs transition-colors",
                      adminName === a.name 
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-background border-border hover:bg-muted text-slate-700 dark:text-zinc-300"
                    )}
                  >
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.roleLabel} • NIP: {a.nip}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Petugas Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-name" className="text-xs font-semibold text-foreground">
                Nama Petugas BK / TU
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="Contoh: Hj. Ratna Sari, S.E."
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* NIP Petugas Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-nip" className="text-xs font-semibold text-foreground">
                Nomor Induk Pegawai (NIP)
              </Label>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-60" />
                <Input
                  id="admin-nip"
                  type="text"
                  placeholder="Contoh: 19750618 200112 2 003"
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
