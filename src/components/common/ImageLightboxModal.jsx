import React from 'react';
import { Download, ImageIcon, Maximize2, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * ImageLightboxModal - Unified modal for previewing uploaded documents/images
 * @param {Object} image - { url: string, name: string, size?: string }
 * @param {Function} onClose - Callback to close the modal
 * @param {string} title - Optional title override
 */
export default function ImageLightboxModal({ image, onClose, title = 'Pratinjau Dokumen Bukti' }) {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-border bg-background">
        <DialogHeader className="p-4 border-b border-border text-left flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-zinc-50 truncate">
                {image.name || title}
              </DialogTitle>
              {image.size && (
                <p className="text-xs text-muted-foreground">{image.size} • Dokumen Lampiran</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            {image.url && (
              <a
                href={image.url}
                download={image.name || 'dokumen.jpg'}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-border bg-muted/40 hover:bg-muted text-slate-800 dark:text-zinc-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </a>
            )}
          </div>
        </DialogHeader>

        <div 
          className="p-4 sm:p-6 flex items-center justify-center bg-slate-950/95 min-h-[300px] max-h-[75vh] overflow-auto"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        >
          <img
            src={image.url}
            alt={image.name || 'Dokumen'}
            className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
          />
        </div>

        <div className="p-3 border-t border-border flex items-center justify-between bg-muted/20 text-xs text-muted-foreground">
          <span>Pratinjau berkas dokumen sah</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-medium rounded-lg"
          >
            Tutup Pratinjau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
