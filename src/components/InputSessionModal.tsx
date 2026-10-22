import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, ShoppingBag, Clock, User, Calendar, Check, HelpCircle, RotateCcw, Settings } from 'lucide-react';
import { Creator, LiveSession, PlatformType, TimeSlot, ShiftSetting } from '../types';
import { formatIDR } from '../utils/formatters';

interface InputSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  creators: Creator[];
  shifts: ShiftSetting[];
  onOpenShiftSettings: () => void;
  onSaveSession: (session: Omit<LiveSession, 'id' | 'createdAt'>) => void;
  onAddNewCreator: () => void;
  editingSession?: LiveSession | null;
}

const PLATFORMS: { name: PlatformType; badge: string; color: string; border: string; bg: string }[] = [
  { name: 'Shopee Live', badge: 'Shopee', color: 'text-orange-600', border: 'border-orange-300', bg: 'bg-orange-50' },
  { name: 'TikTok Live', badge: 'TikTok', color: 'text-slate-900', border: 'border-slate-400', bg: 'bg-slate-100' },
  { name: 'YouTube Live', badge: 'YouTube', color: 'text-red-600', border: 'border-red-300', bg: 'bg-red-50' },
  { name: 'Tokopedia Play', badge: 'Tokopedia', color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' },
  { name: 'Instagram Live', badge: 'Instagram', color: 'text-pink-600', border: 'border-pink-300', bg: 'bg-pink-50' },
  { name: 'Twitch', badge: 'Twitch', color: 'text-purple-600', border: 'border-purple-300', bg: 'bg-purple-50' }
];

export const InputSessionModal: React.FC<InputSessionModalProps> = ({
  isOpen,
  onClose,
  creators,
  shifts,
  onOpenShiftSettings,
  onSaveSession,
  onAddNewCreator,
  editingSession
}) => {
  const [creatorId, setCreatorId] = useState<string>('');
  const [date, setDate] = useState<string>('2026-10-21');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [platform, setPlatform] = useState<PlatformType>('Shopee Live');
  const [durationHours, setDurationHours] = useState<number>(3.0);
  const [peakViewers, setPeakViewers] = useState<number>(1200);
  
  // Single sales revenue input (sesuai dashboard Shopee Live)
  const [salesIncome, setSalesIncome] = useState<number>(1500000);
  const [agencyCutPercent, setAgencyCutPercent] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showHelper, setShowHelper] = useState<boolean>(false);

  // Active shifts list
  const activeShifts = shifts.filter(s => s.isActive);

  useEffect(() => {
    if (editingSession) {
      setCreatorId(editingSession.creatorId);
      setDate(editingSession.date);
      setTimeSlot(editingSession.timeSlot);
      setPlatform(editingSession.platform);
      setDurationHours(editingSession.durationHours);
      setPeakViewers(editingSession.peakViewers || 0);
      setSalesIncome(editingSession.salesIncome ?? editingSession.grossIncome ?? 0);
      setAgencyCutPercent(editingSession.agencyCutPercent || 0);
      setNotes(editingSession.notes || '');
    } else {
      if (creators.length > 0 && !creatorId) {
        setCreatorId(creators[0].id);
        setAgencyCutPercent(creators[0].agencyCutPercent || 10);
      }
      if (activeShifts.length > 0 && !timeSlot) {
        setTimeSlot(activeShifts[0].name);
      }
    }
  }, [editingSession, creators, creatorId, activeShifts, timeSlot]);

  const handleCreatorChange = (newCreatorId: string) => {
    setCreatorId(newCreatorId);
    const selected = creators.find(c => c.id === newCreatorId);
    if (selected) {
      setAgencyCutPercent(selected.agencyCutPercent || 0);
    }
  };

  const grossTotal = Number(salesIncome) || 0;
  const agencyDeduction = (grossTotal * (Number(agencyCutPercent) || 0)) / 100;
  const netTotal = Math.max(0, grossTotal - agencyDeduction);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorId) {
      setErrorMsg('Pilih nama streamer terlebih dahulu ya!');
      return;
    }
    if (durationHours <= 0) {
      setErrorMsg('Durasi live harus lebih dari 0 jam.');
      return;
    }
    if (grossTotal <= 0) {
      setErrorMsg('Masukkan nominal angka penghasilan jualan live yang valid (harus lebih dari 0).');
      return;
    }

    const selectedCreator = creators.find(c => c.id === creatorId);
    if (!selectedCreator) return;

    const matchedShift = activeShifts.find(s => s.name === timeSlot || s.id === timeSlot);
    const shiftLabel = matchedShift
      ? `${matchedShift.name} (${matchedShift.startTime} - ${matchedShift.endTime})`
      : timeSlot;

    onSaveSession({
      creatorId,
      creatorName: selectedCreator.name,
      date,
      timeSlot: matchedShift?.name || timeSlot,
      shiftId: matchedShift?.id,
      shiftLabel,
      durationHours: Number(durationHours),
      platform,
      salesIncome: grossTotal,
      grossIncome: grossTotal,
      agencyCutPercent: Number(agencyCutPercent) || 0,
      netIncome: Math.round(netTotal),
      peakViewers: Number(peakViewers) || 0,
      notes: notes.trim()
    });

    onClose();
  };

  const addSalesPreset = (amount: number) => {
    setSalesIncome(prev => (Number(prev) || 0) + amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 my-6 transition-all">
        
        {/* Friendly Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                {editingSession ? 'Edit Sesi Live' : 'Catat Hasil Live Hari Ini'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Selesai live? Masukkan angka penjualan dashboard Shopee dan sistem otomatis merekap sesuai nama & shift! ✨
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* Step 1: Siapa yang baru selesai live? (Friendly visual chips) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] flex items-center justify-center font-bold">1</span>
                Pilih Streamer yang Live:
              </label>
              <button
                type="button"
                onClick={onAddNewCreator}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1"
              >
                + Tambah / Edit Streamer
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {creators.map(c => {
                const isSelected = creatorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCreatorChange(c.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 shadow-xs ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${c.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.handle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: SINGLE CLEAN INPUT - Penghasilan Jualan Live (Dashboard Shopee) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white border-2 border-orange-200 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-orange-950 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-4 h-4 rounded-full bg-orange-200 text-orange-900 text-[10px] flex items-center justify-center font-bold">2</span>
                Angka Penghasilan Jualan Live (Shopee):
              </label>
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="text-xs text-orange-700 hover:text-orange-900 font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Lihat Panduan</span>
              </button>
            </div>

            {showHelper && (
              <div className="p-3 bg-white/90 border border-orange-200 rounded-xl text-xs text-slate-700 leading-relaxed font-normal">
                💡 <strong>Cara Cek di Shopee Live:</strong> Buka aplikasi Shopee &gt; Live Streaming &gt; Saat klik selesai siaran, akan muncul layar ringkasan <em>"Laporan Sesi Live"</em> yang mencantumkan total <strong>Penjualan / Pendapatan Sesi</strong>. Masukkan nominal angka tersebut ke kolom di bawah ini.
              </div>
            )}

            {/* Main prominent number input */}
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-black text-orange-400">Rp</span>
              <input
                type="number"
                min="0"
                step="50000"
                value={salesIncome}
                onChange={(e) => setSalesIncome(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-white border-2 border-orange-400 focus:border-orange-600 rounded-2xl pl-12 pr-4 py-3 text-2xl font-mono font-black text-slate-900 focus:outline-none shadow-sm transition-all"
                required
              />
            </div>

            {/* Real-time formatted readout & Quick Add presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-orange-700 font-mono bg-orange-100/70 px-2.5 py-1 rounded-lg">
                Nilai Terbaca: {formatIDR(grossTotal)}
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Tambah cepat:</span>
                <button
                  type="button"
                  onClick={() => addSalesPreset(500000)}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 text-slate-800 rounded-lg shadow-2xs transition-all active:scale-95"
                >
                  +500rb
                </button>
                <button
                  type="button"
                  onClick={() => addSalesPreset(1000000)}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 text-slate-800 rounded-lg shadow-2xs transition-all active:scale-95"
                >
                  +1jt
                </button>
                <button
                  type="button"
                  onClick={() => addSalesPreset(2500000)}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 text-slate-800 rounded-lg shadow-2xs transition-all active:scale-95"
                >
                  +2.5jt
                </button>
                <button
                  type="button"
                  onClick={() => setSalesIncome(0)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  title="Reset angka ke 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Net Payout Strip */}
            <div className="pt-2.5 border-t border-orange-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Potongan Agensi (opsional):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={agencyCutPercent}
                    onChange={(e) => setAgencyCutPercent(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-center font-mono font-bold text-slate-900 text-xs"
                  />
                  <span className="text-slate-500 font-medium">%</span>
                </div>
                {agencyCutPercent > 0 && (
                  <span className="text-slate-500 font-mono text-[11px]">
                    (-{formatIDR(agencyDeduction)})
                  </span>
                )}
              </div>

              <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-2 shadow-2xs">
                <span className="text-emerald-900 font-extrabold text-xs">Penghasilan Bersih:</span>
                <span className="text-base font-black text-emerald-800 font-mono">{formatIDR(netTotal)}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Platform, Jam Shift & Durasi (Configurable Shift Hours) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] flex items-center justify-center font-bold">3</span>
              Pilih Jam Shift & Platform:
            </label>

            {/* Shift Selector Buttons with Quick Configure Trigger */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Jam Shift yang Berlaku:
                </span>
                <button
                  type="button"
                  onClick={onOpenShiftSettings}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <Settings className="w-3 h-3" />
                  <span>Setting Jam Shift</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeShifts.map(shift => {
                  const isSelected = timeSlot === shift.name || timeSlot === shift.id;
                  return (
                    <button
                      type="button"
                      key={shift.id}
                      onClick={() => setTimeSlot(shift.name)}
                      className={`p-2 rounded-xl text-xs transition-all border text-center ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-2xs ring-2 ring-amber-200'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-extrabold">{shift.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-semibold">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Selector Buttons */}
            <div>
              <div className="text-[11px] text-slate-500 font-medium mb-1.5">Platform:</div>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map(p => {
                  const isSelected = platform === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setPlatform(p.name)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? `${p.bg} ${p.border} ${p.color} ring-2 ring-slate-200 shadow-2xs`
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{p.badge}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration, Date & Optional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1">Durasi Live:</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 3.5, 4].map(hrs => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`px-2 py-1 text-xs rounded-lg font-bold border font-mono ${
                        durationHours === hrs
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {hrs}j
                    </button>
                  ))}
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="24"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-slate-50 border border-slate-300 rounded-lg px-1 py-1 text-xs font-mono font-bold text-center text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1">Tanggal Sesi:</div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1">Catatan Singkat:</div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Flash sale 12 siang"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 rounded-xl shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingSession ? 'Simpan Perubahan Sesi' : '✨ Simpan & Update Rekap'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
