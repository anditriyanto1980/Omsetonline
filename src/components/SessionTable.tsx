import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Calendar, Eye, MessageSquare } from 'lucide-react';
import { LiveSession, Creator, PlatformType } from '../types';
import { formatIDR, formatCompactIDR, formatDateIndo, formatHours } from '../utils/formatters';

interface SessionTableProps {
  sessions: LiveSession[];
  creators: Creator[];
  onEditSession: (session: LiveSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddNewSession: () => void;
  selectedMonth: string;
}

export const SessionTable: React.FC<SessionTableProps> = ({
  sessions,
  creators,
  onEditSession,
  onDeleteSession,
  onAddNewSession,
  selectedMonth
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'gross' | 'net' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const platforms: PlatformType[] = [
    'TikTok Live',
    'Shopee Live',
    'YouTube Live',
    'Twitch',
    'Tokopedia Play',
    'Instagram Live'
  ];

  // Filtering
  const filtered = sessions.filter(s => {
    const matchSearch = searchTerm === '' ||
      s.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCreator = filterCreator === 'all' || s.creatorId === filterCreator;
    const matchPlatform = filterPlatform === 'all' || s.platform === filterPlatform;
    const matchMonth = !selectedMonth || s.date.startsWith(selectedMonth);

    return matchSearch && matchCreator && matchPlatform && matchMonth;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (sortBy === 'gross') {
      comparison = a.grossIncome - b.grossIncome;
    } else if (sortBy === 'net') {
      comparison = a.netIncome - b.netIncome;
    } else if (sortBy === 'duration') {
      comparison = a.durationHours - b.durationHours;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const toggleSort = (field: 'date' | 'gross' | 'net' | 'duration') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalFilteredNet = sorted.reduce((acc, s) => acc + s.netIncome, 0);
  const totalFilteredGross = sorted.reduce((acc, s) => acc + s.grossIncome, 0);
  const totalFilteredHours = sorted.reduce((acc, s) => acc + s.durationHours, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
      
      {/* Top Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kreator atau catatan sesi..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>

          {/* Creator Filter */}
          <select
            value={filterCreator}
            onChange={(e) => setFilterCreator(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Semua Streamer</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">Semua Platform</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Right side: Add New Session button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddNewSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Input Sesi Baru</span>
          </button>
        </div>
      </div>

      {/* Aggregate summary line */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 px-1 pt-1 font-mono">
        <div>
          Menampilkan <strong className="text-slate-900 font-bold">{sorted.length}</strong> sesi siaran live
        </div>
        <div className="flex items-center gap-4">
          <span>Total Durasi: <strong className="text-slate-900">{totalFilteredHours.toFixed(1)} jam</strong></span>
          <span>Total Kotor: <strong className="text-slate-900">{formatCompactIDR(totalFilteredGross)}</strong></span>
          <span>Total Bersih: <strong className="text-emerald-600 font-bold">{formatIDR(totalFilteredNet)}</strong></span>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th
                onClick={() => toggleSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Tanggal & Sesi {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3">Streamer</th>
              <th className="py-3 px-3">Platform</th>
              <th
                onClick={() => toggleSort('duration')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors text-center"
              >
                Durasi {sortBy === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => toggleSort('gross')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                Penghasilan Jualan {sortBy === 'gross' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => toggleSort('net')}
                className="py-3 px-3 cursor-pointer hover:text-emerald-700 transition-colors text-right font-extrabold text-emerald-600"
              >
                Bersih (Net) {sortBy === 'net' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3">Catatan</th>
              <th className="py-3 px-3 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(session => {
              const creator = creators.find(c => c.id === session.creatorId);

              return (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  {/* Date & Time Slot */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono">{formatDateIndo(session.date)}</div>
                    <div className="text-[10px] text-slate-500 capitalize font-medium">
                      Sesi {session.timeSlot}
                      {session.peakViewers > 0 && (
                        <span> · {session.peakViewers.toLocaleString()} views</span>
                      )}
                    </div>
                  </td>

                  {/* Creator */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${creator?.avatarColor || 'from-rose-500 to-indigo-500'} flex items-center justify-center font-bold text-white text-[10px] shadow-xs`}>
                        {session.creatorName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{session.creatorName}</span>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-slate-700 font-semibold">
                      {session.platform}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3 text-center font-mono text-slate-700 whitespace-nowrap font-medium">
                    {formatHours(session.durationHours)}
                  </td>

                  {/* Sales Gross Income */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatIDR(session.salesIncome ?? session.grossIncome)}
                  </td>

                  {/* Net */}
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600 whitespace-nowrap">
                    {formatIDR(session.netIncome)}
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-3 max-w-[200px] truncate text-slate-600 font-medium" title={session.notes || ''}>
                    {session.notes || '-'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {confirmDeleteId === session.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteSession(session.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                          title="Konfirmasi Hapus"
                        >
                          Hapus!
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditSession(session)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Sesi"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(session.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">
                  <div className="text-sm font-medium">Tidak ada sesi live yang cocok dengan filter.</div>
                  <button
                    onClick={onAddNewSession}
                    className="mt-3 text-xs text-rose-600 font-bold hover:underline"
                  >
                    + Input Sesi Live Baru Sekarang
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
