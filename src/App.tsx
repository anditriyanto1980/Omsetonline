import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Plus,
  FileSpreadsheet,
  TrendingUp,
  Target,
  Users,
  RotateCcw,
  Bell,
  ArrowUpRight,
  Flame,
  Radio,
  CheckCircle2,
  Clock,
  Settings,
  Edit3
} from 'lucide-react';

import { Creator, LiveSession, MonthlyCreatorSummary, WeeklyProgress, ShiftSetting } from './types';
import { INITIAL_CREATORS, INITIAL_SESSIONS, INITIAL_SHIFTS, STORAGE_KEYS } from './utils/mockData';
import { getWeekRange, formatIDR, formatCompactIDR } from './utils/formatters';

import { Header } from './components/Header';
import { MonthlySummary } from './components/MonthlySummary';
import { TrendCharts } from './components/TrendCharts';
import { StreamerComparisonBarChart } from './components/StreamerComparisonBarChart';
import { WeeklyTargetCard } from './components/WeeklyTargetCard';
import { SessionTable } from './components/SessionTable';
import { InputSessionModal } from './components/InputSessionModal';
import { ShiftSettingsModal } from './components/ShiftSettingsModal';
import { TargetNotificationModal } from './components/TargetNotificationModal';
import { ExportReportModal } from './components/ExportReportModal';
import { CreatorManagementModal } from './components/CreatorManagementModal';

