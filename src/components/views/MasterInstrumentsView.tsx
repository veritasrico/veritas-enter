import React, { useState } from 'react';
import { Plus, Search, Cpu, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { MasterInstrument } from '../../types';
import { today, uid } from '../../utils/seedData';

interface MasterInstrumentsViewProps {
  insts: MasterInstrument[];
  onSaveInstrument: (inst: MasterInstrument) => void;
  onDeleteInstrument: (id: string) => void;
}

export const MasterInstrumentsView: React.FC<MasterInstrumentsViewProps> = ({
  insts,
  onSaveInstrument,
  onDeleteInstrument,
}) => {
  const [search, setSearch] = useState<string>('');
  const [editingInst, setEditingInst] = useState<MasterInstrument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<MasterInstrument>>({
    name: '',
    brand: '',
    pic: 'Sari Analis',
    target: 15,
    ops: 8,
    int: 365,
    last: today(),
    pmInt: 180,
    pmLast: today(),
    note: '',
  });

  const openAddModal = () => {
    setEditingInst(null);
    setFormData({
      id: uid(),
      name: '',
      brand: '',
      pic: 'Sari Analis',
      target: 15,
      ops: 8,
      int: 365,
      last: today(),
      pmInt: 180,
      pmLast: today(),
      note: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (inst: MasterInstrument) => {
    setEditingInst(inst);
    setFormData({ ...inst });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const instToSave: MasterInstrument = {
      id: editingInst ? editingInst.id : uid(),
      name: formData.name || '',
      brand: formData.brand || '',
      pic: formData.pic || '',
      target: Number(formData.target) || 15,
      ops: Number(formData.ops) || 8,
      int: Number(formData.int) || 365,
      last: formData.last || today(),
      pmInt: Number(formData.pmInt) || 180,
      pmLast: formData.pmLast || today(),
      note: formData.note || '',
    };

    onSaveInstrument(instToSave);
    setIsModalOpen(false);
  };

  const filteredInsts = insts.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      i.brand.toLowerCase().includes(q) ||
      (i.pic || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-600" />
            <span>Master Instrumen Laboratorium</span>
          </h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tambah Instrumen</span>
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari instrumen (misal: SEM, XRD, ICP-OES), brand, atau PIC analis..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-bold">Layanan / Instrumen</th>
              <th className="py-3 px-4 font-bold">Brand &amp; Seri</th>
              <th className="py-3 px-4 font-bold">PIC Analis</th>
              <th className="py-3 px-4 text-center font-bold">Target/Hari</th>
              <th className="py-3 px-4 text-center font-bold">Jam Ops/Hari</th>
              <th className="py-3 px-4 font-bold">Kalibrasi Terakhir</th>
              <th className="py-3 px-4 font-bold">PM Terakhir</th>
              <th className="py-3 px-4 text-center font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInsts.map((inst) => (
              <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {inst.name}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  {inst.brand}
                </td>
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {inst.pic || '-'}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold">
                  {inst.target}
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {inst.ops} jam
                </td>
                <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                  {inst.last || '-'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                  {inst.pmLast || '-'}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => openEditModal(inst)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus instrumen ${inst.name}?`)) {
                          onDeleteInstrument(inst.id);
                        }
                      }}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingInst ? 'Edit Master Instrumen' : 'Tambah Master Instrumen'}
            </h3>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Instrumen / Layanan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: SEM, XRD, ICP-OES"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Brand &amp; Tipe Alat
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Contoh: JEOL JSM-IT200"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PIC Analis
                  </label>
                  <input
                    type="text"
                    value={formData.pic || ''}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target/Hari (Sampel)
                  </label>
                  <input
                    type="number"
                    value={formData.target || 15}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Jam Operasi/Hari
                  </label>
                  <input
                    type="number"
                    value={formData.ops || 8}
                    onChange={(e) => setFormData({ ...formData, ops: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kalibrasi Terakhir
                  </label>
                  <input
                    type="date"
                    value={formData.last || ''}
                    onChange={(e) => setFormData({ ...formData, last: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PM Terakhir
                  </label>
                  <input
                    type="date"
                    value={formData.pmLast || ''}
                    onChange={(e) => setFormData({ ...formData, pmLast: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
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
                  Simpan Instrumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
