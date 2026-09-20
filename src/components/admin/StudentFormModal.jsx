import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function StudentFormModal({
  open,
  onOpenChange,
  editingStudent,
  studentForm,
  setStudentForm,
  onSave
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-50">
            {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Masukkan identitas dan kelas siswa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-3.5 pt-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-900 dark:text-zinc-100">Nama Lengkap Siswa</label>
            <Input
              type="text"
              required
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              placeholder="Contoh: Muhammad Rizky Pratama"
              className="h-9 text-xs rounded-lg bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Kelas</label>
              <Select
                value={studentForm.class}
                onValueChange={(val) => setStudentForm({ ...studentForm, class: val })}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XI-A">XI-A</SelectItem>
                  <SelectItem value="XI-B">XI-B</SelectItem>
                  <SelectItem value="XI-C">XI-C</SelectItem>
                  <SelectItem value="XI-D">XI-D</SelectItem>
                  <SelectItem value="XI-E">XI-E</SelectItem>
                  <SelectItem value="XI-F">XI-F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Jenis Kelamin</label>
              <Select
                value={studentForm.gender}
                onValueChange={(val) => setStudentForm({ ...studentForm, gender: val })}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Pilih Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3.5 text-xs rounded-lg border-border"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-9 px-4 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Simpan Data Siswa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
