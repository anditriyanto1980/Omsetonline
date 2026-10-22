import React, { useState } from 'react';
import { X, FileSpreadsheet, Printer, Download, FileText, Check, Building2, User } from 'lucide-react';
import { LiveSession, Creator, MonthlyCreatorSummary } from '../types';
import { formatIDR, formatCompactIDR, formatDateIndo, formatHours, exportToExcel, exportToCSV } from '../utils/formatters';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: LiveSession[];
  creators: Creator[];
  summaries: MonthlyCreatorSummary[];
  selectedMonth: string;
  initialCreatorId?: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  sessions,
  creators,
  summaries,
  selectedMonth,
  initialCreatorId
}) => {
  const [exportScope, setExportScope] = useState<'single' | 'all'>(initialCreatorId && initialCreatorId !== 'all' ? 'single' : 'all');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    initialCreatorId && initialCreatorId !== 'all' ? initialCreatorId : (creators[0]?.id || '')
  );
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter sessions based on scope
  const monthSessions = sessions.filter(s => s.date.startsWith(selectedMonth));
  const reportSessions = exportScope === 'single'
    ? monthSessions.filter(s => s.creatorId === selectedCreatorId)
    : monthSessions;

  const targetCreator = creators.find(c => c.id === selectedCreatorId) || creators[0];
  const targetSummary = summaries.find(s => s.creatorId === selectedCreatorId);

  // Totals for the printable slip
  const totalGross = reportSessions.reduce((acc, s) => acc + s.grossIncome, 0);
  const totalNet = reportSessions.reduce((acc, s) => acc + s.netIncome, 0);
  const totalHours = reportSessions.reduce((acc, s) => acc + s.durationHours, 0);
  const totalDeduction = totalGross - totalNet;

  const formatMonthTitle = (mStr: string) => {
    if (!mStr) return '-';
    const [year, month] = mStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const monthLabel = formatMonthTitle(selectedMonth);

  const handleExcelExport = () => {
    try {
      const fileName = `Laporan_Streamer_${selectedMonth}_${exportScope === 'single' ? targetCreator?.name.replace(/\s+/g, '_') : 'Semua'}.xlsx`;
      exportToExcel(reportSessions, summaries, monthLabel, fileName);
      setDownloadSuccess('File Excel (.xlsx) berhasil diunduh!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCSVExport = () => {
    const fileName = `Laporan_Streamer_${selectedMonth}.csv`;
    exportToCSV(reportSessions, fileName);
    setDownloadSuccess('File CSV berhasil diunduh!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-900 my-4 max-h-[95vh] flex flex-col">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-rose-600" />
              Ekspor Laporan Administrasi & Slip PDF
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unduh rekap dalam format Excel (.xlsx), CSV, atau cetak Slip Rekap Resmi ke PDF.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="no-print mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Action Controls & Scope (Hidden on print) */}
        <div className="no-print py-4 border-b border-slate-100 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Cakupan Data:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`px-3 py-1 text-xs rounded-md font-bold transition-colors ${
                  exportScope === 'all'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Streamer ({creators.length})
              </button>
              <button
                type="button"
                onClick={() => setExportScope('single')}
                className={`px-3 py-1 text-xs rounded-md font-bold transition-colors ${
                  exportScope === 'single'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per Streamer
              </button>
            </div>

            {exportScope === 'single' && (
              <select
                value={selectedCreatorId}
                onChange={(e) => setSelectedCreatorId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
              >
                {creators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all active:scale-95 whitespace-nowrap shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleCSVExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Official Document Preview */}
        <div className="flex-1 overflow-y-auto mt-4 p-2 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="printable-area bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200">
            
            {/* Document Letterhead / Kop Resmi */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <div className="text-xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-slate-900 inline" />
                  STREAMPULSE CREATIVE AGENCY
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Talent Management & Live Streaming Commerce Division
                </p>
                <p className="text-[11px] text-slate-500">
                  Wisma Kreatif Lt. 8, Jl. Sudirman Kav. 24, Jakarta Selatan · Tel: (021) 555-8989
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-mono font-bold px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800">
                  SLIP REKAP PENDAPATAN
                </span>
                <div className="text-[11px] text-slate-600 font-mono mt-2 font-semibold">
                  No: SP-INV/{selectedMonth.replace('-', '')}/089
                </div>
                <div className="text-[11px] text-slate-500">
                  Tgl Cetak: {formatDateIndo('2026-10-21')}
                </div>
              </div>
            </div>

            {/* Meta Information Section */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Penerima / Streamer:</span>
                <span className="text-sm font-bold text-slate-900">
                  {exportScope === 'single' ? targetCreator?.name : 'Semua Streamer Manajemen (Rekap Tim)'}
                </span>
                {exportScope === 'single' && (
                  <span className="text-slate-600 block text-[11px] font-medium">
                    Handle: {targetCreator?.handle} · Kategori: {targetCreator?.category}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Periode Laporan:</span>
                <span className="text-sm font-bold text-slate-900">{monthLabel}</span>
                <span className="text-slate-600 block text-[11px] font-medium">
                  Total {reportSessions.length} Sesi Live ({totalHours.toFixed(1)} Jam)
                </span>
              </div>
            </div>

            {/* Itemized Session Table */}
            <div className="mt-4">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold uppercase">
                    <th className="py-2 px-2">Tanggal</th>
                    <th className="py-2 px-2">Kreator</th>
                    <th className="py-2 px-2">Platform</th>
                    <th className="py-2 px-2 text-center">Durasi</th>
                    <th className="py-2 px-2 text-right">Penghasilan Jualan</th>
                    <th className="py-2 px-2 text-right">Pot. Agensi</th>
                    <th className="py-2 px-2 text-right font-bold text-slate-900">Total Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {reportSessions.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-1.5 px-2 font-medium">{s.date}</td>
                      <td className="py-1.5 px-2 font-sans font-bold text-slate-900">{s.creatorName}</td>
                      <td className="py-1.5 px-2 font-sans text-slate-700">{s.platform}</td>
                      <td className="py-1.5 px-2 text-center text-slate-700">{s.durationHours}j</td>
                      <td className="py-1.5 px-2 text-right text-slate-900 font-bold">{formatIDR(s.salesIncome ?? s.grossIncome)}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">
                        {formatCompactIDR(s.grossIncome - s.netIncome)} ({s.agencyCutPercent}%)
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-emerald-700">
                        {formatIDR(s.netIncome)}
                      </td>
                    </tr>
                  ))}

                  {reportSessions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-400 font-sans">
                        Tidak ada riwayat siaran live pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation Card */}
            <div className="mt-6 pt-4 border-t-2 border-slate-300 flex justify-end">
              <div className="w-full max-w-sm space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 text-slate-600 font-medium">
                  <span>Subtotal Pendapatan Kotor (Bruto):</span>
                  <span className="font-bold text-slate-900">{formatIDR(totalGross)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 font-medium">
                  <span>Total Potongan Agensi & Layanan:</span>
                  <span className="text-rose-600 font-bold">-{formatIDR(totalDeduction)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-950 bg-slate-100 px-3 rounded">
                  <span>TOTAL NETTO DITRANSFER:</span>
                  <span className="text-base font-black text-emerald-700">{formatIDR(totalNet)}</span>
                </div>
              </div>
            </div>

            {/* Signature Area for Administration */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-xs text-center border-t border-slate-200">
              <div>
                <p className="text-slate-500 font-medium">Dibuat & Diverifikasi Oleh:</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-xs text-slate-400 italic">[Tanda Tangan Digital Finance]</span>
                </div>
                <p className="font-bold text-slate-900">Finansial & Administrasi Agensi</p>
                <p className="text-[10px] text-slate-500">StreamPulse Talent Division</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Disetujui Oleh Talent:</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-xs text-slate-400 italic">[Tanda Tangan Streamer]</span>
                </div>
                <p className="font-bold text-slate-900">
                  {exportScope === 'single' ? targetCreator?.name : 'Perwakilan Streamer'}
                </p>
                <p className="text-[10px] text-slate-500">Official Content Creator</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              Dokumen ini sah dan diterbitkan secara elektronik oleh sistem StreamPulse Income Tracker untuk keperluan perpajakan, rekonsiliasi transfer bank, dan administrasi.
            </div>

          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="no-print pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
