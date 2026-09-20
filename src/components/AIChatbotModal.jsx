import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  FileText, 
  ArrowRight, 
  X, 
  Clock, 
  Search, 
  HeartPulse, 
  Trophy, 
  Building2, 
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { getAIResponse, KNOWLEDGE_BASE } from '../services/aiKnowledgeBase';
import { cn } from '../lib/utils';

// Helper to render markdown bold (**text**), lists, and clean linebreaks
function renderFormattedText(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, lIdx) => {
    const parts = line.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    
    return (
      <React.Fragment key={lIdx}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-slate-900 dark:text-zinc-100">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[11px] text-blue-700 dark:text-blue-300">
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// Interactive Quick Prompt Chips
const QUICK_PROMPTS = [
  { label: 'Status Pengajuanku', icon: Search, query: 'bagaimana status pengajuanku?' },
  { label: 'Izin Sakit', icon: HeartPulse, query: 'bagaimana syarat dan alur izin sakit?' },
  { label: 'Surat Keterangan', icon: FileText, query: 'syarat surat keterangan aktif sekolah' },
  { label: 'Dispensasi Lomba', icon: Trophy, query: 'prosedur pengajuan dispensasi kegiatan' },
  { label: 'Jam Buka TU', icon: Building2, query: 'jam operasional dan lokasi ruang TU' },
  { label: 'Format Upload', icon: Paperclip, query: 'ketentuan format dan ukuran upload berkas' },
];

export default function AIChatbotModal({ isOpen, onClose, onOpen, onNavigateTab, currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Halo ${currentUser?.name ? `**${currentUser.name}**` : ''}! Saya **Asisten AI Administrasi SchoolAdmin**. 👋\n\nSaya dapat membantu mengecek status pengajuan aktif Anda atau memberikan panduan prosedur resmi sekolah.\n\nSilakan ketik pertanyaan Anda atau pilih topik cepat di bawah:`,
      actionSuggest: null,
      actionPayload: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contactInfoDialog, setContactInfoDialog] = useState({ open: false, title: '', message: '' });
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Realistic typing delay for authentic AI feel
    setTimeout(() => {
      const response = getAIResponse(text, currentUser);
      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        title: response.title,
        text: response.text,
        actionSuggest: response.actionSuggest,
        actionPayload: response.actionPayload,
        shouldEscalate: response.shouldEscalate,
        escalationOptions: response.escalationOptions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  // Render Sleek Floating Action Button (FAB) when closed
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 h-12 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center gap-2.5 font-medium text-xs border border-blue-500/40 group cursor-pointer"
        title="Tanyakan Prosedur ke Asisten AI"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-xs tracking-tight">Tanya AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-3rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      
      {/* 1. Header (Clean & Modern Card Style) */}
      <div className="px-4 py-3.5 bg-card border-b border-border flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-50">
                Asisten AI Administrasi
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Online • Terhubung Basis Data Sekolah</span>
            </p>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 rounded-lg"
          title="Tutup Asisten AI"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 2. Messages List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2.5", msg.sender === 'user' ? "justify-end" : "justify-start")}
          >
            {/* Bot Avatar */}
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            {/* Bubble Box */}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs space-y-2",
                msg.sender === 'user'
                  ? "bg-blue-600 text-white rounded-tr-xs"
                  : "bg-card text-slate-800 dark:text-zinc-200 border border-border rounded-tl-xs"
              )}
            >
              {/* Optional Bot Message Title */}
              {msg.title && (
                <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 pb-2 border-b border-border">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{msg.title}</span>
                </div>
              )}

              {/* Message Content */}
              <div className={cn("leading-relaxed font-normal", msg.sender === 'user' ? "text-white" : "text-slate-700 dark:text-zinc-300")}>
                {renderFormattedText(msg.text)}
              </div>

              {/* Action Suggestion CTA Button */}
              {msg.actionSuggest && (
                <div className="pt-2 border-t border-border mt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const targetTab = msg.actionPayload?.tab || (msg.actionSuggest === 'LIHAT_RIWAYAT_PENGAJUAN' ? 'MY_REQUESTS' : 'NEW_REQUEST');
                      onClose();
                      onNavigateTab(targetTab, msg.actionPayload);
                    }}
                    className="w-full h-8 justify-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                  >
                    <span>
                      {msg.actionSuggest === 'LIHAT_RIWAYAT_PENGAJUAN' && 'Lihat di Riwayat Pengajuan'}
                      {msg.actionSuggest === 'BUAT_PENGAJUAN_IZIN' && 'Isi Formulir Izin Sakit'}
                      {msg.actionSuggest === 'BUAT_PENGAJUAN_SURAT' && 'Isi Form Surat Keterangan'}
                      {msg.actionSuggest === 'BUAT_PENGAJUAN_DISPENSASI' && 'Isi Form Dispensasi'}
                      {(!['LIHAT_RIWAYAT_PENGAJUAN', 'BUAT_PENGAJUAN_IZIN', 'BUAT_PENGAJUAN_SURAT', 'BUAT_PENGAJUAN_DISPENSASI'].includes(msg.actionSuggest)) && 'Buka Form Pengajuan'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Escalation Options if Unsure */}
              {msg.shouldEscalate && msg.escalationOptions && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-border">
                  {msg.escalationOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-muted/50 rounded-lg border border-border flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-zinc-100 text-[11px]">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">{opt.note}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContactInfoDialog({
                          open: true,
                          title: `Kontak ${opt.label}`,
                          message: `Silakan hubungi ${opt.label} melalui saluran resmi sekolah atau kunjungi langsung ruang Tata Usaha pada jam operasional.`
                        })}
                        className="h-6 px-2 text-[10px] font-medium rounded-md"
                      >
                        Hubungi
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <span
                className={cn(
                  "text-[9px] block text-right pt-0.5",
                  msg.sender === 'user' ? "text-blue-100" : "text-muted-foreground"
                )}
              >
                {msg.timestamp}
              </span>
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 border border-border">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-1 px-1">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] italic">AI sedang memeriksa basis data resmi...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Interactive Quick Suggestion Prompts Bar */}
      <div className="px-3 py-2 bg-muted/40 border-t border-border overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
        <span className="text-[10px] font-semibold text-slate-500 shrink-0 uppercase tracking-wider pl-1">
          Topik Cepat:
        </span>
        {QUICK_PROMPTS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item.query)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-300 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg font-medium shrink-0 transition-colors text-[11px] shadow-2xs"
            >
              <IconComponent className="w-3 h-3 text-blue-600" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Input Footer */}
      <div className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tanyakan syarat izin, status surat, alur TU..."
          className="flex-1 h-9 text-xs bg-background border-slate-300 dark:border-zinc-700 rounded-lg"
        />
        <Button
          variant="default"
          size="icon"
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shrink-0 shadow-xs"
          title="Kirim Pertanyaan"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Escalation Contact Info Alert Dialog */}
      <AlertDialog open={contactInfoDialog.open} onOpenChange={(open) => setContactInfoDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
              {contactInfoDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-zinc-400">
              {contactInfoDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="h-9 px-4 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setContactInfoDialog(prev => ({ ...prev, open: false }))}
            >
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
