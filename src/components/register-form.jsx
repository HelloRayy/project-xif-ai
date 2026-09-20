import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ChevronsUpDown, 
  GraduationCap, 
  UserCheck, 
  Building2, 
  Lock, 
  User, 
  Check, 
  School, 
  CheckCircle2 
} from "lucide-react"
import { getUsers, saveUser } from "@/services/storage"

const ROLES = [
  {
    value: "STUDENT",
    label: "Siswa (Murid)",
    icon: GraduationCap,
    demoUser: "siswa.budi"
  },
  {
    value: "TEACHER",
    label: "Wali Kelas / Guru",
    icon: UserCheck,
    demoUser: "guru.ahmad"
  },
  {
    value: "ADMIN",
    label: "Guru BK / Koordinator Konseling & TU",
    icon: Building2,
  },
]

const AVAILABLE_CLASSES = ["XI-A", "XI-B", "XI-C", "XI-D", "XI-E", "XI-F"]

export function RegisterForm({
  className,
  onSwitchToLogin,
  onRegisterSuccess,
  ...props
}) {
  const [openRoleCombobox, setOpenRoleCombobox] = useState(false)
  const [openClassCombobox, setOpenClassCombobox] = useState(false)
  const [selectedRole, setSelectedRole] = useState("STUDENT")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedClass, setSelectedClass] = useState("XI-A")
  
  const [errorMsg, setErrorMsg] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)

  const handleRegister = (e) => {
    e.preventDefault()
    setErrorMsg("")

    if (!name.trim() || !password || !confirmPassword) {
      setErrorMsg("Mohon lengkapi seluruh formulir yang wajib diisi.")
      return
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus 6 karakter.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok dengan kata sandi yang diisi.")
      return
    }

    const cleanName = name.trim()
    const generatedUsername = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "")

    const users = getUsers()
    const isExisting = users.some(
      u => u.name?.toLowerCase().trim() === cleanName.toLowerCase() && u.role === selectedRole
    )

    if (isExisting) {
      setErrorMsg(`Nama "${cleanName}" untuk peran ini sudah terdaftar. Silakan langsung login atau gunakan nama lain.`)
      return
    }

    const newUser = {
      id: `usr-${selectedRole.toLowerCase()}-${Date.now()}`,
      username: generatedUsername || `user.${Date.now()}`,
      password: password,
      name: cleanName,
      role: selectedRole,
      roleLabel: selectedRole === 'ADMIN' 
        ? 'Guru BK / Koordinator Konseling & TU' 
        : selectedRole === 'TEACHER' 
          ? `Wali Kelas ${selectedClass}` 
          : `Siswa Kelas ${selectedClass}`,
      assignedClass: selectedRole === 'TEACHER' ? selectedClass : undefined,
      class: selectedRole === 'STUDENT' ? selectedClass : undefined,
      nip: selectedRole !== 'STUDENT' ? '12345' : undefined,
      nisn: selectedRole === 'STUDENT' ? `008${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
      nis: selectedRole === 'STUDENT' ? `2026${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      status: 'Aktif'
    }

    saveUser(newUser)
    setRegisteredUser(newUser)
    setIsSuccess(true)
    
    if (onRegisterSuccess) {
      onRegisterSuccess(newUser)
    }
  }

  const activeRole = ROLES.find(r => r.value === selectedRole)
  const ActiveRoleIcon = activeRole ? activeRole.icon : User

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-200", className)} {...props}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Registrasi Berhasil!
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Akun Anda atas nama <strong className="text-foreground">{registeredUser?.name}</strong> sebagai <strong className="text-foreground">{activeRole?.label}</strong> telah aktif dan siap digunakan.
          </p>
        </div>

        <Button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full h-10 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
        >
          Masuk ke Akun Sekarang
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      
      {/* Header Section */}
      <div className="flex flex-col gap-1.5 text-left sm:text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Registrasi Akun Baru
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Lengkapi data di bawah ini untuk membuat akses portal sekolah
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        
        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="destructive" className="p-3 text-xs">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* 1. Role Selector Combobox */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Daftar Sebagai (Peran)
          </Label>

          <Popover open={openRoleCombobox} onOpenChange={setOpenRoleCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openRoleCombobox}
                className={cn(
                  "w-full justify-between h-10 px-3 text-xs font-medium bg-background transition-colors hover:bg-muted/40",
                  selectedRole && "border-primary/40 ring-1 ring-primary/10"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <ActiveRoleIcon className={cn("w-4 h-4 shrink-0 transition-colors", selectedRole ? "text-primary" : "text-muted-foreground/60")} />
                  <span className={cn("truncate", !selectedRole ? "text-muted-foreground" : "text-foreground font-semibold")}>
                    {selectedRole ? activeRole?.label : "Pilih peran akun..."}
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
                            setOpenRoleCombobox(false)
                          }}
                          className={cn(
                            "text-xs cursor-pointer py-2.5 px-3 flex items-center justify-between rounded-md group transition-colors",
                            isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <RoleIcon className={cn("w-4 h-4 shrink-0 transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            <span>
                              {role.label}
                            </span>
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

        {/* 2. Dynamic Class Combobox based on Role */}
        {selectedRole !== 'ADMIN' && (
          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <Label className="text-xs font-semibold text-foreground">
              {selectedRole === 'TEACHER' ? 'Wali Kelas Dari' : 'Kelas Siswa'}
            </Label>

            <Popover open={openClassCombobox} onOpenChange={setOpenClassCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClassCombobox}
                  className="w-full justify-between h-10 px-3 text-xs font-medium bg-background transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <School className="w-4 h-4 shrink-0 text-primary" />
                    <span className="truncate text-foreground font-semibold">
                      {selectedClass}
                    </span>
                  </div>
                  <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {AVAILABLE_CLASSES.map((cls) => {
                        const isSelected = selectedClass === cls
                        return (
                          <CommandItem
                            key={cls}
                            value={cls}
                            onSelect={() => {
                              setSelectedClass(cls)
                              setOpenClassCombobox(false)
                            }}
                            className={cn(
                              "text-xs cursor-pointer py-2 px-3 flex items-center justify-between rounded-md group transition-colors",
                              isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <School className={cn("w-4 h-4 shrink-0 transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                              <span>{cls}</span>
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
        )}

        {/* 3. Full Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-name" className="text-xs font-semibold text-foreground">
            Nama Lengkap
          </Label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-50" />
            <Input
              id="reg-name"
              type="text"
              placeholder="Contoh: Muhammad Rizky Pratama"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* 4. Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground">
            Kata Sandi
          </Label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-50" />
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 karakter"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4 opacity-70" /> : <Eye className="w-4 h-4 opacity-70" />}
            </button>
          </div>
        </div>

        {/* 5. Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-confirm-password" className="text-xs font-semibold text-foreground">
            Konfirmasi Kata Sandi
          </Label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-50" />
            <Input
              id="reg-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 pr-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 opacity-70" /> : <Eye className="w-4 h-4 opacity-70" />}
            </button>
          </div>
        </div>

        {/* Submit Register Button */}
        <Button
          type="submit"
          className="w-full h-10 gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-[0.98] mt-1"
        >
          <span>Daftarkan Akun Baru</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Back to Login Link */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          Sudah memiliki akun?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-primary hover:underline transition-colors ml-1"
          >
            Masuk Sekarang
          </button>
        </div>

      </form>

    </div>
  )
}
