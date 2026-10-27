import React, { useState } from 'react';
import { Plus, Search, FileText, Download, MessageCircle, Upload, Trash2, BookOpen, User, Mail, Phone, Paperclip } from 'lucide-react';
import { Account, Deal, Quote, QuoteItem, ServiceCatalog } from '../../types';
import { idr, today, uid } from '../../utils/seedData';

interface QuotesViewProps {
  quotes: Quote[];
  accounts: Account[];
  deals: Deal[];
  catalog: ServiceCatalog[];
  onSaveQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onOpenWa: (acc: Account, templateId?: string, extraData?: any) => void;
  onOpenImportExcel?: () => void;
  isAdmin?: boolean;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  accounts,
  deals,
  catalog,
  onSaveQuote,
  onDeleteQuote,
  onOpenWa,
  onOpenImportExcel,
  isAdmin = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<Quote>>({
    no: '',
    accId: accounts[0]?.id || '',
    dealId: '',
    date: today(),
    valid: today(),
    amount: 0,
    ppn: 11,
    status: 'Draft',
    perihal: 'Penawaran Pengujian Laboratorium Terakreditasi',
    recipientName: '',
    recipientTitle: '',
    recipientPhone: '',
    recipientEmail: '',
    lampiran: '1 (satu) Berkas Rincian Pengujian & Ketentuan Layanan',
    items: [{ d: 'Jasa analisa: Difraksi Sinar-X (XRD)', m: 'XRD', q: 10, p: 650000 }],
    note: 'Harga sudah termasuk penerbitan e-CoA bersertifikat.',
  });

