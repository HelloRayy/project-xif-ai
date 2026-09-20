import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';

export default function LoginView({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background font-sans">
      
      {/* Left Column: Auth Forms (Single Page Experience) */}
      <div className="flex flex-col gap-4 p-6 md:p-10 justify-between">
        
        {/* Brand Logo Header */}
        <div className="flex justify-center gap-2 md:justify-start">
          <button 
            type="button" 
            onClick={() => setAuthMode('login')}
            className="flex items-center gap-2 font-bold text-base tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <GraduationCap className="size-4" />
            </div>
            <span>SchoolAdmin</span>
          </button>
        </div>

        {/* Dynamic Center Form */}
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm">
            {authMode === 'login' ? (
              <LoginForm 
                onLoginSuccess={onLoginSuccess} 
                onSwitchToRegister={() => setAuthMode('register')} 
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={() => setAuthMode('login')} 
                onRegisterSuccess={() => {
                  // Can either stay on success card or redirect
                }} 
              />
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center md:text-left text-xs text-muted-foreground">
          © 2026 SchoolAdmin Digitalization System. All rights reserved.
        </div>
      </div>

      {/* Right Column: School Banner Image (SMA Negeri 6 Semarang) */}
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <img
          src="/school-banner.jpg"
          alt="SMA Negeri 6 Semarang"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Editorial vignette gradient for enterprise aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-10 text-white">
          <div className="max-w-md">
            <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              SMA Negeri 6 Semarang
            </h3>
            <p className="text-xs text-white/90 mt-1.5 leading-relaxed drop-shadow-sm">
              Sistem Digitalisasi Tata Kelola Administrasi & Layanan Surat Sekolah Terpadu
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
