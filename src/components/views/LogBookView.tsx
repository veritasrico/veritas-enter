import React, { useState } from 'react';
import { History, Search, Filter, CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';
import { LogEntry } from '../../types';

interface LogBookViewProps {
  logs: LogEntry[];
  isAdmin?: boolean;
  onClearLogs?: () => void;
}

export const LogBookView: React.FC<LogBookViewProps> = ({ logs, isAdmin = false, onClearLogs }) => {
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('Semua');

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.user.toLowerCase().includes(q) ||
      l.mod.toLowerCase().includes(q) ||
      l.ref.toLowerCase().includes(q) ||
      (l.note || '').toLowerCase().includes(q);

    const matchAction =
      actionFilter === 'Semua'
        ? true
        : actionFilter === 'Selesai Proses'
        ? l.action === 'Selesai Proses'
        : l.action === actionFilter;

    return matchSearch && matchAction;
  });

  const completedCount = logs.filter((l) => l.action === 'Selesai Proses').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-600" />
            <span>Log Book &amp; Audit Trail Sistem</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActionFilter(actionFilter === 'Selesai Proses' ? 'Semua' : 'Selesai Proses')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              actionFilter === 'Selesai Proses'
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Hanya Log Instrumen Selesai ({completedCount})</span>
          </button>

          {isAdmin && onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-700 transition shadow-2xs active:scale-95"
              title="Hapus seluruh riwayat Log Book untuk memulai audit baru (Khusus Admin)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus History Log Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengguna, modul, instrumen, sampel, atau rincian log..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Aksi:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Aksi</option>
            <option value="Selesai Proses">Selesai Proses (Otomatis Instrumen)</option>
            <option value="Tambah">Tambah Data</option>
            <option value="Ubah">Ubah Data</option>
            <option value="Hapus">Hapus Data</option>
            <option value="Impor">Impor Excel / JSON</option>
            <option value="Masuk">Masuk (Login)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-bold">Waktu</th>
              <th className="py-3 px-4 font-bold">Pengguna</th>
              <th className="py-3 px-4 font-bold">Aksi</th>
              <th className="py-3 px-4 font-bold">Modul</th>
              <th className="py-3 px-4 font-bold">Referensi / Data</th>
              <th className="py-3 px-4 font-bold">Detail Perubahan / Sistem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Tidak ada catatan log audit yang sesuai.
                </td>
              </tr>
            ) : (
              filteredLogs.slice().reverse().map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(l.ts).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {l.user}
                    {l.role && <span className="block text-[10px] text-slate-400">({l.role})</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        l.action === 'Selesai Proses'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : l.action === 'Tambah'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : l.action === 'Hapus'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {l.mod}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {l.ref}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] max-w-sm">
                    {l.note}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
