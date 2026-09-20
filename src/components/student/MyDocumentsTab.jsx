import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export default function MyDocumentsTab({
  documents,
  onDownloadDoc
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Arsip Dokumen Saya
        </h1>
        <p className="text-sm font-normal text-slate-600 dark:text-zinc-400 mt-1">
          Unduh surat izin resmi bertanda tangan digital yang telah disahkan Tata Usaha (TU).
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-border rounded-xl">
          <Download className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Belum ada dokumen resmi terbit.</p>
          <p className="text-xs font-normal text-slate-500 dark:text-zinc-400 mt-1">Dokumen hasil pengajuan yang disetujui TU akan tersimpan di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{doc.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Kategori: {doc.category} • {doc.fileSize}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Diterbitkan: {doc.uploadedAt}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadDoc(doc)}
                className="gap-1.5 h-8 text-xs font-medium shrink-0 rounded-lg border-border hover:bg-blue-50 hover:text-blue-700 w-full sm:w-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Dokumen</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
