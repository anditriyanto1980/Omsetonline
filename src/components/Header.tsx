import React from 'react';
import { Plus, Radio, Award, Clock, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'sessions' | 'trends' | 'targets' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'sessions' | 'trends' | 'targets' | 'reports') => void;
  onOpenNewSession: () => void;
  onOpenTargetModal: () => void;
  onOpenShiftModal?: () => void;
  onOpenCreatorModal?: () => void;
  totalWeeklyAchievedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSession,
  onOpenTargetModal,
  onOpenShiftModal,
  onOpenCreatorModal,
  totalWeeklyAchievedCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <a href="/" className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
              StreamPulse <span className="text-rose-600 font-semibold text-sm">Income</span>
            </a>
          </div>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Ringkasan Bulanan
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'sessions'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Catatan Sesi Live
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'trends'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Grafik Tren
            </button>
            <button
              onClick={() => setActiveTab('targets')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 relative ${
                activeTab === 'targets'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Target Mingguan
              {totalWeeklyAchievedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-full font-mono border border-emerald-200">
                  {totalWeeklyAchievedCount} Goal
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reports'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Laporan & Ekspor
            </button>
          </nav>

          {/* Zone 3: Quick Settings & Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenShiftModal && (
              <button
                onClick={onOpenShiftModal}
                title="Atur Jam Shift Live Streaming"
                className="px-2.5 py-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-all text-xs font-bold hidden sm:flex items-center gap-1.5 shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Jam Shift</span>
              </button>
            )}

            {onOpenCreatorModal && (
              <button
                onClick={onOpenCreatorModal}
                title="Kelola & Edit Nama Streamer"
                className="px-2.5 py-1.5 text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-all text-xs font-bold hidden sm:flex items-center gap-1.5 shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit Streamer</span>
              </button>
            )}

            <button
              onClick={onOpenTargetModal}
              title="Cek Notifikasi Target Mingguan"
              className="p-2 sm:px-2.5 sm:py-1.5 text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span className="hidden xl:inline">Target</span>
            </button>

            <button
              onClick={onOpenNewSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-indigo-600 rounded-xl hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-500/20 transition-all transform active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Input Penjualan Live</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-slate-200 overflow-x-auto text-xs gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'sessions' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Sesi Live
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'trends' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Grafik
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'targets' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Target
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'reports' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Ekspor
          </button>
          {onOpenShiftModal && (
            <button
              onClick={onOpenShiftModal}
              className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold whitespace-nowrap shrink-0"
            >
              ⏰ Shift
            </button>
          )}
          {onOpenCreatorModal && (
            <button
              onClick={onOpenCreatorModal}
              className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold whitespace-nowrap shrink-0"
            >
              👥 Streamer
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
