import React, { useState } from 'react';
import { X, Clock, Plus, Trash2, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { ShiftSetting } from '../types';
import { INITIAL_SHIFTS } from '../utils/mockData';

interface ShiftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: ShiftSetting[];
  onSaveShifts: (shifts: ShiftSetting[]) => void;
}

const COLOR_OPTIONS = [
  { name: 'amber', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { name: 'orange', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
  { name: 'rose', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
  { name: 'indigo', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { name: 'emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { name: 'purple', bg: 'bg-purple-100 text-purple-800 border-purple-300' }
];

export const ShiftSettingsModal: React.FC<ShiftSettingsModalProps> = ({
  isOpen,
  onClose,
  shifts,
  onSaveShifts
}) => {
  const [localShifts, setLocalShifts] = useState<ShiftSetting[]>(shifts);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newShiftName, setNewShiftName] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('00:00');
  const [newEndTime, setNewEndTime] = useState<string>('04:00');
  const [newColor, setNewColor] = useState<string>('purple');
  const [successMsg, setSuccessMsg] = useState<string>('');

  React.useEffect(() => {
    setLocalShifts(shifts);
  }, [shifts, isOpen]);

  if (!isOpen) return null;

  const handleUpdateShift = (id: string, field: keyof ShiftSetting, value: any) => {
    setLocalShifts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDeleteShift = (id: string) => {
    if (localShifts.length <= 1) {
      alert('Minimal harus ada 1 shift live streaming aktif.');
      return;
    }
    setLocalShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleAddNewShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftName.trim()) return;

    const newShift: ShiftSetting = {
      id: `shift-${Date.now()}`,
      name: newShiftName.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      tagColor: newColor,
      isActive: true
    };

    setLocalShifts(prev => [...prev, newShift]);
    setIsAddingNew(false);
    setNewShiftName('');
    setNewStartTime('00:00');
    setNewEndTime('04:00');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Kembalikan pengaturan shift ke jam default (Pagi 08-12, Siang 12-16, Sore 16-19, Malam 19-24)?')) {
      setLocalShifts(INITIAL_SHIFTS);
    }
  };

  const handleSaveAll = () => {
    onSaveShifts(localShifts);
    setSuccessMsg('Pengaturan jam shift berhasil disimpan!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 my-6 transition-all">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Atur Jam Shift Live Streaming
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Sesuaikan nama shift dan rentang jam siaran sesuai aturan operasional agensi Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* List of Shifts */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Daftar Shift yang Berlaku:</span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Jam Default</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {localShifts.map((shift, idx) => (
              <div
                key={shift.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
              >
                {/* Shift Name Input */}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">
                    Nama Shift #{idx + 1}
                  </label>
                  <input
                    type="text"
                    value={shift.name}
                    onChange={(e) => handleUpdateShift(shift.id, 'name', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Shift Pagi"
                  />
                </div>

                {/* Start Time */}
                <div className="w-24">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => handleUpdateShift(shift.id, 'startTime', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-amber-500"
                  />
                </div>

                <span className="text-slate-400 font-bold self-end pb-2">s/d</span>

                {/* End Time */}
                <div className="w-24">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) => handleUpdateShift(shift.id, 'endTime', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Delete button */}
                <div className="self-end pb-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeleteShift(shift.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus shift ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form to add a new shift */}
          {isAddingNew ? (
            <form onSubmit={handleAddNewShift} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3 mt-3">
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-700" />
                <span>Tambah Shift Baru</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Nama Shift:</label>
                  <input
                    type="text"
                    required
                    value={newShiftName}
                    onChange={(e) => setNewShiftName(e.target.value)}
                    placeholder="Contoh: Shift Dini Hari"
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Mulai:</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Selesai:</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs transition-all"
                >
                  Tambahkan Shift
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-3 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 rounded-2xl text-xs font-bold text-slate-600 hover:text-amber-800 flex items-center justify-center gap-1.5 transition-all mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Jam Shift Baru (Misal: Shift Dini Hari / Midnight)</span>
            </button>
          )}

        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            *Shift yang tersimpan akan langsung muncul saat input sesi live.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl shadow-md shadow-amber-600/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Jam Shift</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
