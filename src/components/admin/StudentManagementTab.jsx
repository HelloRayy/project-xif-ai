import React from 'react';
import { Users, Upload, Printer, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

export default function StudentManagementTab({
  displayedStudents,
  studentSearchQuery,
  setStudentSearchQuery,
  studentClassFilter,
  setStudentClassFilter,
  onOpenPrintModal,
  onMassImportExcel,
  onOpenStudentModal,
  onDeleteStudent
}) {
  return (
    <Card className="rounded-xl border-border shadow-xs overflow-hidden">
      <CardHeader className="p-4 border-b border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Manajemen Database Siswa Sekolah</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Kelola identitas siswa dan impor massal database kelas via file spreadsheet.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPrintModal}
              className="h-8 px-3 text-xs font-medium border-blue-300 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Cetak Rekap Presensi (PDF)</span>
            </Button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border hover:bg-muted text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Impor Excel (.xlsx)</span>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={onMassImportExcel} className="hidden" />
            </label>

            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenStudentModal()}
              className="h-8 px-3 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-border">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Cari nama siswa..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>

          <Select value={studentClassFilter} onValueChange={(val) => setStudentClassFilter(val)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kelas</SelectItem>
              <SelectItem value="XI-A">Kelas XI-A</SelectItem>
              <SelectItem value="XI-B">Kelas XI-B</SelectItem>
              <SelectItem value="XI-C">Kelas XI-C</SelectItem>
              <SelectItem value="XI-D">Kelas XI-D</SelectItem>
              <SelectItem value="XI-E">Kelas XI-E</SelectItem>
              <SelectItem value="XI-F">Kelas XI-F</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 text-center text-xs font-semibold">No</TableHead>
                <TableHead className="text-xs font-semibold">Nama Lengkap</TableHead>
                <TableHead className="w-28 text-xs font-semibold">Kelas</TableHead>
                <TableHead className="w-24 text-right text-xs font-semibold pr-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedStudents.map((st, idx) => (
                <TableRow key={st.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-sans text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100">{st.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {st.class}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4 space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenStudentModal(st)}
                      className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-blue-600 rounded-md"
                      title="Edit Siswa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteStudent(st.id)}
                      className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-rose-600 rounded-md"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Touch-Friendly Card View */}
        <div className="md:hidden divide-y divide-border p-3 space-y-3">
          {displayedStudents.map((st) => (
            <div key={st.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                    {st.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">{st.name}</h4>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {st.class}
                </span>
              </div>

              <div className="flex items-center justify-end text-xs pt-1 border-t border-border">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenStudentModal(st)}
                    className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-blue-600 rounded-md"
                    title="Edit Data Siswa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteStudent(st.id)}
                    className="h-7 w-7 text-slate-600 dark:text-zinc-400 hover:text-rose-600 rounded-md"
                    title="Hapus Siswa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
