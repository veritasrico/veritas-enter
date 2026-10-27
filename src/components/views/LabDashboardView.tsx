import React, { useState } from 'react';
import {
  FlaskConical,
  Layers,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  Upload,
} from 'lucide-react';
import { Account, LabWorkOrder, MasterInstrument, InstrumentEvent, LogEntry } from '../../types';
import { idr, today } from '../../utils/seedData';

interface LabDashboardViewProps {
  labs: LabWorkOrder[];
  insts: MasterInstrument[];
  instr: InstrumentEvent[];
  accounts: Account[];
  log: LogEntry[];
  selectedMonth?: string;
  onOpenImportExcel?: () => void;
}

export const LabDashboardView: React.FC<LabDashboardViewProps> = ({
  labs,
  insts,
  instr,
  accounts,
  log,
  selectedMonth = today().slice(0, 7),
  onOpenImportExcel,
}) => {
  const [activeFilterService, setActiveFilterService] = useState<string>('Semua');

  // Filter labs by month
  const monthLabs = labs.filter((l) => String(l.date || '').startsWith(selectedMonth));

  // 1. UNIQUE SAMPLE ID CALCULATION (Basis ID Sampel Unik)
  // Aturan Bisnis:
  // Jika 1 ID Sampel berisi 10 sampel fisik dan diuji pada 2 instrumen (misal XRD & SEM),
  // maka jumlah sampel fisik tetap dihitung 10 sampel (tidak digandakan menjadi 20).
  // Namun untuk masing-masing instrumen, tetap dihitung 10 sampel yang teranalisa.
  const uniqueSampleMap = new Map<string, {
    sid: string;
    services: string[];
    accId: string;
    date: string;
    physicalQty: number; // Kuantitas sampel fisik riil tertera pada ID sampel (e.g. 10)
    totalAnalisaPerInstrumen: number; // Akumulasi uji pada instrumen
    allCompleted: boolean;
  }>();

  monthLabs.forEach((l) => {
    const sid = l.sid || 'TANPA-ID';
    const masukVal = Number(l.masuk) || 1;
    const analisaVal = Number(l.analisa) || 0;
    const isCompleted = masukVal > 0 && masukVal <= analisaVal;

    if (!uniqueSampleMap.has(sid)) {
      uniqueSampleMap.set(sid, {
        sid,
        services: [l.service],
        accId: l.accId,
        date: l.date,
        physicalQty: masukVal,
        totalAnalisaPerInstrumen: analisaVal,
        allCompleted: isCompleted,
      });
    } else {
      const cur = uniqueSampleMap.get(sid)!;
      if (!cur.services.includes(l.service)) {
        cur.services.push(l.service);
      }
      // Basis ID Sampel: Kuantitas sampel fisik tertera dari ID sampel (tidak digandakan antar jenis layanan)
      cur.physicalQty = Math.max(cur.physicalQty, masukVal);
      cur.totalAnalisaPerInstrumen += analisaVal;
      if (!isCompleted) cur.allCompleted = false;
    }
  });

  const totalUniqueSampleIds = uniqueSampleMap.size;
  const totalPhysicalSamplesCount = Array.from(uniqueSampleMap.values()).reduce(
    (sum, s) => sum + s.physicalQty,
    0
  );
  const multiServiceSamples = Array.from(uniqueSampleMap.values()).filter((s) => s.services.length > 1);

  // 2. PER-INSTRUMENT CALCULATION (Dihitung per sampel yang teranalisa pada masing-masing instrumen)
  const instrumentStats = insts.map((inst) => {
    const instLabs = monthLabs.filter((l) => l.service === inst.name);
    const masuk = instLabs.reduce((sum, l) => sum + (Number(l.masuk) || 0), 0);
    const analisa = instLabs.reduce((sum, l) => sum + (Number(l.analisa) || 0), 0);
    const sisa = Math.max(0, masuk - analisa);

    // Downtime for this instrument
    const dtEvents = instr.filter(
      (ev) => ev.name === inst.name && ev.type === 'Downtime' && String(ev.date || '').startsWith(selectedMonth)
    );
    const downtimeHours = dtEvents.reduce((sum, ev) => sum + (Number(ev.hours) || 0), 0);

    // Capacity calculation (assume 22 active working days)
    const workDays = 22;
    const monthlyCapacity = (Number(inst.target) || 15) * workDays;
    const utilizationRate = monthlyCapacity > 0 ? Math.round((analisa / monthlyCapacity) * 100) : 0;

    return {
      inst,
      masuk,
      analisa,
      sisa,
      downtimeHours,
      utilizationRate,
      activeOrdersCount: instLabs.length,
    };
  });

  const totalMasukAccum = instrumentStats.reduce((sum, i) => sum + i.masuk, 0);
  const totalAnalisaAccum = instrumentStats.reduce((sum, i) => sum + i.analisa, 0);
  const totalSisaAccum = instrumentStats.reduce((sum, i) => sum + i.sisa, 0);
  const totalDowntimeHours = instrumentStats.reduce((sum, i) => sum + i.downtimeHours, 0);

  // Filtered completed logs for automated instrument tracking
  const completedLogs = log.filter((l) => l.action === 'Selesai Proses');

  return (
    <div className="space-y-6">
      {/* Title & Period */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-emerald-600" />
            <span>Dashboard Laboratorium &amp; Analitik Sampel</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenImportExcel && (
            <button
              onClick={onOpenImportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300 transition shadow-xs"
              title="Impor Sampel Laboratorium dari File Excel"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Excel Sampel</span>
            </button>
          )}
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Periode: {selectedMonth}
          </span>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 dark:border-teal-900/60 dark:bg-teal-950/20">
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-400">
            <span className="text-[11px] font-semibold">Basis ID Sampel</span>
            <Layers className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-teal-950 dark:text-white">
            {totalPhysicalSamplesCount} Sampel
          </div>
          <span className="mt-0.5 text-[10px] text-teal-600 dark:text-teal-400 block font-medium">
            {totalUniqueSampleIds} ID Batch Fisik
          </span>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400">
            <span className="text-[11px] font-semibold">Beban Uji Teranalisa</span>
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-indigo-950 dark:text-white">
            {totalAnalisaAccum} Uji
          </div>
          <span className="mt-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 block font-medium">
            Akumulasi running alat
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Permintaan Masuk</span>
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {totalMasukAccum}
          </div>
          <span className="mt-0.5 text-[10px] text-slate-400 block">
            Antrean beban alat
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-[11px] font-semibold">Sisa Antrean Uji</span>
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-amber-950 dark:text-white">
            {totalSisaAccum}
          </div>
          <span className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
            Menunggu running / selesai
          </span>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-[11px] font-semibold">Total Downtime</span>
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-rose-950 dark:text-white">
            {totalDowntimeHours} Jam
          </div>
          <span className="mt-0.5 text-[10px] text-rose-600 dark:text-rose-400 block font-medium">
            Waktu terhenti bulan ini
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] font-semibold">Penyelesaian</span>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1.5 text-base sm:text-lg font-bold text-emerald-950 dark:text-white">
            {totalMasukAccum > 0 ? Math.round((totalAnalisaAccum / totalMasukAccum) * 100) : 0}%
          </div>
          <span className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
            Throughput operasional
          </span>
        </div>
      </div>


      {/* Per-Instrument Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-600" />
            <span>Kinerja Beban Kerja &amp; Utilisasi Per Instrumen</span>
          </h3>
          <span className="text-xs text-slate-500">
            {insts.length} instrumen terdaftar
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-bold">Layanan / Instrumen</th>
                <th className="py-3 px-4 font-bold">Brand &amp; Tipe</th>
                <th className="py-3 px-4 font-bold">PIC Analis</th>
                <th className="py-3 px-4 text-center font-bold">Target/Hari</th>
                <th className="py-3 px-4 text-center font-bold">Sampel Masuk</th>
                <th className="py-3 px-4 text-center font-bold">Sampel Teranalisa</th>
                <th className="py-3 px-4 text-center font-bold">Sisa Antrean</th>
                <th className="py-3 px-4 text-center font-bold">Jam Downtime</th>
                <th className="py-3 px-4 text-center font-bold">% Utilisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {instrumentStats.map(({ inst, masuk, analisa, sisa, downtimeHours, utilizationRate }) => (
                <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{inst.name}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {inst.brand || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {inst.pic || '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {inst.target || 15}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                    {masuk}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {analisa}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 font-bold ${
                        sisa > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {sisa}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-rose-600 dark:text-rose-400">
                    {downtimeHours > 0 ? `${downtimeHours} jam` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-14 rounded-full bg-slate-200 overflow-hidden dark:bg-slate-700">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, utilizationRate)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        {utilizationRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Service Sample Registry */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Daftar Sampel Multi-Layanan (1 ID Sampel &ge; 2 Instrumen)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan sampel yang diuji pada lebih dari satu instrumen, tetap dihitung 1 entitas fisik bulanan
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {multiServiceSamples.length} Sampel Multi-Instrumen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {multiServiceSamples.map((samp) => {
            const client = accounts.find((a) => a.id === samp.accId);
            return (
              <div
                key={samp.sid}
                className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {samp.sid}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {client?.name || 'Customer'} &bull; <span className="text-slate-400">{client?.pic}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      samp.allCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {samp.allCompleted ? 'Semua Selesai' : 'Dalam Proses'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Instrumen Terlibat:</span>
                  {samp.services.map((srv) => (
                    <span
                      key={srv}
                      className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Instrument Process Completion Log */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Log Otomatis Instrumen Selesai Diproses (Audit Trail Terintegrasi)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem mencatat log otomatis setiap kali suatu instrumen menyelesaikan proses sampel
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {completedLogs.length} Aktivitas Tercatat
          </span>
        </div>

        <div className="space-y-2">
          {completedLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Belum ada pencatatan penyelesaian instrumen pada periode ini.
            </p>
          ) : (
            completedLogs.slice(0, 5).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Selesai
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {l.ref}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{l.note}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(l.ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
