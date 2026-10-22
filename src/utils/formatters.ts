import * as XLSX from 'xlsx';
import { LiveSession, Creator, MonthlyCreatorSummary } from '../types';

export function formatIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatCompactIDR(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Rp 0';
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')}jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${amount}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatHours(hours: number): string {
  if (!hours) return '0 jam';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `${wholeHours} jam`;
  if (wholeHours === 0) return `${minutes} menit`;
  return `${wholeHours}j ${minutes}m`;
}

// Get the Monday-Sunday date range for a given date string or Date object
export function getWeekRange(dateInput: Date | string = new Date()): { start: string; end: string; startDate: Date; endDate: Date } {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  const day = d.getDay();
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(d);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const toYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };

  return {
    start: toYMD(monday),
    end: toYMD(sunday),
    startDate: monday,
    endDate: sunday
  };
}

/**
 * Export data to Excel (.xlsx) using SheetJS
 */
export function exportToExcel(
  sessions: LiveSession[],
  summaries: MonthlyCreatorSummary[],
  monthLabel: string,
  fileName: string = 'Laporan_Penghasilan_Live_Streamer.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan Kreator Bulanan
  const summaryData = summaries.map((s, idx) => ({
    'No': idx + 1,
    'Nama Kreator': s.creatorName,
    'Handle': s.handle,
    'Total Sesi': s.totalSessions,
    'Total Jam Live': Number(s.totalHours.toFixed(1)),
    'Total Penjualan Live (Rp)': s.totalGross,
    'Total Bersih Payout (Rp)': s.totalNet,
    'Rata-rata / Jam (Rp)': Math.round(s.avgPerHour),
    'Rata-rata / Sesi (Rp)': Math.round(s.avgPerSession),
    'Platform Terbanyak': s.topPlatform
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  // Auto-width columns
  wsSummary['!cols'] = [
    { wch: 5 },  // No
    { wch: 22 }, // Nama Kreator
    { wch: 18 }, // Handle
    { wch: 12 }, // Total Sesi
    { wch: 15 }, // Total Jam Live
    { wch: 26 }, // Total Penjualan Live
    { wch: 26 }, // Total Bersih
    { wch: 20 }, // Rata-rata/Jam
    { wch: 20 }, // Rata-rata/Sesi
    { wch: 18 }  // Platform Terbanyak
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Bulanan');

  // 2. Sheet Detail Sesi Harian
  const sessionData = sessions.map((s, idx) => ({
    'No': idx + 1,
    'Tanggal': s.date,
    'Nama Kreator': s.creatorName,
    'Platform': s.platform,
    'Sesi Waktu': s.timeSlot.toUpperCase(),
    'Durasi (Jam)': s.durationHours,
    'Peak Viewers': s.peakViewers || 0,
    'Penghasilan Jualan (Rp)': s.salesIncome ?? s.grossIncome,
    'Potongan Agency (%)': s.agencyCutPercent,
    'Total Bersih (Rp)': s.netIncome,
    'Catatan Sesi': s.notes || '-'
  }));

  const wsSessions = XLSX.utils.json_to_sheet(sessionData);
  wsSessions['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // Tanggal
    { wch: 20 }, // Nama Kreator
    { wch: 16 }, // Platform
    { wch: 12 }, // Sesi Waktu
    { wch: 14 }, // Durasi
    { wch: 14 }, // Peak Viewers
    { wch: 24 }, // Penghasilan Jualan
    { wch: 18 }, // Potongan
    { wch: 18 }, // Total Bersih
    { wch: 30 }  // Catatan
  ];
  XLSX.utils.book_append_sheet(wb, wsSessions, 'Detail Sesi Harian');

  // Save the file
  XLSX.writeFile(wb, fileName);
}

/**
 * Export data to standard CSV
 */
export function exportToCSV(sessions: LiveSession[], fileName: string = 'laporan_live_streamer.csv') {
  const headers = [
    'No',
    'Tanggal',
    'Nama Kreator',
    'Platform',
    'Waktu Sesi',
    'Durasi Jam',
    'Peak Viewers',
    'Penghasilan Jualan Live (Rp)',
    'Potongan Agency (%)',
    'Total Bersih (Rp)',
    'Catatan'
  ];

  const rows = sessions.map((s, idx) => [
    idx + 1,
    `"${s.date}"`,
    `"${s.creatorName.replace(/"/g, '""')}"`,
    `"${s.platform}"`,
    `"${s.timeSlot}"`,
    s.durationHours,
    s.peakViewers || 0,
    s.salesIncome ?? s.grossIncome,
    s.agencyCutPercent,
    s.netIncome,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
