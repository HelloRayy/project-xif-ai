import React from 'react';
import { Home, Stethoscope, Trophy } from 'lucide-react';

export const PERMIT_SERVICES = [
  {
    category: 'LAYANAN_PERIZINAN',
    categoryLabel: 'Pilihan Jenis Perizinan Siswa',
    items: [
      {
        id: 'Izin',
        label: 'Izin',
        type: 'IZIN_TIDAK_HADIR',
        icon: Home,
        helper: 'Lampirkan Surat Izin Tertulis dari Orang Tua/Wali Murid atau Keterangan Resmi.',
      },
      {
        id: 'Sakit',
        label: 'Sakit',
        type: 'IZIN_TIDAK_HADIR',
        icon: Stethoscope,
        helper: 'Lampirkan Surat Keterangan Dokter/Klinik atau Surat Pernyataan Orang Tua/Wali.',
      },
      {
        id: 'Dispensasi',
        label: 'Dispensasi',
        type: 'DISPENSASI',
        icon: Trophy,
        helper: 'Lampirkan Surat Tugas / Undangan Kegiatan dari Pembina, OSIS, atau Sekolah.',
      }
    ]
  }
];

// Schedule: 1 JP = 45 mins, starts at 07:00 AM
export const JP_SCHEDULE = [
  { period: 1, start: '07:00', end: '07:45', startMinutes: 7 * 60, endMinutes: 7 * 60 + 45 },
  { period: 2, start: '07:45', end: '08:30', startMinutes: 7 * 60 + 45, endMinutes: 8 * 60 + 30 },
  { period: 3, start: '08:30', end: '09:15', startMinutes: 8 * 60 + 30, endMinutes: 9 * 60 + 15 },
  { period: 4, start: '09:15', end: '10:00', startMinutes: 9 * 60 + 15, endMinutes: 10 * 60 },
  { period: 5, start: '10:00', end: '10:45', startMinutes: 10 * 60, endMinutes: 10 * 60 + 45 },
  { period: 6, start: '10:45', end: '11:30', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 30 },
  { period: 7, start: '11:30', end: '12:15', startMinutes: 11 * 60 + 30, endMinutes: 12 * 60 + 15 },
  { period: 8, start: '12:15', end: '13:00', startMinutes: 12 * 60 + 15, endMinutes: 13 * 60 },
  { period: 9, start: '13:00', end: '13:45', startMinutes: 13 * 60, endMinutes: 13 * 60 + 45 },
  { period: 10, start: '13:45', end: '14:30', startMinutes: 13 * 60 + 45, endMinutes: 14 * 60 + 30 },
];

const DEMO_CURRENT_HOURS = 7;
const DEMO_CURRENT_MINUTES = 0;

export function isPeriodPassed(dateObj, jp) {
  if (!dateObj) return false;
  const now = new Date();
  
  const isToday = 
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear();

  const isPast = dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isPast) return true;
  if (!isToday) return false;

  const currentMinutes = DEMO_CURRENT_HOURS * 60 + DEMO_CURRENT_MINUTES;
  return currentMinutes >= jp.endMinutes;
}
