import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Code2,
  Copy,
  Check,
  Download,
  Presentation,
  Printer,
  Layers,
  Cpu,
  CreditCard,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { AppState } from '../../types';
import { idr, today } from '../../utils/seedData';
import { downloadSlideDeck } from '../../utils/slideExport';

interface MonthlyReportViewProps {
  state: AppState;
  onOpenSlide: () => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ state, onOpenSlide }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(today().slice(0, 7));
  const [copiedApi, setCopiedApi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'api' | 'instruments'>('summary');

  // Month-filtered data
  const monthLabs = state.labs.filter((l) => String(l.date || '').startsWith(selectedMonth));
  const monthDeals = state.deals.filter(
    (d) => String(d.close || '').startsWith(selectedMonth) || d.stage === 'Won'
  );
  const monthFins = state.fins.filter((f) => String(f.date || '').startsWith(selectedMonth));

  // Unique Sample ID Calculation
  const uniqueSampleIds = new Set(monthLabs.map((l) => l.sid).filter(Boolean));
  const uniqueCount = uniqueSampleIds.size;

  // Per-instrument breakdown
  const perInstrument: Record<string, { masuk: number; analisa: number; sisa: number; downtime: number }> = {};
  state.insts.forEach((inst) => {
    perInstrument[inst.name] = { masuk: 0, analisa: 0, sisa: 0, downtime: 0 };
  });

  monthLabs.forEach((l) => {
    const sName = l.service || 'Umum';
    if (!perInstrument[sName]) {
      perInstrument[sName] = { masuk: 0, analisa: 0, sisa: 0, downtime: 0 };
    }
    const m = Number(l.masuk) || 0;
    const a = Number(l.analisa) || 0;
    perInstrument[sName].masuk += m;
    perInstrument[sName].analisa += a;
    perInstrument[sName].sisa += Math.max(0, m - a);
  });

  const totalMasukInstr = Object.values(perInstrument).reduce((s, x) => s + x.masuk, 0);
  const totalAnalisaInstr = Object.values(perInstrument).reduce((s, x) => s + x.analisa, 0);
  const totalBilled = monthFins.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const totalPaid = monthFins.reduce((s, f) => s + (Number(f.paid) || 0), 0);
  const wonDealsVal = monthDeals
    .filter((d) => d.stage === 'Won')
    .reduce((s, d) => s + (Number(d.value) || 0), 0);

  const apiEndpointUrl = `${window.location.origin}/api/reports/monthly?month=${selectedMonth}`;
  const curlExample = `curl -X GET "${apiEndpointUrl}" -H "Accept: application/json"`;

  const handleCopyApi = () => {
    navigator.clipboard.writeText(apiEndpointUrl);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 2000);
  };

  const handleDownloadJson = () => {
    const payload = {
      month: selectedMonth,
      generatedAt: new Date().toISOString(),
      basisIdSampelUnik: uniqueCount,
      totalAnalisaAkumulasiInstrumen: totalAnalisaInstr,
      perInstrumentBreakdown: perInstrument,
      financial: {
        totalBilled,
        totalPaid,
        outstanding: totalBilled - totalPaid,
      },
      sales: {
        wonDealsCount: monthDeals.filter((d) => d.stage === 'Won').length,
        wonDealsValue: wonDealsVal,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Bulanan_Veritas_${selectedMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            <span>Laporan Bulanan &amp; Integrasi API</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekapitulasi otomatis bulanan, kalkulasi sampel unik vs instrumen, dan endpoint API terintegrasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <button
            onClick={onOpenSlide}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <Presentation className="h-3.5 w-3.5 text-amber-600" />
            <span>Mode Slide Rapat</span>
          </button>

          <button
            onClick={() => downloadSlideDeck(state, selectedMonth)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor Slide (.html)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === 'summary'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Ringkasan Bulanan
        </button>
        <button
          onClick={() => setActiveTab('instruments')}
          className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === 'instruments'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Kalkulasi Sampel Per-Instrumen
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === 'api'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Integrasi API &amp; Webhook
        </button>
      </div>

      {/* Tab: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
              <div className="flex items-center justify-between text-teal-700 dark:text-teal-400 text-xs font-semibold">
                <span>Basis ID Sampel Unik</span>
                <Layers className="h-4 w-4" />
              </div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {uniqueCount}
              </div>
              <span className="text-[11px] text-teal-700 dark:text-teal-300 mt-1 block">
                Total entitas fisik sampel klien
              </span>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                <span>Teranalisa Per-Instrumen</span>
                <Cpu className="h-4 w-4" />
              </div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {totalAnalisaInstr}
              </div>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 block">
                Akumulasi seluruh instrumen uji
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span>Nilai Tagihan Invoice</span>
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {idr(totalBilled)}
              </div>
              <span className="text-[11px] text-emerald-600 mt-1 block">
                Terbayar: {idr(totalPaid)}
              </span>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-semibold">
                <span>Realisasi Deal Won</span>
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-black text-purple-700 dark:text-purple-400">
                {idr(wonDealsVal)}
              </div>
              <span className="text-[11px] text-purple-600 mt-1 block">
                Total kontrak penjualan disetujui
              </span>
            </div>
          </div>

          {/* Detailed Narrative Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sorotan Evaluasi Manajerial Periode {selectedMonth}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              1. <b>Kalkulasi Sampel Fisik:</b> Tercatat {uniqueCount} sampel fisik masuk melalui basis ID Sampel unik. Untuk sampel yang memerlukan pengujian komparatif (contoh: SEM dan XRD pada sampel Udayana), entitas sampel fisik tetap dihitung 1 untuk perhitungan biaya logistik dan pendaftaran.
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              2. <b>Beban Pengujian Instrumen:</b> Akumulasi beban pengujian pada seluruh instrumen mencapai {totalAnalisaInstr} sampel teranalisa dengan sisa antrean {totalMasukInstr - totalAnalisaInstr} sampel.
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              3. <b>Keuangan &amp; Penagihan:</b> Rasio pelunasan invoice tercatat {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}%. Sisa piutang Rp {(totalBilled - totalPaid).toLocaleString('id-ID')} perlu ditindaklanjuti via pengingat otomatis WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Instruments Calculation */}
      {activeTab === 'instruments' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kalkulasi Beban Analisa Per-Instrumen
                </h3>
                <p className="text-xs text-slate-400">
                  Dihitung berdasarkan sampel yang benar-benar diuji pada instrumen terkait
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                Total Teranalisa: {totalAnalisaInstr} Sampel
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Nama Instrumen</th>
                  <th className="py-3 px-4 text-center">Sampel Masuk</th>
                  <th className="py-3 px-4 text-center">Sampel Teranalisa</th>
                  <th className="py-3 px-4 text-center">Sisa Antrean</th>
                  <th className="py-3 px-4 text-center">Persentase Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(perInstrument).map(([name, stat]) => {
                  const pct = stat.masuk > 0 ? Math.round((stat.analisa / stat.masuk) * 100) : 0;
                  return (
                    <tr key={name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{stat.masuk}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        {stat.analisa}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                            stat.sisa > 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {stat.sisa}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: API Integration */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  REST API Endpoint Laporan Bulanan
                </h3>
              </div>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh JSON</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Gunakan endpoint API ini untuk menarik rekapitulasi data bulanan ke dalam sistem ERP eksternal, dashboard PowerBI, Google Sheets, atau aplikasi holding otomatis:
            </p>

            <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400">
              <div className="flex items-center justify-between pb-2 text-[11px] text-slate-400 border-b border-slate-800">
                <span>GET Endpoint URL</span>
                <button
                  onClick={handleCopyApi}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copiedApi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedApi ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>
              <div className="mt-2 break-all text-slate-200">{apiEndpointUrl}</div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300">
              <span className="text-[11px] text-slate-500 block mb-2">Contoh Pemanggilan cURL:</span>
              <pre className="overflow-x-auto text-emerald-400">{curlExample}</pre>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20 text-xs text-slate-700 dark:text-slate-300">
              <b className="text-emerald-800 dark:text-emerald-300 block mb-1">
                Karakteristik Payload API Bulanan:
              </b>
              &bull; <code>uniqueSampleCount</code>: Jumlah sampel unik dihitung per ID Sampel fisik.
              <br />
              &bull; <code>perInstrumentBreakdown</code>: Rincian sampel masuk, teranalisa, sisa, dan downtime tiap instrumen.
              <br />
              &bull; <code>financial</code> &amp; <code>sales</code>: Agregat penagihan, pembayaran kas, dan nilai kontrak.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