  const openAddModal = () => {
    setEditingQuote(null);
    setFormData({
      id: uid(),
      no: `QT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
      accId: accounts[0]?.id || '',
      dealId: '',
      date: today(),
      valid: today(),
      amount: 7215000,
      ppn: 11,
      status: 'Draft',
      perihal: 'Penawaran Pengujian Laboratorium Terakreditasi',
      recipientName: accounts[0]?.pic || '',
      recipientTitle: 'Quality Assurance / R&D Manager',
      recipientPhone: accounts[0]?.phone || '',
      recipientEmail: accounts[0]?.email || '',
      lampiran: '1 (satu) Berkas Rincian Pengujian & Ketentuan Layanan',
      items: [{ d: 'Jasa analisa: Difraksi Sinar-X (XRD)', m: 'XRD', q: 10, p: 650000 }],
      note: 'Harga sudah termasuk penerbitan e-CoA bersertifikat.',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q: Quote) => {
    setEditingQuote(q);
    setFormData({
      ...q,
      items: q.items ? [...q.items] : [],
    });
    setIsModalOpen(true);
  };

  const handleAccountChange = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    setFormData((prev) => ({
      ...prev,
      accId,
      recipientName: acc?.pic || prev.recipientName,
      recipientPhone: acc?.phone || prev.recipientPhone,
      recipientEmail: acc?.email || prev.recipientEmail,
    }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, val: any) => {
    const curItems = [...(formData.items || [])];
    curItems[index] = { ...curItems[index], [field]: val };
    const subtotal = curItems.reduce((sum, item) => sum + (Number(item.q) || 0) * (Number(item.p) || 0), 0);
    const tax = Math.round((subtotal * (Number(formData.ppn) || 0)) / 100);
    setFormData({ ...formData, items: curItems, amount: subtotal + tax });
  };

  // Select service from catalog to autofill line item
  const handleSelectCatalogItem = (index: number, catalogId: string) => {
    if (!catalogId) return;
    const catItem = catalog.find((c) => c.id === catalogId);
    if (!catItem) return;

    const curItems = [...(formData.items || [])];
    curItems[index] = {
      ...curItems[index],
      d: catItem.d,
      m: catItem.m,
      p: catItem.p,
    };
    const subtotal = curItems.reduce((sum, item) => sum + (Number(item.q) || 0) * (Number(item.p) || 0), 0);
    const tax = Math.round((subtotal * (Number(formData.ppn) || 0)) / 100);
    setFormData({ ...formData, items: curItems, amount: subtotal + tax });
  };

  const handleAddItem = (presetCatalogId?: string) => {
    const curItems = [...(formData.items || [])];
    if (presetCatalogId) {
      const catItem = catalog.find((c) => c.id === presetCatalogId);
      if (catItem) {
        curItems.push({ d: catItem.d, m: catItem.m, q: 1, p: catItem.p });
      }
    } else {
      curItems.push({ d: 'Jasa analisa laboratorium', m: 'SNI / ASTM', q: 1, p: 500000 });
    }
    const subtotal = curItems.reduce((sum, item) => sum + (Number(item.q) || 0) * (Number(item.p) || 0), 0);
    const tax = Math.round((subtotal * (Number(formData.ppn) || 0)) / 100);
    setFormData({ ...formData, items: curItems, amount: subtotal + tax });
  };

  const handleRemoveItem = (index: number) => {
    const curItems = (formData.items || []).filter((_, i) => i !== index);
    const subtotal = curItems.reduce((sum, item) => sum + (Number(item.q) || 0) * (Number(item.p) || 0), 0);
    const tax = Math.round((subtotal * (Number(formData.ppn) || 0)) / 100);
    setFormData({ ...formData, items: curItems, amount: subtotal + tax });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.no) return;

    const quoteToSave: Quote = {
      id: editingQuote ? editingQuote.id : uid(),
      no: formData.no || '',
      accId: formData.accId || accounts[0]?.id || '',
      dealId: formData.dealId || '',
      date: formData.date || today(),
      valid: formData.valid || today(),
      amount: Number(formData.amount) || 0,
      ppn: Number(formData.ppn) || 11,
      status: (formData.status as any) || 'Draft',
      perihal: formData.perihal || 'Penawaran Harga',
      lampiran: formData.lampiran || '',
      recipientName: formData.recipientName || '',
      recipientTitle: formData.recipientTitle || '',
      recipientPhone: formData.recipientPhone || '',
      recipientEmail: formData.recipientEmail || '',
      items: formData.items || [],
      note: formData.note || '',
    };

    onSaveQuote(quoteToSave);
    setIsModalOpen(false);
  };

  const filteredQuotes = quotes.filter((q) => {
    const s = search.toLowerCase();
    const client = accounts.find((a) => a.id === q.accId);
    return (
      q.no.toLowerCase().includes(s) ||
      (q.perihal || '').toLowerCase().includes(s) ||
      (q.recipientName || '').toLowerCase().includes(s) ||
      (client?.name || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <span>Surat Penawaran Harga (Quotations)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penerbitan surat penawaran resmi, integrasi katalog uji &amp; tarif, kelengkapan koresponden, dan pengiriman WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImportExcel && (
            <button
              onClick={onOpenImportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-xs"
              title="Impor Surat Penawaran dari File Excel (.xlsx / .csv)"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Excel</span>
            </button>
          )}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Buat Penawaran Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. penawaran, klien, penerima UP..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total <span className="font-bold text-slate-800 dark:text-slate-200">{filteredQuotes.length}</span> penawaran
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">No. Penawaran</th>
              <th className="py-3 px-4">Klien &amp; U.P. Koresponden</th>
              <th className="py-3 px-4">Perihal</th>
              <th className="py-3 px-4">Tgl Terbit</th>
              <th className="py-3 px-4 text-right">Nilai Total</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  Belum ada surat penawaran harga yang tercatat.
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => {
                const client = accounts.find((a) => a.id === q.accId);
                const statusStyles: Record<string, string> = {
                  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                  Terkirim: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
                  Disetujui: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
                  Ditolak: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                };

                return (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {q.no}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      <div>{client?.name || 'Customer'}</div>
                      {q.recipientName && (
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                          U.P. {q.recipientName} {q.recipientTitle ? `(${q.recipientTitle})` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {q.perihal}
                      {q.items && q.items.length > 0 && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                          {q.items.length} item uji
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {q.date}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {idr(q.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          statusStyles[q.status] || statusStyles['Draft']
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {client && (
                          <button
                            onClick={() =>
                              onOpenWa(client, 'quote_followup', {
                                quoteNo: q.no,
                                amount: q.amount,
                                validUntil: q.valid,
                              })
                            }
                            title="Kirim Penawaran ke WhatsApp Klien"
                            className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WA</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(q)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus penawaran ${q.no}?`)) {
                                onDeleteQuote(q.id);
                              }
                            }}
                            className="flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                            title="Hapus Penawaran (Khusus Akun Admin)"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              <span>{editingQuote ? 'Edit Surat Penawaran Harga' : 'Buat Penawaran Harga Baru'}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No. Penawaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.no || ''}
                    onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Customer / Institusi *
                  </label>
                  <select
                    value={formData.accId}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {accounts.length === 0 ? (
                      <option value="">-- Belum ada pelanggan --</option>
                    ) : (
                      accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.pic || a.industry})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status Penawaran
                  </label>
                  <select
                    value={formData.status || 'Draft'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Terkirim">Terkirim</option>
                    <option value="Disetujui">Disetujui (Approved)</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Perihal Penawaran
                </label>
                <input
                  type="text"
                  value={formData.perihal || ''}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  placeholder="Contoh: Penawaran Pengujian Rutin Batch Farmasi & Kimia"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Data Koresponden & Kelengkapan Surat */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Data Koresponden &amp; Kelengkapan Surat</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      U.P. / Nama Penerima
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName || ''}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="Nama PIC penerima surat"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Jabatan / Departemen
                    </label>
                    <input
                      type="text"
                      value={formData.recipientTitle || ''}
                      onChange={(e) => setFormData({ ...formData, recipientTitle: e.target.value })}
                      placeholder="Contoh: QA Manager / R&D Specialist"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>No. Telepon / WhatsApp Koresponden</span>
                    </label>
                    <input
                      type="text"
                      value={formData.recipientPhone || ''}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      placeholder="0812xxxx"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span>Email Koresponden</span>
                    </label>
                    <input
                      type="email"
                      value={formData.recipientEmail || ''}
                      onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                      placeholder="email@customer.co.id"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Paperclip className="h-3 w-3 text-slate-400" />
                    <span>Lampiran / Dokumen Pendukung</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lampiran || ''}
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                    placeholder="Contoh: 1 (satu) Berkas Rincian Pengujian & Ketentuan Layanan"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Items Table with Catalog Connection */}
              <div className="border border-slate-200 rounded-xl p-3.5 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Rincian Layanan Uji (Terhubung ke Katalog Layanan)</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Pilih uji dari katalog untuk mengisi otomatis nama metode dan tarif resmi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    + Tambah Baris Manual
                  </button>
                </div>

                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                    {/* Catalog selector dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">#{idx + 1} Katalog:</span>
                      <select
                        onChange={(e) => handleSelectCatalogItem(idx, e.target.value)}
                        className="flex-1 rounded-md border border-emerald-300 bg-white px-2 py-1 text-[11px] text-slate-700 dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-200"
                        defaultValue=""
                      >
                        <option value="">-- Pilih Layanan dari Katalog untuk Isi Otomatis --</option>
                        {catalog.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.d} [{c.m}] - {idr(c.p)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold px-1.5 text-sm"
                        title="Hapus baris"
                      >
                        &times;
                      </button>
                    </div>

                    {/* Line item inputs */}
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-slate-400 mb-0.5">Deskripsi Layanan</label>
                        <input
                          type="text"
                          value={item.d}
                          onChange={(e) => handleItemChange(idx, 'd', e.target.value)}
                          placeholder="Deskripsi layanan"
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-400 mb-0.5">Metode / Alat</label>
                        <input
                          type="text"
                          value={item.m || ''}
                          onChange={(e) => handleItemChange(idx, 'm', e.target.value)}
                          placeholder="Metode"
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-slate-400 mb-0.5">Qty Sampel</label>
                        <input
                          type="number"
                          value={item.q}
                          onChange={(e) => handleItemChange(idx, 'q', Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-slate-400 mb-0.5">Tarif Satuan (Rp)</label>
                        <input
                          type="number"
                          value={item.p}
                          onChange={(e) => handleItemChange(idx, 'p', Number(e.target.value))}
                          placeholder="Harga"
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">PPN (%):</span>
                    <input
                      type="number"
                      value={formData.ppn !== undefined ? formData.ppn : 11}
                      onChange={(e) => {
                        const ppnVal = Number(e.target.value);
                        const curItems = formData.items || [];
                        const subtotal = curItems.reduce((sum, item) => sum + (Number(item.q) || 0) * (Number(item.p) || 0), 0);
                        const tax = Math.round((subtotal * ppnVal) / 100);
                        setFormData({ ...formData, ppn: ppnVal, amount: subtotal + tax });
                      }}
                      className="w-14 rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-center dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    Total Penawaran: <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">{idr(formData.amount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan Tambahan &amp; Ketentuan
                </label>
                <textarea
                  rows={2}
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ketentuan pengujian, waktu pengerjaan estimasi, syarat sampel..."
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
                  Simpan Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
