import React from 'react';
import { DollarSign, Clock, Video, TrendingUp, Trophy, ArrowUpRight, Filter } from 'lucide-react';
import { MonthlyCreatorSummary, Creator } from '../types';
import { formatIDR, formatCompactIDR } from '../utils/formatters';

interface MonthlySummaryProps {
  summaries: MonthlyCreatorSummary[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  selectedCreatorId: string;
  onSelectCreator: (id: string) => void;
  onOpenReportForCreator: (creatorId: string) => void;
  creators: Creator[];
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  summaries,
  selectedMonth,
  onMonthChange,
  selectedCreatorId,
  onSelectCreator,
  onOpenReportForCreator,
  availableMonths,
  creators
}) => {
  // Aggregate stats across all creators in the selected month
  const totalGrossAll = summaries.reduce((acc, curr) => acc + curr.totalGross, 0);
  const totalNetAll = summaries.reduce((acc, curr) => acc + curr.totalNet, 0);
  const totalHoursAll = summaries.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalSessionsAll = summaries.reduce((acc, curr) => acc + curr.totalSessions, 0);
  const avgHourlyRateAll = totalHoursAll > 0 ? totalGrossAll / totalHoursAll : 0;

  // Filtered view if a specific creator is selected
  const activeSummary = selectedCreatorId !== 'all' 
    ? summaries.find(s => s.creatorId === selectedCreatorId) 
    : null;

  const displayGross = activeSummary ? activeSummary.totalGross : totalGrossAll;
  const displayNet = activeSummary ? activeSummary.totalNet : totalNetAll;
  const displayHours = activeSummary ? activeSummary.totalHours : totalHoursAll;
  const displaySessions = activeSummary ? activeSummary.totalSessions : totalSessionsAll;
  const displayHourly = activeSummary ? activeSummary.avgPerHour : avgHourlyRateAll;

  // Format month name (e.g. "2026-10" -> "Oktober 2026")
  const formatMonthTitle = (mStr: string) => {
    if (!mStr) return '-';
    const [year, month] = mStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar: Month Selector & Creator Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-600" />
            <span>Periode Laporan:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500 font-mono"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {formatMonthTitle(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Filter Streamer:</span>
          <select
            value={selectedCreatorId}
            onChange={(e) => onSelectCreator(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Semua Streamer ({creators.length})</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stat Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Omset Kotor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Omset Kotor</span>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            {formatIDR(displayGross)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Bulan: {formatMonthTitle(selectedMonth)}</span>
          </div>
        </div>

        {/* Card 2: Penghasilan Bersih (Net) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Penghasilan Bersih</span>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 tracking-tight">
            {formatIDR(displayNet)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Setelah dipotong fee agensi & layanan
          </div>
        </div>

        {/* Card 3: Total Jam Live */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Jam Streaming</span>
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            {displayHours.toFixed(1)} <span className="text-base font-medium text-slate-400">Jam</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Dari total {displaySessions} sesi siaran live
          </div>
        </div>

        {/* Card 4: Rata-rata Penghasilan per Jam */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rata-rata / Jam Live</span>
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-amber-600 tracking-tight">
            {formatIDR(displayHourly)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Tingkat performa & nilai konversi per jam
          </div>
        </div>

      </div>

      {/* Leaderboard Table / Breakdown Bulanan Sesuai Nama Kreator */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Peringkat & Total Omset Bulanan per Streamer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi otomatis berdasarkan nama kreator untuk periode {formatMonthTitle(selectedMonth)}.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600 font-mono bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
            {summaries.length} Streamer Terdaftar
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Nama Streamer</th>
                <th className="py-3 px-4 text-center">Sesi & Jam</th>
                <th className="py-3 px-4 text-right">Total Penjualan Live</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600">Total Bersih (Net)</th>
                <th className="py-3 px-4 text-right">Rata-rata / Jam</th>
                <th className="py-3 px-4 text-right">Rata-rata / Sesi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((s, idx) => {
                const isTop1 = idx === 0;
                const isSelected = selectedCreatorId === s.creatorId;

                return (
                  <tr
                    key={s.creatorId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-rose-50/80 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-bold font-mono">
                      {isTop1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs shadow-xs">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">#{idx + 1}</span>
                      )}
                    </td>

                    {/* Streamer Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${s.avatarColor} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm`}>
                          {s.creatorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {s.creatorName}
                            {isTop1 && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono border border-amber-200">
                                Top Earner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.handle} · <span className="font-medium text-slate-600">{s.topPlatform}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sessions & Hours */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      <div className="font-semibold">{s.totalSessions} sesi</div>
                      <div className="text-[11px] text-slate-500">{s.totalHours.toFixed(1)} jam</div>
                    </td>

                    {/* Total Gross Sales */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatIDR(s.totalGross)}
                    </td>

                    {/* Total Net */}
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600">
                      {formatIDR(s.totalNet)}
                    </td>

                    {/* Hourly */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-600">
                      {formatCompactIDR(s.avgPerHour)}/j
                    </td>

                    {/* Average per session */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                      {formatCompactIDR(s.avgPerSession)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenReportForCreator(s.creatorId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
                      >
                        <span>Slip Payout</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {summaries.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data sesi live untuk periode {formatMonthTitle(selectedMonth)}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
