import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Award, Flame, Share2, Check, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { WeeklyProgress, Creator } from '../types';
import { formatIDR, formatCompactIDR, getWeekRange } from '../utils/formatters';

interface TargetNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyProgressList: WeeklyProgress[];
  creators: Creator[];
  onOpenEditTarget: (creatorId: string) => void;
}

export const TargetNotificationModal: React.FC<TargetNotificationModalProps> = ({
  isOpen,
  onClose,
  weeklyProgressList,
  creators,
  onOpenEditTarget
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Find the top performer or first achieved streamer to highlight
      const achieved = weeklyProgressList.find(p => p.isAchieved);
      if (achieved) {
        setSelectedCreatorId(achieved.creatorId);
      } else if (weeklyProgressList.length > 0 && !selectedCreatorId) {
        setSelectedCreatorId(weeklyProgressList[0].creatorId);
      }

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, weeklyProgressList]);

  if (!isOpen) return null;

  const currentItem = weeklyProgressList.find(p => p.creatorId === selectedCreatorId) || weeklyProgressList[0];
  const currentCreator = creators.find(c => c.id === currentItem?.creatorId);
  const weekInfo = getWeekRange(new Date());

  const generateMotivationMessage = (p: WeeklyProgress) => {
    if (p.isExceeded) {
      return `🎉 LUAR BIASA! Selamat @${p.creatorName}! Kamu resmi melampaui TARGET MINGGUAN (${p.percentageIncome}%) dengan total pendapatan ${formatIDR(p.currentIncome)} dari target ${formatIDR(p.targetIncome)}. Pertahankan ritme streaming juara kamu! 🚀🔥`;
    }
    if (p.isAchieved) {
      return `🏆 GOAL ACHIEVED! Hebat sekali @${p.creatorName}! Target mingguan ${formatIDR(p.targetIncome)} berhasil tercapai 100% di minggu ini! Tetap konsisten dan gaspol untuk bonus tier berikutnya! ✨`;
    }
    if (p.percentageIncome >= 70) {
      return `⚡ SEDIKIT LAGI @${p.creatorName}! Progres mingguanmu sudah ${p.percentageIncome}% (${formatIDR(p.currentIncome)}). Kurang ${formatIDR(p.remainingIncome)} lagi untuk tembus target mingguan. 1 sesi live lagi pasti tembus! 💪`;
    }
    return `🎯 SEMANGAT LIVE STREAMING @${p.creatorName}! Kamu sudah mengumpulkan ${formatIDR(p.currentIncome)} minggu ini. Masih ada sisa hari untuk capai target mingguan ${formatIDR(p.targetIncome)}. Jadwalkan live terbaikmu! 🌟`;
  };

  const handleCopyMessage = () => {
    if (!currentItem) return;
    const msg = generateMotivationMessage(currentItem);
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-600">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Notifikasi Target Mingguan
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Periode: {weekInfo.start} s/d {weekInfo.end}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streamer Tab Selector */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {weeklyProgressList.map(item => {
            const isSelected = item.creatorId === selectedCreatorId;
            return (
              <button
                key={item.creatorId}
                onClick={() => setSelectedCreatorId(item.creatorId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{item.creatorName}</span>
                {item.isAchieved && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    ✓ {item.percentageIncome}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Highlight Card */}
        {currentItem && (
          <div className="mt-4 space-y-4">
            <div className={`p-5 rounded-xl border relative overflow-hidden ${
              currentItem.isAchieved
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              
              {/* Creator details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentCreator?.avatarColor || 'from-rose-500 to-indigo-500'} flex items-center justify-center font-bold text-white text-base shadow-sm`}>
                    {currentItem.creatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {currentItem.creatorName}
                      {currentItem.isExceeded && (
                        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 shadow-2xs">
                          <Flame className="w-3.5 h-3.5 text-amber-600" /> MVP Tier
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {currentCreator?.handle} · {currentCreator?.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-black font-mono ${
                    currentItem.isAchieved ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {currentItem.percentageIncome}%
                  </div>
                  <span className={`text-[11px] font-bold ${
                    currentItem.isAchieved ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {currentItem.statusLabel}
                  </span>
                </div>
              </div>

              {/* Progress Bar with milestone ticks */}
              <div className="mt-5">
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-600">
                    Tercapai: <strong className="text-slate-900 font-bold">{formatIDR(currentItem.currentIncome)}</strong>
                  </span>
                  <span className="text-slate-600">
                    Target: <strong className="text-slate-900 font-bold">{formatIDR(currentItem.targetIncome)}</strong>
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      currentItem.isAchieved
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : currentItem.percentageIncome >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-indigo-500 to-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, currentItem.percentageIncome)}%` }}
                  />
                </div>

                {/* Milestone breakdown */}
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono font-medium">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span className={currentItem.isAchieved ? 'text-emerald-700 font-bold' : ''}>100% Target</span>
                </div>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 text-center">
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium">Total Jam Live</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                    {currentItem.currentHours.toFixed(1)}j / {currentItem.targetHours}j
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium">Sesi Minggu Ini</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                    {currentItem.sessionCount} Sesi
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentItem.isAchieved ? 'Surplus Bonus' : 'Sisa Kekurangan'}
                  </div>
                  <div className={`text-xs font-extrabold font-mono mt-0.5 ${
                    currentItem.isAchieved ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {currentItem.isAchieved 
                      ? `+${formatCompactIDR(currentItem.currentIncome - currentItem.targetIncome)}`
                      : `-${formatCompactIDR(currentItem.remainingIncome)}`}
                  </div>
                </div>
              </div>

            </div>

            {/* Motivational message generator */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  Format Pesan Motivasi WhatsApp / Discord:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedMsg ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed font-sans select-all shadow-2xs">
                {generateMotivationMessage(currentItem)}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => onOpenEditTarget(currentItem.creatorId)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                ⚙️ Sesuaikan Target Mingguan ({currentItem.creatorName})
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
