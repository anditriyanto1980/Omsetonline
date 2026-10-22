import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Users, Settings, Edit3, Trash2, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Creator } from '../types';
import { formatIDR } from '../utils/formatters';

interface CreatorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  creators: Creator[];
  onSaveCreator: (creator: Creator) => void;
  onDeleteCreator?: (creatorId: string) => void;
  editingCreatorId?: string | null;
}

const AVATAR_GRADIENTS = [
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-indigo-600',
  'from-blue-600 to-sky-400'
];

export const CreatorManagementModal: React.FC<CreatorManagementModalProps> = ({
  isOpen,
  onClose,
  creators,
  onSaveCreator,
  onDeleteCreator,
  editingCreatorId
}) => {
  // Mode: 'list' (view all streamers with edit buttons) or 'edit' (edit form)
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [handle, setHandle] = useState<string>('');
  const [category, setCategory] = useState<string>('Beauty & Skincare');
  const [weeklyTargetIncome, setWeeklyTargetIncome] = useState<number>(5000000);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(15);
  const [agencyCutPercent, setAgencyCutPercent] = useState<number>(10);
  const [avatarColor, setAvatarColor] = useState<string>(AVATAR_GRADIENTS[0]);
  const [phone, setPhone] = useState<string>('');
  const [notificationMsg, setNotificationMsg] = useState<string>('');

  // Handle open / props change
  useEffect(() => {
    if (!isOpen) return;

    if (editingCreatorId) {
      // Direct edit request
      loadCreatorForEdit(editingCreatorId);
    } else {
      // Default to list view so user can choose whom to edit or add
      setViewMode('list');
      setCurrentId(null);
    }
  }, [editingCreatorId, isOpen]);

  const loadCreatorForEdit = (id: string) => {
    const existing = creators.find(c => c.id === id);
    if (existing) {
      setCurrentId(existing.id);
      setName(existing.name);
      setHandle(existing.handle);
      setCategory(existing.category);
      setWeeklyTargetIncome(existing.weeklyTargetIncome);
      setWeeklyTargetHours(existing.weeklyTargetHours);
      setAgencyCutPercent(existing.agencyCutPercent);
      setAvatarColor(existing.avatarColor);
      setPhone(existing.phone || '');
      setViewMode('edit');
    }
  };

  const handleAddNewClick = () => {
    setCurrentId(null);
    setName('');
    setHandle('@');
    setCategory('Beauty & Skincare');
    setWeeklyTargetIncome(5000000);
    setWeeklyTargetHours(15);
    setAgencyCutPercent(10);
    setAvatarColor(AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)]);
    setPhone('');
    setViewMode('edit');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const creatorData: Creator = {
      id: currentId || `c-${Date.now()}`,
      name: name.trim(),
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      category: category.trim(),
      weeklyTargetIncome: Number(weeklyTargetIncome) || 1000000,
      weeklyTargetHours: Number(weeklyTargetHours) || 10,
      agencyCutPercent: Number(agencyCutPercent) || 0,
      avatarColor,
      phone: phone.trim(),
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onSaveCreator(creatorData);
    setNotificationMsg(`Data streamer "${creatorData.name}" berhasil disimpan!`);
    setTimeout(() => {
      setNotificationMsg('');
      setViewMode('list');
    }, 1000);
  };

  const handleDelete = (id: string, cName: string) => {
    if (creators.length <= 1) {
      alert('Minimal harus ada 1 streamer yang terdaftar.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus streamer "${cName}" dari daftar?`)) {
      if (onDeleteCreator) {
        onDeleteCreator(id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 my-6 transition-all">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                {viewMode === 'list' 
                  ? 'Kelola & Edit Nama Streamer' 
                  : (currentId ? 'Edit Nama & Profil Streamer' : 'Tambah Streamer Baru')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {viewMode === 'list'
                  ? 'Klik tombol "Edit" untuk mengubah nama, target mingguan, atau fee komisi streamer.'
                  : 'Nama yang diubah akan otomatis diperbarui di seluruh rekapitulasi data.'}
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

        {/* Success toast */}
        {notificationMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* View Mode 1: List with Edit Buttons */}
        {viewMode === 'list' ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Daftar Streamer Aktif ({creators.length}):
              </span>
              <button
                type="button"
                onClick={handleAddNewClick}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Streamer Baru</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {creators.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Avatar & details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.avatarColor} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}>
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold font-mono">
                          {c.handle}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-0.5">
                        <span>{c.category}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-semibold">
                          Target: {formatIDR(c.weeklyTargetIncome)}/mgg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => loadCreatorForEdit(c.id)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      title="Ubah nama dan pengaturan profil"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Nama</span>
                    </button>
                    {onDeleteCreator && creators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Hapus streamer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="italic">💡 Tips: Mengubah nama streamer akan otomatis memperbarui nama pada semua riwayat penjualan live.</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* View Mode 2: Edit Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Streamer</span>
              </button>
              {currentId && (
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {currentId}
                </span>
              )}
            </div>

            {/* Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Nama Lengkap Streamer <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Sarah Anindya"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  autoFocus
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nama ini akan tampil di seluruh laporan & leaderboard.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Handle Akun / Username
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@sarah.live"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Produk Live
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Beauty, Fashion, Host Shopping, dll"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Kontak / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Target Mingguan (Uang & Jam) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-indigo-700 tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Target Mingguan & Motivasi Streamer</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Penjualan Mingguan (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">Rp</span>
                    <input
                      type="number"
                      step="500000"
                      min="100000"
                      value={weeklyTargetIncome}
                      onChange={(e) => setWeeklyTargetIncome(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block font-semibold">
                    Setara: {formatIDR(weeklyTargetIncome)} / minggu
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Jam Live Mingguan
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="80"
                      value={weeklyTargetHours}
                      onChange={(e) => setWeeklyTargetHours(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <span className="text-xs text-slate-500 font-bold shrink-0">jam/minggu</span>
                  </div>
                </div>
              </div>

              {/* Potongan Agensi */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">Potongan Agensi / Fee Manajemen:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={agencyCutPercent}
                    onChange={(e) => setAgencyCutPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 text-xs"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Color theme for avatar */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">
                Pilih Warna Avatar
              </label>
              <div className="flex items-center gap-3">
                {AVATAR_GRADIENTS.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarColor(grad)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} transition-all ${
                      avatarColor === grad ? 'ring-3 ring-indigo-600 scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Streamer</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
