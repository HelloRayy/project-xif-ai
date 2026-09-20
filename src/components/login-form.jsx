import React, { useState } from "react"
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
  Check
} from "lucide-react"
import { getUsers, setCurrentUser } from "@/services/storage"
import { allInitialUsers } from "@/data/initialData"

const ROLES = [
  {
    value: "STUDENT",
    label: "Siswa (Murid)",
    icon: GraduationCap,
    demoUser: "siswa.aditiya.lukmanul",
    demoPassword: "user123"
  },
  {
    value: "TEACHER",
    label: "Wali Kelas / Guru",
    icon: UserCheck,
    demoUser: "guru.ahmad",
    demoPassword: "password123"
  },
  {
    value: "ADMIN",
    label: "Staf Tata Usaha (TU) / Admin",
    icon: Building2,
    demoUser: "admin.tu",
    demoPassword: "password123"
  },
]

export function LoginForm({
  className,
  onLoginSuccess,
  onSwitchToRegister,
  ...props
}) {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [showForgotDialog, setShowForgotDialog] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setErrorMsg("")

    if (!selectedRole) {
      setErrorMsg("Mohon pilih peran akun terlebih dahulu.")
      return
    }

    const storedUsers = getUsers()
    const users = (storedUsers && storedUsers.length > 0) ? storedUsers : allInitialUsers
    const inputClean = username.toLowerCase().trim()
    const passwordClean = password.trim()

    const foundUser = users.find(u => {
      if (u.role !== selectedRole) return false;

      const matchIdentifier = (
        u.username?.toLowerCase() === inputClean ||
        u.username?.toLowerCase() === `guru.${inputClean}` ||
        u.username?.toLowerCase() === `siswa.${inputClean}` ||
        u.username?.toLowerCase() === `admin.${inputClean}` ||
        u.name?.toLowerCase() === inputClean ||
        u.nis?.toLowerCase() === inputClean ||
        u.email?.toLowerCase() === inputClean
      );

      if (!matchIdentifier) return false;

      const matchPassword = (
        u.password === passwordClean ||
        (u.role === 'STUDENT' && passwordClean === 'user123') ||
        ((u.role === 'TEACHER' || u.role === 'ADMIN') && passwordClean === 'password123')
      );

      return matchPassword;
    })

    if (foundUser) {
      setCurrentUser(foundUser)
      onLoginSuccess(foundUser)
    } else {
      setErrorMsg("Username, password, atau peran yang dipilih tidak sesuai.")
    }
  }

  const handleSelectRole = (currentValue) => {
    const nextRole = currentValue === selectedRole ? "" : currentValue
    setSelectedRole(nextRole)
    setOpen(false)
    setErrorMsg("")
    const r = ROLES.find(item => item.value === nextRole)
    if (r) {
      setUsername(r.demoUser)
      setPassword(r.demoPassword || "user123")
    } else {
      setUsername("")
      setPassword("")
    }
  }

  const activeRole = ROLES.find(r => r.value === selectedRole)
  const ActiveRoleIcon = activeRole ? activeRole.icon : User

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      
      {/* Header Section */}
      <div className="flex flex-col gap-1.5 text-left sm:text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {selectedRole 
            ? `Masukkan kredensial akun untuk ${activeRole?.label}` 
            : 'Pilih peran akun Anda untuk memulai proses login'}
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        
        {/* Basic Shadcn Combobox with SVG Icons */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Masuk Sebagai (Peran)
          </Label>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
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
                          onSelect={() => handleSelectRole(role.value)}
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

        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="destructive" className="p-3 text-xs">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Dynamic Fields - Appears once role is selected */}
        {selectedRole && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-foreground">
                Username
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-50" />
                <Input
                  id="username"
                  type="text"
                  placeholder={selectedRole === 'STUDENT' ? 'Username / Nama Siswa / NIS' : activeRole?.demoUser ? `Contoh: ${activeRole.demoUser}` : 'Masukkan username'}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 h-10 text-xs shadow-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none opacity-50" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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

            {/* Primary Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-[0.98] mt-1"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Dedicated Single Page Registration Link */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          Belum memiliki akun?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-primary hover:underline transition-colors ml-1"
          >
            Registrasi Akun Baru
          </button>
        </div>

      </form>

      {/* Forgot Password Information Alert Dialog */}
      <AlertDialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
              Informasi Kredensial Demo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
              Password default seluruh akun Siswa (XI-A s/d XI-F) adalah: <strong className="text-foreground font-mono">user123</strong> (dapat masuk menggunakan Username, Nama Siswa, atau NIS).
              <br /><br />
              Untuk akun Staf TU (<span className="font-mono">admin.tu</span>) dan Wali Kelas (<span className="font-mono">guru.ahmad</span>, dll): <strong className="text-foreground font-mono">password123</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="h-9 px-4 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowForgotDialog(false)}
            >
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
