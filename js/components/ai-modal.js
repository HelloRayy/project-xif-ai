import { getAIResponse, KNOWLEDGE_BASE } from '../services/ai-engine.js';

let chatMessages = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    text: 'Halo! Saya **Asisten AI Administrasi SchoolAdmin**. 👋\n\nSaya dapat membantu memberikan informasi resmi mengenai prosedur sekolah, syarat pengajuan izin tidak hadir, dispensasi kegiatan, dan jam kerja TU.\n\nSilakan ketik pertanyaan Anda atau pilih topik di bawah ini:',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export function renderAIModal(isOpen, onClose, onNavigateTab) {
  if (!isOpen) return '';

  const modalHtml = `
    <div id="ai-modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-teal-100 flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-5 h-5 text-teal-200 animate-pulse"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold flex items-center gap-2">
                Asisten AI Administrasi
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-700/80 text-teal-200 font-medium">Informasi Prosedur</span>
              </h3>
              <p class="text-[11px] text-teal-200">Berbasis Basis Pengetahuan Resmi Sekolah</p>
            </div>
          </div>
          <button id="btn-close-ai-modal" class="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Quick Topics -->
        <div class="bg-teal-50/70 border-b border-teal-100 p-2.5 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span class="text-[11px] text-slate-400 font-medium shrink-0">Topik Cepat:</span>
          ${KNOWLEDGE_BASE.map(item => `
            <button data-topic="${item.category}" class="btn-quick-topic px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-full font-medium shrink-0 transition-all text-[11px] shadow-xs">
              ${item.category}
            </button>
          `).join('')}
        </div>

        <!-- Chat Body -->
        <div id="ai-chat-body" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          ${chatMessages.map(msg => renderChatMessage(msg)).join('')}
        </div>

        <!-- Input Bar -->
        <div class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            id="ai-chat-input"
            type="text"
            placeholder="Tanyakan prosedur, syarat izin, dispensasi, jam TU..."
            class="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 placeholder-slate-400"
          />
          <button id="btn-send-ai" class="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-sm">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </div>

      </div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('btn-close-ai-modal')?.addEventListener('click', onClose);

    document.querySelectorAll('.btn-quick-topic').forEach(btn => {
      btn.addEventListener('click', () => {
        const topic = btn.getAttribute('data-topic');
        if (topic) sendUserMessage(topic, onNavigateTab, onClose);
      });
    });

    const sendBtn = document.getElementById('btn-send-ai');
    const chatInput = document.getElementById('ai-chat-input');

    const handleSend = () => {
      const text = chatInput?.value?.trim();
      if (text) {
        chatInput.value = '';
        sendUserMessage(text, onNavigateTab, onClose);
      }
    };

    sendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    scrollChatBottom();
    if (window.lucide) window.lucide.createIcons();
  }, 0);

  return modalHtml;
}

function renderChatMessage(msg) {
  if (msg.sender === 'user') {
    return `
      <div class="flex gap-3 justify-end">
        <div class="max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm bg-teal-600 text-white rounded-tr-none font-sans">
          <div class="whitespace-pre-line">${escapeHtml(msg.text)}</div>
          <span class="text-[9px] block mt-1.5 text-right text-teal-200">${msg.timestamp}</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
          <i data-lucide="user" class="w-4 h-4"></i>
        </div>
      </div>
    `;
  }

  return `
    <div class="flex gap-3 justify-start">
      <div class="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
        <i data-lucide="bot" class="w-4 h-4"></i>
      </div>
      <div class="max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm bg-white text-slate-800 border border-slate-200/80 rounded-tl-none font-sans">
        ${msg.title ? `
          <p class="font-bold text-teal-800 text-xs mb-1.5 flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-teal-600"></i> ${escapeHtml(msg.title)}
          </p>
        ` : ''}
        <div class="whitespace-pre-line leading-relaxed">${formatMarkdownText(msg.text)}</div>
        
        ${msg.actionSuggest ? `
          <div class="mt-3 pt-2.5 border-t border-slate-100">
            <button data-action-tab="${msg.actionSuggest}" class="btn-ai-action-tab w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg text-[11px] font-bold transition-all">
              <span>Buka Form Pengajuan Sekarang</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        ` : ''}

        ${msg.shouldEscalate && msg.escalationOptions ? `
          <div class="mt-3 space-y-2 pt-2.5 border-t border-slate-100">
            ${msg.escalationOptions.map(opt => `
              <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p class="font-semibold text-slate-800 text-[11px]">${opt.label}</p>
                  <p class="text-[10px] text-slate-500">${opt.note}</p>
                </div>
                <button onclick="alert('Silakan hubungi pihak sekolah melalui ruang TU atau nomor kontak resmi.')" class="px-2 py-1 bg-teal-600 text-white text-[10px] font-medium rounded hover:bg-teal-700 transition-all shrink-0">
                  Hubungi
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <span class="text-[9px] block mt-1.5 text-right text-slate-400">${msg.timestamp}</span>
      </div>
    </div>
  `;
}

function sendUserMessage(text, onNavigateTab, onClose) {
  const userMsg = {
    id: `msg-${Date.now()}`,
    sender: 'user',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  chatMessages.push(userMsg);
  updateChatUI(onNavigateTab, onClose);

  // Bot typing delay
  setTimeout(() => {
    const response = getAIResponse(text);
    const botMsg = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      title: response.title,
      text: response.text,
      actionSuggest: response.actionSuggest,
      shouldEscalate: response.shouldEscalate,
      escalationOptions: response.escalationOptions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatMessages.push(botMsg);
    updateChatUI(onNavigateTab, onClose);
  }, 500);
}

function updateChatUI(onNavigateTab, onClose) {
  const chatBody = document.getElementById('ai-chat-body');
  if (chatBody) {
    chatBody.innerHTML = chatMessages.map(msg => renderChatMessage(msg)).join('');
    
    document.querySelectorAll('.btn-ai-action-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-action-tab');
        if (tab && onNavigateTab) {
          onClose();
          onNavigateTab(tab);
        }
      });
    });

    scrollChatBottom();
    if (window.lucide) window.lucide.createIcons();
  }
}

function scrollChatBottom() {
  const chatBody = document.getElementById('ai-chat-body');
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMarkdownText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}
