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
    label: "Staf Tata Usaha (TU) / Admin",
    icon: Building2,
    demoUser: "admin.tu"
  },
]

const AVAILABLE_CLASSES = ["X-IPA 1", "X-IPA 2", "XI-IPS 1", "XI-IPS 2", "XII-IPA 1"]

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
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedClass, setSelectedClass] = useState("X-IPA 1")
  
  const [errorMsg, setErrorMsg] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRegister = (e) => {
    e.preventDefault()
    setErrorMsg("")

    if (!name.trim() || !username.trim() || !password) {
      setErrorMsg("Mohon lengkapi seluruh formulir yang wajib diisi.")
      return
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus 6 karakter.")
      return
    }

    const users = getUsers()
    const isExisting = users.some(
      u => u.username.toLowerCase() === username.toLowerCase().trim()
    )

    if (isExisting) {
      setErrorMsg(`Username "${username}" sudah terdaftar. Silakan gunakan username lain.`)
      return
    }

    const newUser = {
      id: `usr-${selectedRole.toLowerCase()}-${Date.now()}`,
      username: username.toLowerCase().trim(),
      password: password,
      name: name.trim(),
      role: selectedRole,
      roleLabel: selectedRole === 'ADMIN' 
        ? 'Staf TU / Admin Utama' 
        : selectedRole === 'TEACHER' 
          ? `Wali Kelas ${selectedClass}` 
          : `Siswa Kelas ${selectedClass}`,
      assignedClass: selectedRole === 'TEACHER' ? selectedClass : undefined,
      class: selectedRole === 'STUDENT' ? selectedClass : undefined,
      email: `${username.toLowerCase().trim()}@schooladmin.sch.id`
    }

    saveUser(newUser)
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
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Registrasi Berhasil!
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Akun Anda dengan username <strong className="text-foreground">{username}</strong> sebagai <strong className="text-foreground">{activeRole?.label}</strong> telah aktif dan siap digunakan.
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

        {/* Role Selector Combobox - Identical to LoginForm */}
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

        {/* Full Name */}
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

        {/* Username & Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reg-username" className="text-xs font-semibold text-foreground">
              Username
            </Label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-50" />
              <Input
                id="reg-username"
                type="text"
                placeholder="Contoh: rizky123"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Password */}
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

        </div>

        {/* Dynamic Class Combobox based on Role */}
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
