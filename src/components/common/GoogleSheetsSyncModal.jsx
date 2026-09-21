import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Trash2,
  Table
} from 'lucide-react';
import { 
  fetchSheetData, 
  deleteSheetRow, 
  isSheetDbConfigured, 
  SHEETDB_API_URL 
} from '@/lib/sheetdb';
import { syncFromSheetDb } from '@/services/storage';

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1fvXarNDRFcYIEzx2uGF3wSzSF692vlTHH6QAHpq_eGs/edit?usp=sharing';

export default function GoogleSheetsSyncModal({ open, onOpenChange, onDataRefreshed }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadSpreadsheetData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await fetchSheetData();
      if (Array.isArray(data)) {
        setRows(data);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error('Failed to load SheetDB data:', err);
      setStatusMessage({ type: 'error', text: 'Gagal memuat data dari spreadsheet.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSpreadsheetData();
    }
  }, [open]);

  const handleManualSync = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      await syncFromSheetDb();
      await loadSpreadsheetData();
      if (onDataRefreshed) onDataRefreshed();
      setStatusMessage({ type: 'success', text: 'Sinkronisasi dua arah berhasil! Data aplikasi telah diselaraskan.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gagal melakukan sinkronisasi data.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!rowId) return;
    try {
      const res = await deleteSheetRow('', 'id', rowId);
      if (res && res.deleted > 0) {
        setRows(prev => prev.filter(r => r.id !== rowId));
        setStatusMessage({ type: 'success', text: `Baris ${rowId} berhasil dihapus dari Google Sheets.` });
        if (onDataRefreshed) onDataRefreshed();
      } else {
        setStatusMessage({ type: 'error', text: 'Gagal menghapus baris dari Google Sheets.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] flex flex-col p-6 gap-5">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-50">
                  Kontrol Cloud Database Google Sheets
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Kelola sinkronisasi real-time antara aplikasi dan Google Spreadsheet via SheetDB.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="gap-1.5 py-1 px-2.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Terhubung
            </Badge>
          </div>
        </DialogHeader>

        {/* Action & Info Card */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Spreadsheet Database Aktif</span>
            </div>
            <p className="text-muted-foreground text-[11px] truncate max-w-md">
              Link: <span className="font-mono text-foreground/80">{SPREADSHEET_URL}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(SPREADSHEET_URL, '_blank')}
              className="h-8 text-xs gap-1.5 border-border hover:bg-background"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka di Google
            </Button>
            <Button
              size="sm"
              onClick={handleManualSync}
              disabled={syncing || loading}
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sinkronisasi...' : 'Sinkron Sekarang'}
            </Button>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Live Data Preview Table */}
        <div className="flex-1 min-h-[220px] max-h-[360px] overflow-hidden rounded-xl border border-border flex flex-col bg-background">
          <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <Table className="w-4 h-4 text-muted-foreground" />
              <span>Daftar Baris di Google Sheet ({rows.length} baris)</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadSpreadsheetData}
              disabled={loading}
              className="h-6 px-2 text-[11px] gap-1 hover:bg-background"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Muat Ulang
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Mengambil data terbaru dari Google Sheets...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-muted-foreground text-xs">
                <FileSpreadsheet className="w-8 h-8 stroke-1 text-muted-foreground/60 mb-1" />
                <p className="font-medium text-foreground">Spreadsheet Belum Memiliki Baris Data</p>
                <p className="text-[11px] max-w-sm mt-0.5">
                  Header kolom sudah terpasang. Saat ada registrasi baru atau permohonan izin, data otomatis tercatat di sini.
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted/70 text-muted-foreground font-semibold sticky top-0 border-b border-border">
                  <tr>
                    <th className="p-2.5 pl-3">ID</th>
                    <th className="p-2.5">Nama</th>
                    <th className="p-2.5">Username</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Kelas</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right pr-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-normal">
                  {rows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 pl-3 font-mono text-[11px] text-muted-foreground">{row.id || '-'}</td>
                      <td className="p-2.5 font-medium text-foreground">{row.name || '-'}</td>
                      <td className="p-2.5 text-muted-foreground font-mono text-[11px]">{row.username || '-'}</td>
                      <td className="p-2.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                          {row.role || 'STUDENT'}
                        </span>
                      </td>
                      <td className="p-2.5 text-muted-foreground">{row.class || row.assignedClass || '-'}</td>
                      <td className="p-2.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                          {row.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="p-2.5 pr-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRow(row.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Hapus baris ini dari Google Sheets"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            Perubahan di spreadsheet otomatis disinkronkan saat sistem memuat data.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
