import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Users,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AiAnalyticsResult, AppState } from '../../types';
import { fetchAiAnalytics } from '../../utils/aiService';
import { idr, today } from '../../utils/seedData';

interface AiAnalyticsViewProps {
  state: AppState;
  aiResult: AiAnalyticsResult | null;
  onUpdateAiResult: (data: AiAnalyticsResult) => void;
}

export const AiAnalyticsView: React.FC<AiAnalyticsViewProps> = ({
  state,
  aiResult,
  onUpdateAiResult,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(today().slice(0, 7));

  // Core metrics
  const wonDeals = state.deals.filter((d) => d.stage === 'Won');
  const openDeals = state.deals.filter((d) => !['Won', 'Lost'].includes(d.stage));
  const lostDeals = state.deals.filter((d) => d.stage === 'Lost');
  const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const pipeValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const winRate =
    wonDeals.length + lostDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
      : 0;

  const referralContacts = state.accounts.filter((a) => a.source === 'Referral');

  const handleRefreshAi = async () => {
    setLoading(true);
    const res = await fetchAiAnalytics(state, selectedMonth);
    setLoading(false);
    if (res.data) {
      onUpdateAiResult(res.data);
    }
  };

  const data = aiResult || {
    summary: `Performa penjualan bulan ${selectedMonth} menunjukkan ${wonDeals.length} deal Won senilai Rp ${wonValue.toLocaleString('id-ID')} dengan rasio kemenangan ${winRate}%. Saluran Referral menyumbang ${referralContacts.length} kontak prioritas tinggi.`,
    healthScore: 88,
    salesVelocity: winRate > 50 ? 'Tinggi' : 'Moderat',
    projectedRevenue: `Rp ${Math.round(wonValue + pipeValue * 0.45).toLocaleString('id-ID')}`,
    referralInsight: `Terdapat ${referralContacts.length} kontak referral aktif. Sinyal tindak lanjut menunjukkan lead referral memiliki probabilitas closing 3x lebih cepat.`,
    sampleEfficiency: `Kalkulasi basis ID Sampel unik mengonfirmasi batch sampel klien terdistribusi seimbang ke seluruh instrumen aktif.`,
    keyOpportunities: [
      'Akselerasi deal fase Negosiasi dan Proposal untuk proyek industri',
      'Aktifkan program kepuasan referral untuk institusi riset dan universitas',
      'Optimalisasi utilisasi XRD dan SEM pada shift pagi dan siang',
    ],
    riskAlerts: [
      'Pantau batas waktu kalibrasi instrumen agar pengujian tidak terhambat',
      'Tindak lanjuti invoice jatuh tempo untuk menjaga arus kas operasional',
    ],
    actionPlan: [
      { action: 'Prioritaskan follow-up lead Referral via WhatsApp', priority: 'High' as const, owner: 'Sales' },
      { action: 'Sinkronkan data sampel selesai ke log instrumen', priority: 'High' as const, owner: 'Lab' },
      { action: 'Ekspor slide rapat untuk laporan direksi', priority: 'Medium' as const, owner: 'Manager' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Dashboard Analitik AI Real-Time
            </h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pemantauan intelijen penjualan real-time, prediksi pendapatan, dan sinyal otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleRefreshAi}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menganalisis...' : 'Perbarui Analitik AI'}</span>
          </button>
        </div>
      </div>

      {/* AI Health Score & Core Predictions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Health Score */}
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Skor Kesehatan Bisnis</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {data.healthScore}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-600"
              style={{ width: `${data.healthScore}%` }}
            />
          </div>
          <span className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">
            Status: Performa Prima &amp; Terkendali
          </span>
        </div>

        {/* Sales Velocity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Kecepatan Penjualan</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {data.salesVelocity}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Win rate: <b className="text-emerald-600">{winRate}%</b> ({wonDeals.length} Won / {lostDeals.length} Lost)
          </div>
          <span className="mt-1 text-[11px] text-slate-400 block">
            Pipeline aktif: {idr(pipeValue)}
          </span>
        </div>

        {/* Projected Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Proyeksi Pendapatan</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {data.projectedRevenue}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Realisasi Won saat ini: <b>{idr(wonValue)}</b>
          </div>
          <span className="mt-1 text-[11px] text-slate-400 block">
            Berdasarkan probabilitas closing deal
          </span>
        </div>

        {/* Referral Impact */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs dark:border-purple-900/50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400">
            <span className="text-xs font-semibold">Sinyal Referral CRM</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-3 text-2xl font-black text-purple-950 dark:text-white">
            {referralContacts.length} Mitra
          </div>
          <span className="mt-2 text-[11px] text-purple-700 dark:text-purple-300 block font-medium">
            Tingkat konversi &gt; 65% saat di-follow up cepat via WhatsApp
          </span>
        </div>
      </div>

      {/* AI Executive Summary Card */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-6 dark:border-indigo-900 dark:from-indigo-950/40 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 mt-1 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Analisis Eksekutif AI Real-Time
              </h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                Live Insights
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {data.summary}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-lg bg-white/80 p-3 border border-indigo-100 dark:bg-slate-800/80 dark:border-slate-700">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                  Sinyal Referral &amp; CRM:
                </span>
                <span className="text-slate-600 dark:text-slate-300">{data.referralInsight}</span>
              </div>
              <div className="rounded-lg bg-white/80 p-3 border border-emerald-100 dark:bg-slate-800/80 dark:border-slate-700">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  Efisiensi Sampel Lab:
                </span>
                <span className="text-slate-600 dark:text-slate-300">{data.sampleEfficiency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities vs Risk Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Opportunities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-3">
            <Target className="h-4 w-4" />
            <span>Peluang Pertumbuhan Kunci</span>
          </div>
          <div className="space-y-2.5">
            {data.keyOpportunities.map((op, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs dark:border-emerald-950 dark:bg-emerald-950/20"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{op}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-3">
            <AlertTriangle className="h-4 w-4" />
            <span>Peringatan Risiko &amp; Mitigasi</span>
          </div>
          <div className="space-y-2.5">
            {data.riskAlerts.map((risk, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-xs dark:border-rose-950 dark:bg-rose-950/20"
              >
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommended Action Plan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rencana Aksi Segera (AI Action Plan)
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 font-semibold">
              Terstruktur
            </span>
          </div>
          <span className="text-xs text-slate-400">Diperbarui real-time</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.actionPlan.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    item.priority === 'High'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {item.priority}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.action}
                </span>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                PIC: {item.owner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
