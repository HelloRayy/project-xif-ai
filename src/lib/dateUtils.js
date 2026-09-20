/**
 * Date filtering utility
 * Supports 'ALL', 'TODAY', 'LAST_7_DAYS', 'THIS_MONTH', 'CUSTOM'
 */
export function isDateMatchingFilter(dateStr, dateFilter = 'ALL', customDate = '') {
  if (dateFilter === 'ALL' || !dateStr) return true;

  const cleanDate = dateStr.slice(0, 10);
  const targetDate = new Date(cleanDate);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (dateFilter === 'TODAY') {
    return cleanDate === todayStr;
  }
  if (dateFilter === 'LAST_7_DAYS') {
    const diffTime = Math.abs(now - targetDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }
  if (dateFilter === 'THIS_MONTH') {
    const targetMonth = targetDate.toISOString().slice(0, 7);
    const currentMonth = now.toISOString().slice(0, 7);
    return targetMonth === currentMonth;
  }
  if (dateFilter === 'CUSTOM') {
    if (!customDate) return true;
    return cleanDate === customDate;
  }
  return true;
}

export function formatIndoDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateToIso(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