export default function App() {
  // Persistence state
  const [creators, setCreators] = useState<Creator[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREATORS);
      return saved ? JSON.parse(saved) : INITIAL_CREATORS;
    } catch {
      return INITIAL_CREATORS;
    }
  });

  const [sessions, setSessions] = useState<LiveSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [shifts, setShifts] = useState<ShiftSetting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(creators));
    } catch (e) {
      console.error(e);
    }
  }, [creators]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      console.error(e);
    }
  }, [shifts]);

  // Active navigation & filters
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'trends' | 'targets' | 'reports'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('all');
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(false);

  // Modals state
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportInitialCreatorId, setExportInitialCreatorId] = useState<string>('all');
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState<boolean>(false);
  const [editingCreatorId, setEditingCreatorId] = useState<string | null>(null);

  // Milestone unlock alert banner
  const [achievementAlert, setAchievementAlert] = useState<{
    creatorName: string;
    percentage: number;
    amount: number;
  } | null>(null);

  // Available months extracted from sessions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    // Default current month
    set.add('2026-10');
    sessions.forEach(s => {
      if (s.date && s.date.length >= 7) {
        set.add(s.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [sessions]);

  // Calculate Monthly Summaries per creator name
  const monthlySummaries: MonthlyCreatorSummary[] = useMemo(() => {
    const monthSessions = sessions.filter(s => s.date.startsWith(selectedMonth));

    return creators.map(creator => {
      const cSessions = monthSessions.filter(s => s.creatorId === creator.id);
      const totalGross = cSessions.reduce((acc, s) => acc + s.grossIncome, 0);
      const totalNet = cSessions.reduce((acc, s) => acc + s.netIncome, 0);
      const totalHours = cSessions.reduce((acc, s) => acc + s.durationHours, 0);

      // Most frequent platform
      const platformCounts: Record<string, number> = {};
      cSessions.forEach(s => {
        platformCounts[s.platform] = (platformCounts[s.platform] || 0) + 1;
      });
      let topPlatform = '-';
      let maxPCount = 0;
      Object.entries(platformCounts).forEach(([p, count]) => {
        if (count > maxPCount) {
          maxPCount = count;
          topPlatform = p;
        }
      });

      return {
        creatorId: creator.id,
        creatorName: creator.name,
        handle: creator.handle,
        avatarColor: creator.avatarColor,
        totalGross,
        totalNet,
        totalHours,
        totalSessions: cSessions.length,
        avgPerSession: cSessions.length > 0 ? totalGross / cSessions.length : 0,
        avgPerHour: totalHours > 0 ? totalGross / totalHours : 0,
        topPlatform,
        weeklyTargetRate: (creator.weeklyTargetIncome * 4) > 0
          ? Math.round((totalGross / (creator.weeklyTargetIncome * 4)) * 100)
          : 0
      };
    }).sort((a, b) => b.totalGross - a.totalGross);
  }, [creators, sessions, selectedMonth]);

  // Calculate Weekly Target Progress for each creator
  const weeklyProgressList: WeeklyProgress[] = useMemo(() => {
    const { start, end } = getWeekRange(new Date());

    return creators.map(creator => {
      const weekSessions = sessions.filter(s => {
        return s.creatorId === creator.id && s.date >= start && s.date <= end;
      });

      const currentIncome = weekSessions.reduce((acc, s) => acc + s.grossIncome, 0);
      const currentHours = weekSessions.reduce((acc, s) => acc + s.durationHours, 0);
      const targetIncome = creator.weeklyTargetIncome || 5000000;
      const targetHours = creator.weeklyTargetHours || 15;

      const percentageIncome = Math.round((currentIncome / targetIncome) * 100);
      const percentageHours = Math.round((currentHours / targetHours) * 100);
      const isAchieved = percentageIncome >= 100;
      const isExceeded = percentageIncome > 100;
      const remainingIncome = Math.max(0, targetIncome - currentIncome);

      // Status label
      let statusLabel = 'Mulai Sesi Live';
      if (isExceeded) statusLabel = '🏆 Target Terlampaui!';
      else if (isAchieved) statusLabel = '✓ Target Tercapai 100%';
      else if (percentageIncome >= 75) statusLabel = '⚡ Sedikit Lagi (75%+)';
      else if (percentageIncome >= 50) statusLabel = '🔥 Setengah Jalan (50%)';
      else if (percentageIncome > 0) statusLabel = `${percentageIncome}% Tercapai`;

      // Streak count (unique active days)
      const uniqueDays = new Set(weekSessions.map(s => s.date)).size;

      return {
        creatorId: creator.id,
        creatorName: creator.name,
        targetIncome,
        currentIncome,
        targetHours,
        currentHours,
        sessionCount: weekSessions.length,
        percentageIncome,
        percentageHours,
        isAchieved,
        isExceeded,
        remainingIncome,
        streakDays: uniqueDays,
        statusLabel
      };
    }).sort((a, b) => b.percentageIncome - a.percentageIncome);
  }, [creators, sessions]);

  // Count total streamers achieving weekly goal
  const totalWeeklyAchievedCount = weeklyProgressList.filter(p => p.isAchieved).length;

  // Handler: Save new session or edit existing
  const handleSaveSession = (sessionData: Omit<LiveSession, 'id' | 'createdAt'>) => {
    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? {
        ...s,
        ...sessionData
      } : s));
      setEditingSession(null);
    } else {
      const newSession: LiveSession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      setSessions(prev => [newSession, ...prev]);

      // Check if this new session triggers target achievement!
      const creator = creators.find(c => c.id === sessionData.creatorId);
      if (creator) {
        const { start, end } = getWeekRange(new Date());
        const pastWeekIncome = sessions
          .filter(s => s.creatorId === creator.id && s.date >= start && s.date <= end)
          .reduce((acc, s) => acc + s.grossIncome, 0);
        
        const newTotalWeekIncome = pastWeekIncome + sessionData.grossIncome;
        const newPct = Math.round((newTotalWeekIncome / creator.weeklyTargetIncome) * 100);

        if (newPct >= 100 && (pastWeekIncome / creator.weeklyTargetIncome) < 1.0) {
          // Just unlocked 100%! Celebrate with confetti and notification alert
          setAchievementAlert({
            creatorName: creator.name,
            percentage: newPct,
            amount: newTotalWeekIncome
          });

          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 }
            });
          } catch {
            // Ignore
          }
        }
      }
    }
  };

  // Handler: Delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Handler: Save creator (add/edit) with cascade name update to all historical sessions
  const handleSaveCreator = (creator: Creator) => {
    setCreators(prev => {
      const exists = prev.some(c => c.id === creator.id);
      if (exists) {
        return prev.map(c => c.id === creator.id ? creator : c);
      }
      return [...prev, creator];
    });

    // Cascade name update: any session associated with this creatorId gets updated creatorName
    setSessions(prev => prev.map(s => s.creatorId === creator.id ? { ...s, creatorName: creator.name } : s));
  };

  // Handler: Delete creator
  const handleDeleteCreator = (creatorId: string) => {
    setCreators(prev => prev.filter(c => c.id !== creatorId));
    if (selectedCreatorId === creatorId) {
      setSelectedCreatorId('all');
    }
  };

  // Handler: Save shifts
  const handleSaveShifts = (updatedShifts: ShiftSetting[]) => {
    setShifts(updatedShifts);
  };

  // Reset to sample data
  const handleResetToSample = () => {
    if (window.confirm('Kembalikan semua data ke sampel awal kreator, shift, dan sesi live Oktober 2026?')) {
      setCreators(INITIAL_CREATORS);
      setSessions(INITIAL_SESSIONS);
      setShifts(INITIAL_SHIFTS);
      localStorage.removeItem(STORAGE_KEYS.CREATORS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Contract (Single-line wordmark, nav links, 1 primary action) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewSession={() => {
          setEditingSession(null);
          setIsInputModalOpen(true);
        }}
        onOpenTargetModal={() => setIsTargetModalOpen(true)}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onOpenCreatorModal={() => {
          setEditingCreatorId(null);
          setIsCreatorModalOpen(true);
        }}
        totalWeeklyAchievedCount={totalWeeklyAchievedCount}
      />

      {/* Target Achievement Celebratory Banner (shown when target just unlocked) */}
      {achievementAlert && (
        <div className="no-print bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-4 py-3 text-white text-xs sm:text-sm font-semibold shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span>
                🎉 <strong>Target Mingguan Tercapai!</strong> Selamat kepada <strong>{achievementAlert.creatorName}</strong> ({achievementAlert.percentage}%) dengan akumulasi {formatIDR(achievementAlert.amount)}!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setAchievementAlert(null);
                  setIsTargetModalOpen(true);
                }}
                className="px-3 py-1 bg-white text-emerald-800 rounded-md font-bold text-xs hover:bg-slate-100 transition-colors shadow-xs"
              >
                Kirim Pesan Motivasi
              </button>
              <button
                onClick={() => setAchievementAlert(null)}
                className="text-white/80 hover:text-white text-xs underline"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Tab 1: Dashboard (Ringkasan Bulanan & Target Mingguan Utama) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Friendly Welcome & Quick Action Card */}
            <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-indigo-500/10 border border-rose-200/80 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-rose-700 text-xs font-bold border border-rose-200 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Aplikasi Pencatatan Penghasilan Live Streamer</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Halo Tim Streamer! Siap catat hasil live hari ini? 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Pencatatan super cepat & ramah. Cukup masukkan nominal angka dari dashboard Shopee Live setelah siaran, sistem akan otomatis menghitung omset bulanan & progres target mingguanmu!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setEditingSession(null);
                      setIsInputModalOpen(true);
                    }}
                    className="px-4 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 rounded-2xl shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Catat Hasil Live</span>
                  </button>
                  <button
                    onClick={() => setIsShiftModalOpen(true)}
                    className="px-3.5 py-2.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-2xl transition-all shadow-2xs flex items-center gap-1.5"
                    title="Atur jam shift siaran operasional"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Atur Jam Shift ({shifts.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCreatorId(null);
                      setIsCreatorModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-2xl transition-all shadow-2xs flex items-center gap-1.5"
                    title="Kelola & edit nama streamer"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Edit Streamer</span>
                  </button>
                  <button
                    onClick={() => setShowQuickGuide(!showQuickGuide)}
                    className="px-3 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-2xl transition-all shadow-2xs"
                  >
                    {showQuickGuide ? 'Tutup Panduan' : '💡 Panduan'}
                  </button>
                </div>
              </div>

              {/* Collapsible Friendly Quick Guide */}
              {showQuickGuide && (
                <div className="mt-5 pt-4 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white/90 border border-rose-200 rounded-2xl shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center mb-2">1</div>
                    <div className="text-xs font-bold text-slate-900">Pilih Nama Streamer</div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Tap streamer yang baru saja menyelesaikan live streaming sesi hari ini.
                    </div>
                  </div>
                  <div className="p-3.5 bg-white/90 border border-orange-200 rounded-2xl shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center mb-2">2</div>
                    <div className="text-xs font-bold text-slate-900">Ketik Angka Shopee Live</div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Salin angka total penjualan yang tampil di ringkasan layar Shopee setelah live ditutup.
                    </div>
                  </div>
                  <div className="p-3.5 bg-white/90 border border-emerald-200 rounded-2xl shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mb-2">3</div>
                    <div className="text-xs font-bold text-slate-900">Selesai & Otomatis Rekap!</div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Klik simpan! Sistem langsung menghitung total bulanan, grafik tren, & progres target mingguan.
                    </div>
                  </div>
                </div>
              )}

              {/* Streamer Quick Filter Chips */}
              <div className="mt-5 pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-1">Tampilkan:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCreatorId('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCreatorId === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Semua Tim ({creators.length})
                </button>

                {creators.map(c => {
                  const isSelected = selectedCreatorId === c.id;
                  const prog = weeklyProgressList.find(p => p.creatorId === c.id);

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCreatorId(isSelected ? 'all' : c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${c.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shadow-2xs`}>
                        {c.name.slice(0, 1)}
                      </span>
                      <span>{c.name}</span>
                      {prog && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          prog.isAchieved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {prog.percentageIncome}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Target Motivation Ribbon */}
            <WeeklyTargetCard
              weeklyProgressList={weeklyProgressList}
              creators={creators}
              onOpenTargetModal={() => setIsTargetModalOpen(true)}
              onOpenEditCreator={(cId) => {
                setEditingCreatorId(cId);
                setIsCreatorModalOpen(true);
              }}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={(id) => setSelectedCreatorId(id === selectedCreatorId ? 'all' : id)}
            />

            {/* Monthly Calculations by Creator Name & Leaderboard */}
            <MonthlySummary
              summaries={monthlySummaries}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
              onOpenReportForCreator={(cId) => {
                setExportInitialCreatorId(cId);
                setIsExportModalOpen(true);
              }}
              creators={creators}
            />

            {/* Graphic Batang Perbandingan Performa Streamer (Per Hari, Minggu, Bulan, Tahun, dll) */}
            <StreamerComparisonBarChart
              sessions={sessions}
              creators={creators}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
            />

            {/* Periodic Trend Chart Sneak Peek */}
            <TrendCharts
              sessions={sessions}
              creators={creators}
              selectedMonth={selectedMonth}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
            />
          </div>
        )}

        {/* Tab 2: Sesi Live (Log & Data Grid) */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <SessionTable
              sessions={sessions}
              creators={creators}
              selectedMonth={selectedMonth}
              onEditSession={(session) => {
                setEditingSession(session);
                setIsInputModalOpen(true);
              }}
              onDeleteSession={handleDeleteSession}
              onAddNewSession={() => {
                setEditingSession(null);
                setIsInputModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Grafik Tren & Perbandingan Performa Berkala */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Graphic Batang Perbandingan Performa Streamer (Per Hari, Minggu, Bulan, Tahun, dll) */}
            <StreamerComparisonBarChart
              sessions={sessions}
              creators={creators}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
            />

            <TrendCharts
              sessions={sessions}
              creators={creators}
              selectedMonth={selectedMonth}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
            />

            {/* Monthly Summary Table for context */}
            <MonthlySummary
              summaries={monthlySummaries}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
              onOpenReportForCreator={(cId) => {
                setExportInitialCreatorId(cId);
                setIsExportModalOpen(true);
              }}
              creators={creators}
            />
          </div>
        )}

        {/* Tab 4: Target Mingguan & Motivasi */}
        {activeTab === 'targets' && (
          <div className="space-y-6">
            <WeeklyTargetCard
              weeklyProgressList={weeklyProgressList}
              creators={creators}
              onOpenTargetModal={() => setIsTargetModalOpen(true)}
              onOpenEditCreator={(cId) => {
                setEditingCreatorId(cId);
                setIsCreatorModalOpen(true);
              }}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
            />

            {/* Motivation Guidance Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Sistem Reward & Skema Target Streamer
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Setiap streamer yang mencapai target mingguan berhak mendapatkan bonus apresiasi dan penyesuaian tier agensi.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCreatorId(null);
                    setIsCreatorModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all shadow-xs"
                >
                  + Tambah / Atur Kuota Streamer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    🥉 Tier 1: Bronze Host
                  </span>
                  <p className="text-xs text-slate-700 font-semibold">Target Rp 5.000.000 / minggu · 12 jam live</p>
                  <p className="text-[11px] text-slate-600">Bonus voucher traffic boosting & endorsement pool.</p>
                </div>
                <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-sky-900 flex items-center gap-1">
                    🥈 Tier 2: Silver Star
                  </span>
                  <p className="text-xs text-slate-700 font-semibold">Target Rp 7.500.000 / minggu · 15 jam live</p>
                  <p className="text-[11px] text-slate-600">Diskon potongan fee agensi -2% & pin kupon flash sale.</p>
                </div>
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                    🥇 Tier 3: Gold MVP
                  </span>
                  <p className="text-xs text-slate-700 font-semibold">Target Rp 10.000.000+ / minggu · 18 jam live</p>
                  <p className="text-[11px] text-slate-600">Prioritas brand deal eksklusif & bonus tunai performa.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Laporan & Ekspor */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-7 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pusat Unduhan Laporan Administrasi & Slip Gaji Live Streamer
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
                  Ekspor data lengkap sesi siaran, rekap total bulanan per kreator ke format Excel (.xlsx), CSV, atau cetak Slip Pembayaran resmi ke format PDF.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setExportInitialCreatorId('all');
                    setIsExportModalOpen(true);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Buka Dialog Ekspor & Slip PDF</span>
                </button>
              </div>
            </div>

            {/* Preview of Monthly Table below */}
            <MonthlySummary
              summaries={monthlySummaries}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
              selectedCreatorId={selectedCreatorId}
              onSelectCreator={setSelectedCreatorId}
              onOpenReportForCreator={(cId) => {
                setExportInitialCreatorId(cId);
                setIsExportModalOpen(true);
              }}
              creators={creators}
            />
          </div>
        )}

      </main>

      {/* Footer (Compliant with Anti-Slop: quiet copyright and actions) */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="font-medium text-slate-600">
            StreamPulse Income Tracker © 2026 · Sistem Rekapitulasi & Target Live Streamer
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEditingCreatorId(null);
                setIsCreatorModalOpen(true);
              }}
              className="text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              Kelola Streamer ({creators.length})
            </button>
            <span>·</span>
            <button
              onClick={handleResetToSample}
              className="text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium"
              title="Reset ke data awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Contoh</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InputSessionModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setEditingSession(null);
        }}
        creators={creators}
        shifts={shifts}
        onOpenShiftSettings={() => setIsShiftModalOpen(true)}
        onSaveSession={handleSaveSession}
        onAddNewCreator={() => {
          setEditingCreatorId(null);
          setIsCreatorModalOpen(true);
        }}
        editingSession={editingSession}
      />

      <ShiftSettingsModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shifts={shifts}
        onSaveShifts={handleSaveShifts}
      />

      <TargetNotificationModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        weeklyProgressList={weeklyProgressList}
        creators={creators}
        onOpenEditTarget={(creatorId) => {
          setEditingCreatorId(creatorId);
          setIsCreatorModalOpen(true);
        }}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sessions={sessions}
        creators={creators}
        summaries={monthlySummaries}
        selectedMonth={selectedMonth}
        initialCreatorId={exportInitialCreatorId}
      />

      <CreatorManagementModal
        isOpen={isCreatorModalOpen}
        onClose={() => {
          setIsCreatorModalOpen(false);
          setEditingCreatorId(null);
        }}
        creators={creators}
        onSaveCreator={handleSaveCreator}
        onDeleteCreator={handleDeleteCreator}
        editingCreatorId={editingCreatorId}
      />

    </div>
  );
}
