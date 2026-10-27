import React, { useState } from 'react';
import { Plus, Search, MessageCircle, Edit2, Trash2, FileSpreadsheet, Download, Upload, Sparkles } from 'lucide-react';
import { Account, Deal } from '../../types';
import { INDUSTRIES, SOURCES, idr, uid } from '../../utils/seedData';

interface AccountsViewProps {
  accounts: Account[];
  deals: Deal[];
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onOpenWa: (acc: Account, templateId?: string) => void;
  onOpenImportExcel?: () => void;
  isMobile?: boolean;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  deals,
  onSaveAccount,
  onDeleteAccount,
  onOpenWa,
  onOpenImportExcel,
  isMobile = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedSegmen, setSelectedSegmen] = useState<string>('Semua');
  const [selectedSource, setSelectedSource] = useState<string>('Semua');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewFormat, setViewFormat] = useState<'auto' | 'cards' | 'table'>('auto');

  const effectiveView = viewFormat === 'auto' ? (isMobile ? 'cards' : 'table') : viewFormat;

  // Form states
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    pic: '',
    industry: 'University',
    email: '',
    phone: '',
    source: 'Referral',
    addr: '',
    notes: '',
  });

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData({
      id: uid(),
      name: '',
      pic: '',
      industry: 'University',
      email: '',
      phone: '',
      source: 'Referral',
      addr: '',
      notes: '',
      referralStatus: 'New',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setFormData({ ...acc });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const accountToSave: Account = {
      id: editingAccount ? editingAccount.id : uid(),
      name: formData.name || '',
      pic: formData.pic || '',
      industry: formData.industry || 'University',
      email: formData.email || '',
      phone: formData.phone || '',
      source: formData.source || 'Referral',
      addr: formData.addr || '',
      notes: formData.notes || '',
      referralStatus: formData.referralStatus || 'New',
    };

    onSaveAccount(accountToSave);
    setIsModalOpen(false);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const q = search.toLowerCase();
    const matchQuery =
      acc.name.toLowerCase().includes(q) ||
      acc.pic.toLowerCase().includes(q) ||
      (acc.industry || '').toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.phone.toLowerCase().includes(q) ||
      acc.source.toLowerCase().includes(q);

    const matchSegmen = selectedSegmen === 'Semua' || acc.industry === selectedSegmen;
    const matchSource = selectedSource === 'Semua' || acc.source === selectedSource;

    return matchQuery && matchSegmen && matchSource;
  });

  const exportAccountsToExcel = () => {
    if (typeof (window as any).XLSX === 'undefined') {
      alert('Pustaka Excel belum siap. Coba lagi dalam beberapa saat.');
      return;
    }
    const XLSX = (window as any).XLSX;
    const rows = accounts.map((a) => {
      const accDeals = deals.filter((d) => d.accId === a.id);
      return {
        'Customer / Nama': a.pic || a.name,
        'Institusi / Perusahaan': a.name,
        'Segmen': a.industry || '-',
        'Email': a.email,
        'No. telp': a.phone,
        'Sumber': a.source,
        'Jumlah deal': accDeals.length,
        'Nilai deal (Rp)': accDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
        'Alamat': a.addr || '',
        'Catatan': a.notes || '',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Kontak & Segmen');
    XLSX.writeFile(wb, `Veritas_Kontak_Segmen_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kontak &amp; Perusahaan
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImportExcel && (
            <button
              onClick={onOpenImportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-xs"
              title="Impor Kontak & 19 Segmen dari File Excel"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Excel</span>
            </button>
          )}
          <button
            onClick={exportAccountsToExcel}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Kontak</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pelanggan, institusi, segmen, email, atau no. telepon..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Segmen Dropdown */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Segmen:
          </label>
          <select
            value={selectedSegmen}
            onChange={(e) => setSelectedSegmen(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Segmen</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Sumber Lead */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sumber:
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Sumber</option>
            {SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* View Format Selector (Kartu vs Tabel) */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100/90 p-0.5 text-xs dark:border-slate-700 dark:bg-slate-800 ml-auto">
          <button
            type="button"
            onClick={() => setViewFormat('cards')}
            className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
              effectiveView === 'cards'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
            title="Tampilan Kartu Ringkas (Optimal untuk Mobile)"
          >
            Kartu
          </button>
          <button
            type="button"
            onClick={() => setViewFormat('table')}
            className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
              effectiveView === 'table'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
            title="Tampilan Tabel Data Lengkap"
          >
            Tabel
          </button>
        </div>
      </div>

      {/* 1. Mobile & Compact Cards List */}
      {effectiveView === 'cards' && (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredAccounts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              Tidak ada kontak yang cocok dengan filter.
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const accDeals = deals.filter((d) => d.accId === acc.id);
              const totalDealValue = accDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
              const isReferral = acc.source === 'Referral';

              return (
                <div
                  key={acc.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2 hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {acc.pic || acc.name}
                        </h4>
                        {isReferral && (
                          <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            Referral
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium block">
                        {acc.name}
                      </span>
                    </div>

                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                      {acc.industry || 'University'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-sans">No. Telp / WA</span>
                      <span className="truncate block font-semibold">{acc.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block font-sans">Email</span>
                      <span className="truncate block">{acc.email || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px]">
                      <span className="text-slate-400">Deal: </span>
                      <b>{accDeals.length}</b> ({idr(totalDealValue)})
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenWa(acc, isReferral ? 'referral_followup' : undefined)}
                        className="flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition"
                        title="Kirim Pesan WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WA</span>
                      </button>
                      <button
                        onClick={() => openEditModal(acc)}
                        className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kontak ${acc.name}?`)) onDeleteAccount(acc.id);
                        }}
                        className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Main Table View Matching uploaded screenshot:
          Customer / Nama | Institusi / Perusahaan | Segmen | Email | No. telp | Sumber | Jumlah deal | Nilai deal (Rp) */}
      {effectiveView === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3.5 px-4 font-bold">Customer / Nama</th>
              <th className="py-3.5 px-4 font-bold">Institusi / Perusahaan</th>
              <th className="py-3.5 px-4 font-bold">Segmen</th>
              <th className="py-3.5 px-4 font-bold">Email</th>
              <th className="py-3.5 px-4 font-bold">No. telp</th>
              <th className="py-3.5 px-4 font-bold">Sumber</th>
              <th className="py-3.5 px-4 text-center font-bold">Jumlah deal</th>
              <th className="py-3.5 px-4 text-right font-bold">Nilai deal (Rp)</th>
              <th className="py-3.5 px-4 text-center font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  Tidak ada kontak yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredAccounts.map((acc) => {
                const accDeals = deals.filter((d) => d.accId === acc.id);
                const totalDealValue = accDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
                const isReferral = acc.source === 'Referral';

                return (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    {/* Column 1: Customer / Nama (Nama Orang / PIC) */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{acc.pic || acc.name}</span>
                        {isReferral && (
                          <span
                            title="Lead dari Referral: Prioritas Tinggi!"
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold"
                          >
                            ★
                          </span>
                        )}
                      </div>
                      {acc.notes && (
                        <div className="text-[11px] font-normal text-slate-400 truncate max-w-[180px]">
                          {acc.notes}
                        </div>
                      )}
                    </td>

                    {/* Column 2: Institusi / Perusahaan (Nama Entitas / Organisasi Utama) */}
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                      {acc.name}
                    </td>

                    {/* Column "Segmen" matching user screenshot! */}
                    <td className="py-3 px-4">
                      <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {acc.industry || 'University'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {acc.email}
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {acc.phone}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isReferral
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {acc.source}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-semibold">
                      {accDeals.length}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-mono font-medium">
                      {totalDealValue > 0 ? idr(totalDealValue).replace('Rp ', '') : '0'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* WA Direct Action Button */}
                        <button
                          onClick={() => onOpenWa(acc, isReferral ? 'referral_followup' : undefined)}
                          title="Kirim pesan WhatsApp"
                          className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WA</span>
                        </button>

                        <button
                          onClick={() => openEditModal(acc)}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus kontak ${acc.name}?`)) {
                              onDeleteAccount(acc.id);
                            }
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/40"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingAccount ? 'Edit Kontak & Perusahaan' : 'Tambah Kontak Baru'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola informasi kontak, institusi, klasifikasi <b>Segmen</b> industri, dan kanal sumber lead.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Customer / Nama (PIC / Orang) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pic || ''}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    placeholder="Contoh: Budi Prasetyo, ST / Dr. Dewi Sutriani"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Institusi / Perusahaan (Entitas / Organisasi Utama) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: PT Freeport Indonesia / Universitas Udayana"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Segmen / Bidang Industri *
                  </label>
                  <select
                    value={formData.industry || 'University'}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sumber Lead
                  </label>
                  <select
                    value={formData.source || 'Referral'}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@institusi.ac.id"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 082284176470"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Alamat Perusahaan / Kampus
                </label>
                <textarea
                  rows={2}
                  value={formData.addr || ''}
                  onChange={(e) => setFormData({ ...formData, addr: e.target.value })}
                  placeholder="Alamat lengkap pengiriman sampel / korespondensi..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan Khusus
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan riset, kebutuhan pengujian khusus, PIC referensi..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
