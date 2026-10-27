import React, { useState } from 'react';
import { Plus, Search, CreditCard, MessageCircle, Upload, Trash2, Link as LinkIcon, FileText, FlaskConical } from 'lucide-react';
import { Account, Deal, Invoice, Quote, LabWorkOrder } from '../../types';
import { idr, today, uid } from '../../utils/seedData';

interface FinanceViewProps {
  fins: Invoice[];
  accounts: Account[];
  deals: Deal[];
  quotes?: Quote[];
  labs?: LabWorkOrder[];
  onSaveInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onOpenWa: (acc: Account, templateId?: string, extraData?: any) => void;
  onOpenImportExcel?: () => void;
  isAdmin?: boolean;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  fins,
  accounts,
  deals,
  quotes = [],
  labs = [],
  onSaveInvoice,
  onDeleteInvoice,
  onOpenWa,
  onOpenImportExcel,
  isAdmin = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<Invoice>>({
    no: '',
    accId: accounts[0]?.id || '',
    dealId: '',
    quoteId: '',
    sampleSid: '',
    date: today(),
    due: today(),
    amount: 15000000,
    paid: 0,
    ppn: 11,
    perihal: 'Tagihan Layanan Analisa Laboratorium',
    note: '',
  });

  const openAddModal = () => {
    setEditingInvoice(null);
    setFormData({
      id: uid(),
      no: `INV-${new Date().getFullYear()}-${String(fins.length + 1).padStart(3, '0')}`,
      accId: accounts[0]?.id || '',
      dealId: '',
      quoteId: '',
      sampleSid: '',
      date: today(),
      due: today(),
      amount: 15000000,
      paid: 0,
      ppn: 11,
      perihal: 'Tagihan Layanan Pengujian Laboratorium',
      note: 'Transfer ke rekening Bank Mandiri PT NUSA VERITAS INSPEKTAMA.',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setFormData({ ...inv });
    setIsModalOpen(true);
  };

  // Handler when user selects a Quote to link
  const handleSelectQuote = (quoteId: string) => {
    if (!quoteId) {
      setFormData((prev) => ({ ...prev, quoteId: '' }));
      return;
    }
    const selectedQuote = quotes.find((q) => q.id === quoteId);
    if (!selectedQuote) return;

    setFormData((prev) => ({
      ...prev,
      quoteId: selectedQuote.id,
      accId: selectedQuote.accId || prev.accId,
      dealId: selectedQuote.dealId || prev.dealId,
      amount: selectedQuote.amount || prev.amount,
      ppn: selectedQuote.ppn !== undefined ? selectedQuote.ppn : 11,
      perihal: selectedQuote.perihal ? `Tagihan ${selectedQuote.perihal}` : `Tagihan Penawaran ${selectedQuote.no}`,
      items: selectedQuote.items ? [...selectedQuote.items] : prev.items,
      note: `Ref Penawaran: ${selectedQuote.no}. ${prev.note || ''}`,
    }));
  };

  // Handler when user selects a Lab Work Order SID to link
  const handleSelectWorkOrder = (sid: string) => {
    if (!sid) {
      setFormData((prev) => ({ ...prev, sampleSid: '', labId: '' }));
      return;
    }
    const selectedLab = labs.find((l) => l.sid === sid);
    if (!selectedLab) return;

    setFormData((prev) => {
      let updatedPerihal = prev.perihal || 'Tagihan Pengujian';
      if (!updatedPerihal.includes(selectedLab.sid)) {
        updatedPerihal = `${updatedPerihal} [SID: ${selectedLab.sid}]`;
      }
      return {
        ...prev,
        sampleSid: selectedLab.sid,
        labId: selectedLab.id,
        accId: selectedLab.accId || prev.accId,
        perihal: updatedPerihal,
        note: `Pengujian: ${selectedLab.service} (SID: ${selectedLab.sid}). ${prev.note || ''}`,
      };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.no) return;

    const invToSave: Invoice = {
      id: editingInvoice ? editingInvoice.id : uid(),
      no: formData.no || '',
      accId: formData.accId || accounts[0]?.id || '',
      dealId: formData.dealId || '',
      quoteId: formData.quoteId || '',
      sampleSid: formData.sampleSid || '',
      labId: formData.labId || '',
      date: formData.date || today(),
      due: formData.due || today(),
      amount: Number(formData.amount) || 0,
      paid: Number(formData.paid) || 0,
      ppn: Number(formData.ppn) || 11,
      perihal: formData.perihal || 'Tagihan Layanan',
      note: formData.note || '',
      items: formData.items || [],
    };

    onSaveInvoice(invToSave);
    setIsModalOpen(false);
  };

  const filteredInvoices = fins.filter((inv) => {
    const s = search.toLowerCase();
    const client = accounts.find((a) => a.id === inv.accId);
    return (
      inv.no.toLowerCase().includes(s) ||
      (inv.perihal || '').toLowerCase().includes(s) ||
      (inv.sampleSid || '').toLowerCase().includes(s) ||
      (client?.name || '').toLowerCase().includes(s)
    );
  });

  const totalBilled = fins.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalPaid = fins.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  // Filter approved quotes
  const approvedQuotes = quotes.filter((q) => q.status === 'Disetujui');
  const otherQuotes = quotes.filter((q) => q.status !== 'Disetujui');

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span>Keuangan, Penagihan &amp; Invoice</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImportExcel && (
            <button
              onClick={onOpenImportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-xs"
              title="Impor Faktur Invoice dari File Excel (.xlsx / .csv)"
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
            <span>+ Buat Invoice Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500">Total Nilai Tagihan</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{idr(totalBilled)}</p>
          <span className="text-[10px] text-slate-400">Total {fins.length} invoice tercatat</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-emerald-600">Total Terbayar (Kas Masuk)</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{idr(totalPaid)}</p>
          <span className="text-[10px] text-slate-400">
            Efisiensi: {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}%
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-rose-500">Piutang Berjalan (Outstanding)</span>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{idr(totalOutstanding)}</p>
          <span className="text-[10px] text-slate-400">Sisa saldo belum dibayar</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. invoice, klien, SID..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="text-xs text-slate-500">
          Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{filteredInvoices.length}</span> invoice
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">No. Invoice</th>
              <th className="py-3 px-4">Customer &amp; Ref</th>
              <th className="py-3 px-4">Tgl Tagih</th>
              <th className="py-3 px-4">Jatuh Tempo</th>
              <th className="py-3 px-4 text-right">Nilai Tagihan</th>
              <th className="py-3 px-4 text-right">Terbayar</th>
              <th className="py-3 px-4 text-right">Sisa Tagihan</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  Belum ada faktur invoice yang sesuai.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const client = accounts.find((a) => a.id === inv.accId);
                const sisa = Math.max(0, (Number(inv.amount) || 0) - (Number(inv.paid) || 0));
                const isPaid = sisa === 0 && Number(inv.amount) > 0;
                const isOverdue = !isPaid && inv.due && new Date(inv.due) < new Date(today());

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.no}
                      {inv.sampleSid && (
                        <span className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          SID: {inv.sampleSid}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {client?.name || 'Customer'}
                      {client?.pic && <span className="block text-[11px] text-slate-400">{client.pic}</span>}
                      {inv.perihal && (
                        <span className="block text-[10px] text-slate-400 truncate max-w-xs">{inv.perihal}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      <span className={isOverdue ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>
                        {inv.due}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                      {idr(inv.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {idr(inv.paid)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {idr(sisa)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isPaid ? 'Lunas' : isOverdue ? 'Jatuh Tempo' : 'Sebagian'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {sisa > 0 && client && (
                          <button
                            onClick={() =>
                              onOpenWa(client, 'invoice_reminder', {
                                invoiceNo: inv.no,
                                amount: sisa,
                                due: inv.due,
                              })
                            }
                            title="Kirim pengingat pembayaran via WhatsApp"
                            className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WA</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(inv)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus invoice ${inv.no}?`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                            title="Hapus Invoice (Khusus Akun Admin)"
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

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <span>{editingInvoice ? 'Edit Invoice Tagihan' : 'Buat Invoice Baru'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tautkan langsung dari Penawaran yang Disetujui atau ID Sampel Work Order untuk pengisian nilai otomatis.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* Autofill linkers from Quotes & Lab Work Orders */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20 space-y-3">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Sinkronisasi Otomatis Data Penawaran &amp; Work Order</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-emerald-600" />
                      <span>Pilih Penawaran (Auto Nilai &amp; Klien)</span>
                    </label>
                    <select
                      value={formData.quoteId || ''}
                      onChange={(e) => handleSelectQuote(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-emerald-800 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">-- Pilih Penawaran (Opsional) --</option>
                      {approvedQuotes.length > 0 && (
                        <optgroup label="✓ Penawaran Disetujui (Recommended)">
                          {approvedQuotes.map((q) => {
                            const acc = accounts.find((a) => a.id === q.accId);
                            return (
                              <option key={q.id} value={q.id}>
                                {q.no} - {acc?.name || 'Klien'} ({idr(q.amount)})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                      {otherQuotes.length > 0 && (
                        <optgroup label="Draft / Status Lainnya">
                          {otherQuotes.map((q) => {
                            const acc = accounts.find((a) => a.id === q.accId);
                            return (
                              <option key={q.id} value={q.id}>
                                {q.no} - {acc?.name || 'Klien'} ({idr(q.amount)}) [{q.status}]
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FlaskConical className="h-3 w-3 text-emerald-600" />
                      <span>Pilih ID Sampel (Work Order Lab)</span>
                    </label>
                    <select
                      value={formData.sampleSid || ''}
                      onChange={(e) => handleSelectWorkOrder(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-emerald-800 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">-- Pilih ID Sampel Lab (Opsional) --</option>
                      {labs.map((wo) => {
                        const acc = accounts.find((a) => a.id === wo.accId);
                        return (
                          <option key={wo.id} value={wo.sid}>
                            {wo.sid} - {wo.service} ({acc?.name || wo.analyst || 'Lab'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Basic Invoice Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No. Invoice *
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
                    onChange={(e) => setFormData({ ...formData, accId: e.target.value })}
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Perihal / Deskripsi Penagihan
                </label>
                <input
                  type="text"
                  value={formData.perihal || ''}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  placeholder="Contoh: Tagihan Layanan Analisa Laboratorium XRD & SEM"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nilai Total (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dibayar (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.paid || 0}
                    onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold font-mono text-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={formData.date || today()}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={formData.due || today()}
                    onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan Pembayaran / Rekening
                </label>
                <textarea
                  rows={2}
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Informasi no rekening atau instruksi transfer..."
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
                  Simpan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
