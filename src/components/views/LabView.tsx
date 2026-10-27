import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, Clock, MessageCircle, AlertTriangle, Download, Upload } from 'lucide-react';
import { Account, LabWorkOrder, MasterInstrument, Quote, ServiceCatalog } from '../../types';
import { today, uid } from '../../utils/seedData';

interface LabViewProps {
  labs: LabWorkOrder[];
  insts: MasterInstrument[];
  accounts: Account[];
  quotes: Quote[];
  catalog?: ServiceCatalog[];
  onSaveLab: (lab: LabWorkOrder, wasJustCompleted?: boolean) => void;
  onDeleteLab: (id: string) => void;
  onOpenWa: (acc: Account, templateId?: string, extraData?: any) => void;
  onOpenImportExcel?: () => void;
  isAdmin?: boolean;
}

export const LabView: React.FC<LabViewProps> = ({
  labs,
  insts,
  accounts,
  quotes,
  catalog = [],
  onSaveLab,
  onDeleteLab,
  onOpenWa,
  onOpenImportExcel,
  isAdmin = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const [editingLab, setEditingLab] = useState<LabWorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<LabWorkOrder>>({
    sid: '',
    accId: accounts[0]?.id || '',
    service: insts[0]?.name || 'XRD',
    cust: 'Eksternal',
    analyst: insts[0]?.pic || 'Sari Analis',
    date: today(),
    completionDate: '',
    targetTatDays: 5,
    masuk: 4,
    analisa: 0,
    down: 'Tidak ada',
    jam: 0,
    note: '',
    serviceStatus: 'Normal',
    serviceClosedNote: '',
    closedFrom: today(),
    closedUntil: '',
  });

  const openAddModal = () => {
    setEditingLab(null);
    const firstInst = insts[0];
    setFormData({
      id: uid(),
      sid: `SMP-VRT-${new Date().getFullYear()}-${String(labs.length + 1).padStart(3, '0')}`,
      accId: accounts[0]?.id || '',
      service: firstInst?.name || 'XRD',
      cust: 'Eksternal',
      analyst: firstInst?.pic || 'Sari Analis',
      date: today(),
      completionDate: '',
      targetTatDays: 5,
      masuk: 4,
      analisa: 0,
      down: 'Tidak ada',
      jam: 0,
      note: '',
      serviceStatus: 'Normal',
      serviceClosedNote: '',
      closedFrom: today(),
      closedUntil: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (l: LabWorkOrder) => {
    setEditingLab(l);
    setFormData({
      ...l,
      completionDate: l.completionDate || '',
      targetTatDays: l.targetTatDays || 5,
      serviceStatus: l.serviceStatus || 'Normal',
      serviceClosedNote: l.serviceClosedNote || '',
      closedFrom: l.closedFrom || l.date || today(),
      closedUntil: l.closedUntil || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sid) return;

    const masukNum = Number(formData.masuk) || 1;
    const analisaNum = Number(formData.analisa) || 0;
    const isCompleted = masukNum > 0 && analisaNum >= masukNum;
    const wasAlreadyLogged = editingLab?.completedLogged;
    const wasJustCompleted = isCompleted && !wasAlreadyLogged;

    const recDate = formData.date || today();
    const compDate = formData.completionDate || (isCompleted ? today() : undefined);
    const targetTat = Number(formData.targetTatDays) || 5;
    const actualTat = compDate
      ? Math.max(0, Math.ceil((new Date(compDate).getTime() - new Date(recDate).getTime()) / (1000 * 60 * 60 * 24)))
      : undefined;

    const labToSave: LabWorkOrder = {
      id: editingLab ? editingLab.id : uid(),
      sid: formData.sid || '',
      accId: formData.accId || accounts[0]?.id || '',
      quoteId: formData.quoteId || '',
      dealId: formData.dealId || '',
      service: formData.service || 'XRD',
      cust: (formData.cust as 'Internal' | 'Eksternal') || 'Eksternal',
      analyst: formData.analyst || '',
      date: recDate,
      completionDate: compDate,
      targetTatDays: targetTat,
      actualTatDays: actualTat,
      masuk: masukNum,
      analisa: analisaNum,
      down: formData.down || 'Tidak ada',
      jam: Number(formData.jam) || 0,
      note: formData.note || '',
      completedLogged: wasAlreadyLogged || wasJustCompleted,
      serviceStatus: formData.serviceStatus || 'Normal',
      serviceClosedNote: formData.serviceClosedNote || undefined,
      closedFrom: formData.closedFrom || undefined,
      closedUntil: formData.closedUntil || undefined,
    };

    onSaveLab(labToSave, wasJustCompleted);
    setIsModalOpen(false);
  };

  const filteredLabs = labs.filter((l) => {
    const q = search.toLowerCase();
    const acc = accounts.find((a) => a.id === l.accId);
    return (
      l.sid.toLowerCase().includes(q) ||
      l.service.toLowerCase().includes(q) ||
      l.analyst.toLowerCase().includes(q) ||
      (acc?.name || '').toLowerCase().includes(q)
    );
  });

  const exportLabToExcel = () => {
    if (typeof (window as any).XLSX === 'undefined') {
      alert('Pustaka Excel belum siap. Coba lagi dalam beberapa saat.');
      return;
    }
    const XLSX = (window as any).XLSX;
    const rows = labs.map((l) => {
      const client = accounts.find((a) => a.id === l.accId);
      const sisa = Math.max(0, (Number(l.masuk) || 0) - (Number(l.analisa) || 0));
      return {
        'Tanggal': l.date,
        'ID Sampel': l.sid,
        'Customer': client?.name || l.cust,
        'Layanan / Instrumen': l.service,
        'Analis': l.analyst,
        'Sampel Masuk': l.masuk,
        'Teranalisa': l.analisa,
        'Sisa': sisa,
        'Downtime': l.down !== 'Tidak ada' ? `${l.down} (${l.jam} jam)` : '-',
        'Status': sisa <= 0 ? 'Selesai' : 'Dalam Proses',
        'Catatan': l.note || '',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Work Order Lab');
    XLSX.writeFile(wb, `Veritas_WorkOrder_Lab_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Operasional Laboratorium &amp; Work Order
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan sampel, penugasan analis, pelacakan running instrumen, dan pencatatan log otomatis saat selesai
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImportExcel && (
            <button
              onClick={onOpenImportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-xs"
              title="Impor Work Order Lab dari File Excel (.xlsx / .csv)"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Excel</span>
            </button>
          )}
          <button
            onClick={exportLabToExcel}
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
            <span>+ Work Order Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID Sampel (misal: SMP-VRT-2026-001), layanan, analis, atau customer..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-bold">ID Sampel</th>
              <th className="py-3 px-4 font-bold">Customer</th>
              <th className="py-3 px-4 font-bold">Layanan / Instrumen</th>
              <th className="py-3 px-4 font-bold">Analis</th>
              <th className="py-3 px-4 font-bold">Tgl Terima</th>
              <th className="py-3 px-4 font-bold">Tgl Selesai</th>
              <th className="py-3 px-4 text-center font-bold">TAT</th>
              <th className="py-3 px-4 text-center font-bold">Masuk</th>
              <th className="py-3 px-4 text-center font-bold">Analisa</th>
              <th className="py-3 px-4 text-center font-bold">Status</th>
              <th className="py-3 px-4 text-center font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLabs.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-slate-400">
                  Belum ada data work order laboratorium.
                </td>
              </tr>
            ) : (
              filteredLabs.map((lab) => {
                const client = accounts.find((a) => a.id === lab.accId);
                const sisa = Math.max(0, (Number(lab.masuk) || 0) - (Number(lab.analisa) || 0));
                const isCompleted = sisa === 0 && (Number(lab.masuk) || 0) > 0;
                
                // TAT calculation
                const recDate = lab.date ? new Date(lab.date) : new Date();
                const targetSla = lab.targetTatDays || 5;
                let tatDays = 0;
                let isLate = false;

                if (lab.completionDate) {
                  const compDate = new Date(lab.completionDate);
                  tatDays = Math.max(0, Math.ceil((compDate.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24)));
                  isLate = tatDays > targetSla;
                } else {
                  const todayDate = new Date();
                  tatDays = Math.max(0, Math.ceil((todayDate.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24)));
                  isLate = tatDays > targetSla;
                }

                return (
                  <tr key={lab.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">
                      {lab.sid}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {client?.name || lab.cust}
                      {client?.pic && <span className="block text-[11px] text-slate-400">{client.pic}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {lab.service}
                        </span>
                        {lab.serviceStatus === 'Layanan Ditutup' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              <span>Layanan Ditutup</span>
                            </span>
                            {lab.serviceClosedNote && (
                              <p className="text-[10px] text-rose-700 dark:text-rose-400 italic">
                                {lab.serviceClosedNote}
                              </p>
                            )}
                          </div>
                        )}
                        {lab.serviceStatus === 'Ditunda' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock className="h-2.5 w-2.5" />
                              <span>Ditunda</span>
                            </span>
                            {lab.serviceClosedNote && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                                {lab.serviceClosedNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {lab.analyst || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {lab.date}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {lab.completionDate || (
                        <span className="text-slate-400 italic">Dalam proses</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {lab.completionDate ? (
                        !isLate ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>{tatDays} Hari (SLA On-Time &le;{targetSla}H)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 px-2 py-0.5 text-[10px] font-bold">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            <span>{tatDays} Hari (Over SLA &gt;{targetSla}H)</span>
                          </span>
                        )
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                          isLate
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span>{tatDays} Hari berjalan (Target: {targetSla} Hari)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{lab.masuk}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {lab.analisa}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isCompleted ? 'Selesai' : 'Dalam Proses'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {isCompleted && client && (
                          <button
                            onClick={() =>
                              onOpenWa(client, 'sample_ready', {
                                sid: lab.sid,
                                service: lab.service,
                              })
                            }
                            title="Kirim notifikasi WA hasil sampel selesai"
                            className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WA</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(lab)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus work order ${lab.sid}?`)) {
                                onDeleteLab(lab.id);
                              }
                            }}
                            className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                            title="Hapus Work Order (Khusus Akun Admin)"
                          >
                            Hapus
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingLab ? 'Edit Work Order Laboratorium' : 'Work Order Baru'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Jika sampel teranalisa mencapai target sampel masuk, sistem otomatis mencatat log penyelesaian instrumen.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ID Sampel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sid || ''}
                    onChange={(e) => setFormData({ ...formData, sid: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Customer / Institusi
                  </label>
                  <select
                    value={formData.accId}
                    onChange={(e) => setFormData({ ...formData, accId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {accounts.length === 0 ? (
                      <option value="">-- Belum ada pelanggan (tambah di Kontak) --</option>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Layanan / Instrumen
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => {
                      const newSrv = e.target.value;
                      const inst = insts.find((i) => i.name === newSrv);
                      setFormData({
                        ...formData,
                        service: newSrv,
                        analyst: inst?.pic || formData.analyst,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {insts.map((i) => (
                      <option key={i.id} value={i.name}>
                        {i.name} ({i.brand})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PIC Analis
                  </label>
                  <input
                    type="text"
                    value={formData.analyst || ''}
                    onChange={(e) => setFormData({ ...formData, analyst: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tanggal Terima Sampel
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sampel Masuk
                  </label>
                  <input
                    type="number"
                    value={formData.masuk || 1}
                    onChange={(e) => setFormData({ ...formData, masuk: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sampel Teranalisa
                  </label>
                  <input
                    type="number"
                    value={formData.analisa || 0}
                    onChange={(e) => setFormData({ ...formData, analisa: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Tanggal Penyelesaian & Target SLA untuk Perhitungan TAT */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-950/40 dark:bg-emerald-950/20">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Tanggal Penyelesaian Pengujian
                  </label>
                  <input
                    type="date"
                    value={formData.completionDate || ''}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-500">Isi saat hasil lab selesai untuk menghitung TAT aktual</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Target SLA (Hari Kerja)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.targetTatDays || 5}
                    onChange={(e) => setFormData({ ...formData, targetTatDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Standar SLA laboratorium (default 5 hari)</span>
                </div>
              </div>

              {/* Check if service is currently closed in Catalog */}
              {(() => {
                const matchedCat = catalog.find(
                  (c) => c.d.toLowerCase().includes((formData.service || '').toLowerCase()) ||
                         c.m.toLowerCase() === (formData.service || '').toLowerCase()
                );
                if (matchedCat && (matchedCat.status === 'Ditutup Sementara' || matchedCat.status === 'Maintenance')) {
                  return (
                    <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Perhatian: Layanan {formData.service} sedang Ditutup Sementara di Katalog!</span>
                        <p className="text-[11px] mt-0.5">{matchedCat.closedReason || 'Layanan tidak menerima sampel saat ini.'}</p>
                        {matchedCat.closedUntil && (
                          <p className="text-[10px] text-slate-500 mt-0.5">Estimasi buka kembali: {matchedCat.closedUntil}</p>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Status Layanan Permintaan Customer */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Status Permintaan Layanan</span>
                  </label>
                  <select
                    value={formData.serviceStatus || 'Normal'}
                    onChange={(e) => setFormData({ ...formData, serviceStatus: e.target.value as any })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition ${
                      formData.serviceStatus === 'Layanan Ditutup'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        : formData.serviceStatus === 'Ditunda'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <option value="Normal">Normal (Berjalan)</option>
                    <option value="Layanan Ditutup">Layanan Sedang Ditutup</option>
                    <option value="Ditunda">Ditunda / Pending</option>
                  </select>
                </div>

                {formData.serviceStatus !== 'Normal' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                        Catatan Keterangan Layanan Ditutup / Ditunda:
                      </label>
                      <textarea
                        rows={2}
                        value={formData.serviceClosedNote || ''}
                        onChange={(e) => setFormData({ ...formData, serviceClosedNote: e.target.value })}
                        placeholder="Contoh: Layanan XRD sedang ditutup untuk penggantian tabung sinar-X & kalibrasi tahunan, permintaan customer ditunda"
                        className="mt-1 w-full rounded border border-rose-200 p-2 text-xs dark:bg-slate-900 dark:border-rose-900/60"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Tanggal Mulai Penutupan:
                        </label>
                        <input
                          type="date"
                          value={formData.closedFrom || formData.date || today()}
                          onChange={(e) => setFormData({ ...formData, closedFrom: e.target.value })}
                          className="mt-1 w-full rounded border border-slate-300 p-1.5 text-xs dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Estimasi Buka / Selesai:
                        </label>
                        <input
                          type="date"
                          value={formData.closedUntil || ''}
                          onChange={(e) => setFormData({ ...formData, closedUntil: e.target.value })}
                          className="mt-1 w-full rounded border border-slate-300 p-1.5 text-xs dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      *Keterangan penutupan layanan ini otomatis disinkronkan dan ditampilkan pada Kalender Terpadu.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan Pengujian
                </label>
                <textarea
                  rows={2}
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
                  Simpan Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
