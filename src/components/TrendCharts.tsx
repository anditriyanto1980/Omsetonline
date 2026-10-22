import React, { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
import { LiveSession, Creator } from '../types';
import { formatIDR, formatCompactIDR, formatDateIndo } from '../utils/formatters';

interface TrendChartsProps {
  sessions: LiveSession[];
  creators: Creator[];
  selectedMonth: string;
  selectedCreatorId: string;
  onSelectCreator: (id: string) => void;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  sessions,
  creators,
  selectedMonth,
  selectedCreatorId,
  onSelectCreator
}) => {
  const [chartMode, setChartMode] = useState<'daily' | 'weekly' | 'platform'>('daily');
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value: number;
    subtext?: string;
    x: number;
    y: number;
  } | null>(null);

  // Filter sessions for selected month & creator
  const filteredSessions = sessions.filter(s => {
    const matchMonth = s.date.startsWith(selectedMonth);
    const matchCreator = selectedCreatorId === 'all' || s.creatorId === selectedCreatorId;
    return matchMonth && matchCreator;
  });

  // Calculate days in month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Daily Aggregations (Day 1 to daysInMonth)
  const dailyData: { day: number; dateStr: string; totalGross: number; totalNet: number; count: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayPadded}`;
    const daySessions = filteredSessions.filter(s => s.date === dateStr);
    const totalGross = daySessions.reduce((acc, s) => acc + s.grossIncome, 0);
    const totalNet = daySessions.reduce((acc, s) => acc + s.netIncome, 0);
    dailyData.push({
      day: d,
      dateStr,
      totalGross,
      totalNet,
      count: daySessions.length
    });
  }

  // 2. Weekly Aggregations (Weeks 1 to 5)
  const weeklyData: { weekLabel: string; range: string; totalGross: number; count: number }[] = [
    { weekLabel: 'Minggu 1', range: 'Tgl 1 - 7', totalGross: 0, count: 0 },
    { weekLabel: 'Minggu 2', range: 'Tgl 8 - 14', totalGross: 0, count: 0 },
    { weekLabel: 'Minggu 3', range: 'Tgl 15 - 21', totalGross: 0, count: 0 },
    { weekLabel: 'Minggu 4', range: 'Tgl 22 - 28', totalGross: 0, count: 0 },
    { weekLabel: 'Minggu 5', range: 'Tgl 29+', totalGross: 0, count: 0 },
  ];

  filteredSessions.forEach(s => {
    const dayNum = parseInt(s.date.split('-')[2], 10);
    let weekIdx = 0;
    if (dayNum <= 7) weekIdx = 0;
    else if (dayNum <= 14) weekIdx = 1;
    else if (dayNum <= 21) weekIdx = 2;
    else if (dayNum <= 28) weekIdx = 3;
    else weekIdx = 4;

    weeklyData[weekIdx].totalGross += s.grossIncome;
    weeklyData[weekIdx].count += 1;
  });

  // 3. Platform Distribution
  const platformData: Record<string, { total: number; count: number }> = {};
  filteredSessions.forEach(s => {
    if (!platformData[s.platform]) {
      platformData[s.platform] = { total: 0, count: 0 };
    }
    platformData[s.platform].total += s.grossIncome;
    platformData[s.platform].count += 1;
  });

  const platformList = Object.entries(platformData)
    .map(([platform, data]) => ({
      platform,
      total: data.total,
      count: data.count
    }))
    .sort((a, b) => b.total - a.total);

  const totalPeriodGross = filteredSessions.reduce((acc, s) => acc + s.grossIncome, 0);

  // SVG Line Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;
  const effectiveWidth = chartWidth - paddingX * 2;
  const effectiveHeight = chartHeight - paddingY * 2;

  const maxDailyGross = Math.max(...dailyData.map(d => d.totalGross), 1000000);

  // Points for SVG path
  const points = dailyData.map((d, idx) => {
    const x = paddingX + (idx / (daysInMonth - 1)) * effectiveWidth;
    const y = chartHeight - paddingY - (d.totalGross / maxDailyGross) * effectiveHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = pathD ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z` : '';

  // Max for weekly chart
  const maxWeeklyGross = Math.max(...weeklyData.map(w => w.totalGross), 1000000);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            Grafik Tren Pendapatan Berkala
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis fluktuasi penghasilan siaran live per hari, minggu, dan platform.
          </p>
        </div>

        {/* Controls: Mode Switcher & Streamer Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Streamer Filter */}
          <select
            value={selectedCreatorId}
            onChange={(e) => onSelectCreator(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Semua Kreator</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setChartMode('daily')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                chartMode === 'daily'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren Harian
            </button>
            <button
              onClick={() => setChartMode('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                chartMode === 'weekly'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren Mingguan
            </button>
            <button
              onClick={() => setChartMode('platform')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                chartMode === 'platform'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Platform
            </button>
          </div>
        </div>
      </div>

      {/* Chart View Content */}
      {chartMode === 'daily' && (
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Tren Pendapatan Sesi Tiap Hari (1 - {daysInMonth})</span>
            <span className="font-mono text-emerald-600 font-bold">
              Tertinggi: {formatIDR(maxDailyGross)}
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[650px] relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 overflow-visible"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - paddingY - ratio * effectiveHeight;
                  const val = ratio * maxDailyGross;
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 6}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                        className="font-mono"
                      >
                        {formatCompactIDR(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                {areaD && (
                  <path d={areaD} fill="url(#areaGrad)" />
                )}

                {/* Main line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {points.map((pt) => {
                  const hasData = pt.totalGross > 0;
                  return (
                    <g key={pt.day}>
                      {hasData && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4.5"
                          fill="#e11d48"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-6 transition-all"
                          onMouseEnter={() => setHoveredPoint({
                            label: `Tgl ${pt.day} (${formatDateIndo(pt.dateStr)})`,
                            value: pt.totalGross,
                            subtext: `${pt.count} sesi siaran live`,
                            x: pt.x,
                            y: pt.y
                          })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      )}
                      {/* Day Label on X Axis */}
                      {(pt.day === 1 || pt.day % 5 === 0 || pt.day === daysInMonth) && (
                        <text
                          x={pt.x}
                          y={chartHeight - 8}
                          fill="#64748b"
                          fontSize="10"
                          textAnchor="middle"
                          className="font-mono font-medium"
                        >
                          {pt.day}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-xl transform -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap"
                  style={{ left: hoveredPoint.x, top: hoveredPoint.y }}
                >
                  <div className="font-bold text-rose-300">{hoveredPoint.label}</div>
                  <div className="font-mono text-sm font-extrabold mt-0.5">{formatIDR(hoveredPoint.value)}</div>
                  {hoveredPoint.subtext && (
                    <div className="text-[10px] text-slate-300 mt-0.5">{hoveredPoint.subtext}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart View: Weekly Breakdown */}
      {chartMode === 'weekly' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Perbandingan omset live tiap periode minggu dalam bulan ini:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {weeklyData.map((w, idx) => {
              const heightPct = maxWeeklyGross > 0 ? (w.totalGross / maxWeeklyGross) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{w.weekLabel}</div>
                    <div className="text-[10px] text-slate-500">{w.range}</div>
                  </div>

                  <div className="my-4 h-28 flex items-end justify-center bg-slate-200/50 rounded-lg p-1.5">
                    <div
                      className="w-full bg-gradient-to-t from-rose-500 to-indigo-500 rounded-md transition-all duration-500 shadow-xs"
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                      title={`${w.weekLabel}: ${formatIDR(w.totalGross)}`}
                    />
                  </div>

                  <div>
                    <div className="text-xs font-extrabold font-mono text-rose-600">
                      {formatCompactIDR(w.totalGross)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {w.count} sesi live
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart View: Platform Distribution */}
      {chartMode === 'platform' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Kontribusi omset kotor berdasarkan platform live streaming:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformList.map((item) => {
              const share = totalPeriodGross > 0 ? ((item.total / totalPeriodGross) * 100).toFixed(1) : '0';
              return (
                <div
                  key={item.platform}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      {item.platform}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {share}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${share}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-600 font-mono font-medium">
                    <span>{formatIDR(item.total)}</span>
                    <span>{item.count} Sesi Live</span>
                  </div>
                </div>
              );
            })}

            {platformList.length === 0 && (
              <div className="col-span-2 text-center text-xs text-slate-400 py-6">
                Tidak ada data platform untuk filter yang dipilih.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
