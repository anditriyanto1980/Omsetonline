import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowUpDown,
  Award,
  Layers,
  Check
} from 'lucide-react';
import { Creator, LiveSession } from '../types';
import { formatIDR, formatCompactIDR, formatDateIndo, formatHours } from '../utils/formatters';

interface StreamerComparisonBarChartProps {
  sessions: LiveSession[];
  creators: Creator[];
  selectedCreatorId?: string;
  onSelectCreator?: (id: string) => void;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type MetricType = 'gross' | 'net';
type ChartStyle = 'vertical' | 'horizontal';

export const StreamerComparisonBarChart: React.FC<StreamerComparisonBarChartProps> = ({
  sessions,
  creators,
  selectedCreatorId = 'all',
  onSelectCreator
}) => {
  // 1. Period state
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [metric, setMetric] = useState<MetricType>('gross');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('vertical');

  // Available dates, months, years in data
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => s.date && set.add(s.date));
    return Array.from(set).sort().reverse();
  }, [sessions]);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add('2026-10');
    sessions.forEach(s => {
      if (s.date && s.date.length >= 7) {
        set.add(s.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [sessions]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    set.add('2026');
    sessions.forEach(s => {
      if (s.date && s.date.length >= 4) {
        set.add(s.date.substring(0, 4));
      }
    });
    return Array.from(set).sort().reverse();
  }, [sessions]);

  // Specific selected period values
  const [selectedDate, setSelectedDate] = useState<string>(() => availableDates[0] || '2026-10-21');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => availableMonths[0] || '2026-10');
  const [selectedYear, setSelectedYear] = useState<string>(() => availableYears[0] || '2026');
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0); // 0 = Minggu Ini (Terakhir), 1 = M4, 2 = M3, 3 = M2, 4 = M1

  // Tooltip hover state
  const [hoveredCreatorId, setHoveredCreatorId] = useState<string | null>(null);

  // Filter sessions based on active period
  const periodFilteredSessions = useMemo(() => {
    if (period === 'daily') {
      return sessions.filter(s => s.date === selectedDate);
    }
    if (period === 'weekly') {
      // 5 week buckets inside selectedMonth
      return sessions.filter(s => {
        if (!s.date.startsWith(selectedMonth)) return false;
        const day = parseInt(s.date.split('-')[2], 10);
        if (selectedWeekIdx === 0) return day >= 19 && day <= 25; // Default Minggu 3-4 Oktober
        if (selectedWeekIdx === 1) return day >= 1 && day <= 7;
        if (selectedWeekIdx === 2) return day >= 8 && day <= 14;
        if (selectedWeekIdx === 3) return day >= 15 && day <= 21;
        if (selectedWeekIdx === 4) return day >= 22 && day <= 28;
        return day >= 29;
      });
    }
    if (period === 'monthly') {
      return sessions.filter(s => s.date.startsWith(selectedMonth));
    }
    if (period === 'yearly') {
      return sessions.filter(s => s.date.startsWith(selectedYear));
    }
    // 'all'
    return sessions;
  }, [sessions, period, selectedDate, selectedMonth, selectedYear, selectedWeekIdx]);

  // Aggregate stats per creator for the filtered sessions
  const comparisonData = useMemo(() => {
    const list = creators.map(creator => {
      const cSessions = periodFilteredSessions.filter(s => s.creatorId === creator.id);
      const grossIncome = cSessions.reduce((acc, s) => acc + s.grossIncome, 0);
      const netIncome = cSessions.reduce((acc, s) => acc + s.netIncome, 0);
      const durationHours = cSessions.reduce((acc, s) => acc + s.durationHours, 0);
      const sessionCount = cSessions.length;
      const targetIncome = creator.weeklyTargetIncome;

      const currentValue = metric === 'gross' ? grossIncome : netIncome;
      const avgPerHour = durationHours > 0 ? currentValue / durationHours : 0;
      const avgPerSession = sessionCount > 0 ? currentValue / sessionCount : 0;

      return {
        creator,
        grossIncome,
        netIncome,
        currentValue,
        durationHours,
        sessionCount,
        targetIncome,
        avgPerHour,
        avgPerSession
      };
    });

    // Sort descending by current value
    return list.sort((a, b) => b.currentValue - a.currentValue);
  }, [creators, periodFilteredSessions, metric]);

  // Maximum value for scaling bars
  const maxValue = useMemo(() => {
    const highest = Math.max(...comparisonData.map(d => d.currentValue), 0);
    return highest > 0 ? highest : 1000000;
  }, [comparisonData]);

  // Total income for all streamers in this period
  const totalTeamIncome = useMemo(() => {
    return comparisonData.reduce((acc, d) => acc + d.currentValue, 0);
  }, [comparisonData]);

  const totalTeamHours = useMemo(() => {
    return comparisonData.reduce((acc, d) => acc + d.durationHours, 0);
  }, [comparisonData]);

  const totalTeamSessions = useMemo(() => {
    return comparisonData.reduce((acc, d) => acc + d.sessionCount, 0);
  }, [comparisonData]);

  const topPerformer = comparisonData[0]?.currentValue > 0 ? comparisonData[0] : null;

  // Period label for title & subtitles
  const periodLabel = useMemo(() => {
    if (period === 'daily') return `Hari: ${formatDateIndo(selectedDate)}`;
    if (period === 'weekly') {
      const labels = [
        'Minggu Berjalan (Tgl 19-25)',
        'Minggu 1 (Tgl 1-7)',
        'Minggu 2 (Tgl 8-14)',
        'Minggu 3 (Tgl 15-21)',
        'Minggu 4 (Tgl 22-28)',
        'Minggu 5 (Tgl 29-31)'
      ];
      return `${labels[selectedWeekIdx] || 'Minggu'} · ${selectedMonth}`;
    }
    if (period === 'monthly') {
      const [y, m] = selectedMonth.split('-');
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return `Bulan: ${d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    }
    if (period === 'yearly') return `Tahun: ${selectedYear}`;
    return 'Sepanjang Waktu (Semua Riwayat)';
  }, [period, selectedDate, selectedWeekIdx, selectedMonth, selectedYear]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      
      {/* 1. Header & Title with Navigation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Grafik Batang Perbandingan Performa Streamer
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Bandingkan total omset & kontribusi penjualan live setiap kreator secara visual dan adil.
              </p>
            </div>
          </div>
        </div>

        {/* Metric (Kotor vs Bersih) & Style Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetric('gross')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metric === 'gross'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Omset Penjualan
            </button>
            <button
              type="button"
              onClick={() => setMetric('net')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metric === 'net'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendapatan Bersih
            </button>
          </div>

          {/* Chart Style (Vertical vs Horizontal) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartStyle('vertical')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                chartStyle === 'vertical'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Batang Tegak (Vertikal)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Batang Tegak</span>
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('horizontal')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                chartStyle === 'horizontal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Batang Peringkat (Horizontal)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Peringkat</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Period Selector Toolbar: [Per Hari] [Per Minggu] [Per Bulan] [Per Tahun] [Semua] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
        {/* Buttons for Timeframe */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-1.5 shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Lihat:</span>
          </span>

          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
              period === 'daily'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            📅 Per Hari
          </button>

          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
              period === 'weekly'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            📆 Per Minggu
          </button>

          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
              period === 'monthly'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            📊 Per Bulan
          </button>

          <button
            type="button"
            onClick={() => setPeriod('yearly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
              period === 'yearly'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🗓️ Per Tahun
          </button>

          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
              period === 'all'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ⭐ Semua Waktu
          </button>
        </div>

        {/* Dynamic Context Filter based on selected period */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {/* Per Hari Sub-selector */}
          {period === 'daily' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pilih Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-rose-500 shadow-2xs"
              />
            </div>
          )}

          {/* Per Minggu Sub-selector */}
          {period === 'weekly' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={selectedWeekIdx}
                onChange={(e) => setSelectedWeekIdx(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
              >
                <option value={0}>Minggu Berjalan (19-25)</option>
                <option value={1}>Minggu 1 (Tgl 1-7)</option>
                <option value={2}>Minggu 2 (Tgl 8-14)</option>
                <option value={3}>Minggu 3 (Tgl 15-21)</option>
                <option value={4}>Minggu 4 (Tgl 22-28)</option>
                <option value={5}>Minggu 5 (Tgl 29+)</option>
              </select>
            </div>
          )}

          {/* Per Bulan Sub-selector */}
          {period === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pilih Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500 shadow-2xs"
              >
                {availableMonths.map(m => {
                  const [y, mon] = m.split('-');
                  const d = new Date(parseInt(y, 10), parseInt(mon, 10) - 1, 1);
                  const lbl = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                  return <option key={m} value={m}>{lbl}</option>;
                })}
              </select>
            </div>
          )}

          {/* Per Tahun Sub-selector */}
          {period === 'yearly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pilih Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500 shadow-2xs"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Snapshot Performance Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            Total {metric === 'gross' ? 'Omset' : 'Net'} Tim
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-rose-950 mt-0.5">
            {formatIDR(totalTeamIncome)}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
            {totalTeamSessions} sesi siaran live
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-600" />
            <span>Top Streamer 🥇</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-amber-950 mt-0.5 truncate">
            {topPerformer ? topPerformer.creator.name : '-'}
          </div>
          <div className="text-[11px] text-amber-700 font-mono font-semibold mt-0.5">
            {topPerformer ? formatCompactIDR(topPerformer.currentValue) : 'Rp 0'}
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>Total Jam Live</span>
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-indigo-950 mt-0.5">
            {formatHours(totalTeamHours)}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
            {comparisonData.length} streamer aktif
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Rata-rata / Streamer
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-emerald-950 mt-0.5">
            {formatCompactIDR(comparisonData.length > 0 ? totalTeamIncome / comparisonData.length : 0)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Periode {periodLabel.split('·')[0]}
          </div>
        </div>
      </div>

      {/* 4. The Bar Chart Display */}
      {comparisonData.every(d => d.currentValue === 0) ? (
        /* Empty State */
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Belum Ada Sesi Live pada Periode Terpilih
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada catatan penjualan live streaming pada {periodLabel}. Coba pilih tanggal atau periode lainnya.
          </p>
        </div>
      ) : chartStyle === 'vertical' ? (
        /* VERTICAL COLUMN BAR CHART */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Perbandingan Tinggi Batang Penjualan ({periodLabel}):</span>
            <span className="font-mono text-slate-700 font-bold">
              Tertinggi: {formatIDR(maxValue)}
            </span>
          </div>

          {/* SVG / Styled Container for Columns */}
          <div className="relative pt-8 pb-3 px-2 sm:px-6 bg-slate-50/60 border border-slate-200/80 rounded-2xl overflow-x-auto">
            
            {/* Horizontal Grid Guide Lines */}
            <div className="absolute inset-x-4 top-8 bottom-24 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-slate-300 border-dashed w-full" />
              <div className="border-b border-slate-300 border-dashed w-full" />
              <div className="border-b border-slate-300 border-dashed w-full" />
              <div className="border-b border-slate-300 w-full" />
            </div>

            {/* Bars row */}
            <div className="min-w-[500px] h-64 flex items-end justify-around gap-4 sm:gap-6 relative z-10 px-4">
              {comparisonData.map((d, index) => {
                const heightPct = maxValue > 0 ? (d.currentValue / maxValue) * 100 : 0;
                const shareOfTotal = totalTeamIncome > 0 ? ((d.currentValue / totalTeamIncome) * 100).toFixed(1) : '0';
                const isTop = index === 0 && d.currentValue > 0;
                const isSelected = selectedCreatorId === d.creator.id;
                const isHovered = hoveredCreatorId === d.creator.id;

                return (
                  <div
                    key={d.creator.id}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredCreatorId(d.creator.id)}
                    onMouseLeave={() => setHoveredCreatorId(null)}
                    onClick={() => onSelectCreator && onSelectCreator(d.creator.id)}
                  >
                    {/* Floating Value Pill Above Bar */}
                    <div className="mb-2 text-center transition-all group-hover:scale-105">
                      <span className={`text-[11px] sm:text-xs font-black font-mono px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap block ${
                        isTop
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}>
                        {formatCompactIDR(d.currentValue)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                        {shareOfTotal}% share
                      </span>
                    </div>

                    {/* The Bar Itself */}
                    <div className="w-full max-w-[64px] bg-slate-200/80 rounded-t-2xl p-1 flex items-end justify-center h-44 shadow-inner">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 relative overflow-hidden bg-gradient-to-t ${d.creator.avatarColor} ${
                          isSelected ? 'ring-3 ring-rose-500 shadow-md' : 'shadow-xs'
                        } ${isHovered ? 'brightness-110' : ''}`}
                        style={{ height: `${Math.max(6, heightPct)}%` }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isTop && (
                          <div className="absolute top-1 left-1/2 -translate-x-1/2">
                            <span className="text-[10px]">👑</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Streamer Label & Avatar */}
                    <div className="mt-3 text-center flex flex-col items-center">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${d.creator.avatarColor} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                          {d.creator.name.slice(0, 1)}
                        </div>
                        {index < 3 && d.currentValue > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 text-xs">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1 truncate max-w-[85px]">
                        {d.creator.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {d.sessionCount} live · {d.durationHours}j
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      ) : (
        /* HORIZONTAL RANKED BAR CHART */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Peringkat Penjualan Streamer ({periodLabel}):</span>
            <span className="font-mono text-slate-700 font-bold">Diurutkan Tertinggi</span>
          </div>

          <div className="space-y-2.5">
            {comparisonData.map((d, index) => {
              const widthPct = maxValue > 0 ? (d.currentValue / maxValue) * 100 : 0;
              const shareOfTotal = totalTeamIncome > 0 ? ((d.currentValue / totalTeamIncome) * 100).toFixed(1) : '0';
              const isTop = index === 0 && d.currentValue > 0;
              const isSelected = selectedCreatorId === d.creator.id;

              return (
                <div
                  key={d.creator.id}
                  onClick={() => onSelectCreator && onSelectCreator(d.creator.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    
                    {/* Rank, Avatar & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-black text-xs text-slate-400 font-mono">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>

                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${d.creator.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                        {d.creator.name.slice(0, 1)}
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{d.creator.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{d.creator.handle}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {d.creator.category} · {d.sessionCount} Sesi Live ({formatHours(d.durationHours)})
                        </div>
                      </div>
                    </div>

                    {/* Amount & Share */}
                    <div className="sm:text-right self-end sm:self-auto">
                      <div className="text-sm sm:text-base font-black font-mono text-slate-900">
                        {formatIDR(d.currentValue)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 justify-end">
                        <span className="font-bold text-rose-600">{shareOfTotal}% Kontribusi</span>
                        <span>•</span>
                        <span>{formatCompactIDR(d.avgPerHour)}/jam</span>
                      </div>
                    </div>

                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${d.creator.avatarColor} shadow-2xs`}
                      style={{ width: `${Math.max(3, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Analytical Breakdown Table Footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            Data dihitung dari total <strong>{periodFilteredSessions.length} sesi live</strong> yang tercatat pada {periodLabel}.
          </span>
        </div>
        <div className="font-semibold text-slate-700">
          Metrik: {metric === 'gross' ? 'Omset Penjualan Kotor (Shopee Live dll)' : 'Omset Bersih Setelah Fee Agensi'}
        </div>
      </div>

    </div>
  );
};
