import React from 'react';
import { Target, Award, Flame, Bell, Clock, DollarSign, MessageCircle, Sparkles } from 'lucide-react';
import { WeeklyProgress, Creator } from '../types';
import { formatIDR, formatCompactIDR, getWeekRange } from '../utils/formatters';

interface WeeklyTargetCardProps {
  weeklyProgressList: WeeklyProgress[];
  creators: Creator[];
  onOpenTargetModal: () => void;
  onOpenEditCreator: (creatorId: string) => void;
  selectedCreatorId: string;
  onSelectCreator: (id: string) => void;
}

export const WeeklyTargetCard: React.FC<WeeklyTargetCardProps> = ({
  weeklyProgressList,
  creators,
  onOpenTargetModal,
  onOpenEditCreator,
  selectedCreatorId,
  onSelectCreator
}) => {
  const weekInfo = getWeekRange(new Date());
  const achievedCount = weeklyProgressList.filter(p => p.isAchieved).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 shadow-2xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              Target & Motivasi Mingguan
              <span className="text-[11px] font-medium text-slate-500 font-mono">
                ({weekInfo.start} s/d {weekInfo.end})
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {achievedCount} dari {weeklyProgressList.length} streamer telah berhasil menembus target minggu ini. Tetap semangat! 💪
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTargetModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl transition-all active:scale-95 whitespace-nowrap shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Kirim Pesan Motivasi WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Grid of Creators Weekly Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weeklyProgressList.map(prog => {
          const creator = creators.find(c => c.id === prog.creatorId);
          const isSelected = selectedCreatorId === prog.creatorId;

          return (
            <div
              key={prog.creatorId}
              onClick={() => onSelectCreator(prog.creatorId)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-rose-50/40 border-rose-500 shadow-sm ring-2 ring-rose-200'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
              }`}
            >
              {/* Creator Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${creator?.avatarColor || 'from-rose-500 to-indigo-500'} flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0`}>
                    {prog.creatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      {prog.creatorName}
                      {prog.isExceeded && (
                        <span className="p-0.5 rounded-full bg-amber-100 text-amber-700" title="Target Terlampaui!">
                          <Flame className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {creator?.handle} · {creator?.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-black font-mono ${
                    prog.isAchieved ? 'text-emerald-700' : 'text-slate-900'
                  }`}>
                    {prog.percentageIncome}%
                  </div>
                  <span className={`text-[10px] font-bold block ${
                    prog.isAchieved ? 'text-emerald-700' : prog.percentageIncome >= 70 ? 'text-amber-700' : 'text-slate-500'
                  }`}>
                    {prog.statusLabel}
                  </span>
                </div>
              </div>

              {/* Progress bar with smooth curves */}
              <div className="mt-3.5">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prog.isAchieved
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : prog.percentageIncome >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-indigo-500 to-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, prog.percentageIncome)}%` }}
                  />
                </div>
              </div>

              {/* Friendly Remaining Target Hint */}
              <div className="mt-2 text-xs font-semibold">
                {prog.isAchieved ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Target minggu ini sudah tercapai! Hebat banget! 🌟
                  </span>
                ) : (
                  <span className="text-slate-600">
                    Kurang <strong className="text-rose-600 font-mono font-bold">{formatIDR(prog.remainingIncome)}</strong> lagi untuk tembus target mingguan.
                  </span>
                )}
              </div>

              {/* Stats footer */}
              <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-200/80">
                <div className="flex items-center gap-1 text-slate-600 font-mono">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-900 font-bold">{formatCompactIDR(prog.currentIncome)}</span>
                  <span>/ {formatCompactIDR(prog.targetIncome)}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{prog.currentHours.toFixed(1)}j / {prog.targetHours}j</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTargetModal();
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Pesan
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditCreator(prog.creatorId);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold hover:underline"
                  >
                    Edit Target
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
