import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Filter,
  DollarSign,
  Hash,
  ChevronDown,
  Sparkles,
  ArrowDown,
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Deal, Account } from '../types';
import { idr } from '../utils/seedData';

interface SymmetricalFunnelChartProps {
  deals: Deal[];
  accounts: Account[];
  onSelectDeal?: (deal: Deal) => void;
  className?: string;
}

export type FunnelMetric = 'value' | 'count';

interface FunnelStageConfig {
  key: Deal['stage'];
  label: string;
  description: string;
  colorGrad: string;
  borderGrad: string;
  textColor: string;
}

const FUNNEL_STAGES: FunnelStageConfig[] = [
  {
    key: 'Lead',
    label: '1. Lead Masuk',
    description: 'Calon pelanggan potensial teridentifikasi',
    colorGrad: 'from-blue-600 via-indigo-600 to-blue-700',
    borderGrad: 'border-blue-400/40',
    textColor: 'text-blue-100',
  },
  {
    key: 'Qualified',
    label: '2. Kualifikasi Kontak',
    description: 'Kebutuhan uji laboratorium tervalidasi',
    colorGrad: 'from-cyan-600 via-teal-600 to-cyan-700',
    borderGrad: 'border-cyan-400/40',
    textColor: 'text-cyan-100',
  },
  {
    key: 'Proposal',
    label: '3. Penawaran Harga',
    description: 'Surat penawaran & katalog instrumen dikirim',
    colorGrad: 'from-amber-500 via-yellow-600 to-amber-600',
    borderGrad: 'border-amber-400/40',
    textColor: 'text-amber-100',
  },
  {
    key: 'Negosiasi',
    label: '4. Negosiasi & PO',
    description: 'Finalisasi nilai diskon, terms & jadwal uji',
    colorGrad: 'from-orange-500 via-rose-500 to-orange-600',
    borderGrad: 'border-orange-400/40',
    textColor: 'text-orange-100',
  },
  {
    key: 'Won',
    label: '5. Deal Won (Menang)',
    description: 'Kontrak disetujui, sampel masuk operasional lab',
    colorGrad: 'from-emerald-600 via-green-600 to-teal-700',
    borderGrad: 'border-emerald-400/40',
    textColor: 'text-emerald-100',
  },
];

export const SymmetricalFunnelChart: React.FC<SymmetricalFunnelChartProps> = ({
  deals,
  accounts,
  onSelectDeal,
  className = '',
}) => {
  const [metric, setMetric] = useState<FunnelMetric>('value');
  const [selectedStage, setSelectedStage] = useState<Deal['stage'] | null>(null);

  // Group deals by stage
  const stageStats = useMemo(() => {
    return FUNNEL_STAGES.map((cfg, index) => {
      const stageDeals = deals.filter((d) => d.stage === cfg.key);
      const totalVal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
      const count = stageDeals.length;

      return {
        ...cfg,
        index,
        deals: stageDeals,
        totalVal,
        count,
      };
    });
  }, [deals]);

  const lostDeals = useMemo(() => deals.filter((d) => d.stage === 'Lost'), [deals]);
  const lostVal = useMemo(
    () => lostDeals.reduce((s, d) => s + (Number(d.value) || 0), 0),
    [lostDeals]
  );

  // Top of the funnel reference (baseline for width calculation)
  const baseValue = Math.max(stageStats[0]?.totalVal || 1, 1);
  const baseCount = Math.max(stageStats[0]?.count || 1, 1);

  // Maximum metrics across stages for proportional width
  const maxVal = Math.max(...stageStats.map((s) => s.totalVal), 1);
  const maxCount = Math.max(...stageStats.map((s) => s.count), 1);

  // Calculate symmetrical tiers
  const tiers = useMemo(() => {
    return stageStats.map((stage, idx) => {
      const prevStage = idx > 0 ? stageStats[idx - 1] : null;

      // Conversion rate from previous stage
      let convRate = 100;
      let dropRate = 0;
      if (prevStage) {
        if (metric === 'value') {
          convRate = prevStage.totalVal > 0 ? Math.round((stage.totalVal / prevStage.totalVal) * 100) : 0;
        } else {
          convRate = prevStage.count > 0 ? Math.round((stage.count / prevStage.count) * 100) : 0;
        }
        dropRate = Math.max(0, 100 - convRate);
      }

      // Symmetrical Width calculation (clamped between 32% and 100%)
      const ratio = metric === 'value' ? stage.totalVal / maxVal : stage.count / maxCount;
      const widthPct = Math.max(32, Math.min(100, Math.round(ratio * 100)));

      // Cumulative conversion from top of funnel (Lead)
      const topConv =
        metric === 'value'
          ? Math.round((stage.totalVal / baseValue) * 100)
          : Math.round((stage.count / baseCount) * 100);

      return {
        ...stage,
        convRate,
        dropRate,
        widthPct,
        topConv,
      };
    });
  }, [stageStats, metric, maxVal, maxCount, baseValue, baseCount]);

  const overallWinRate = useMemo(() => {
    const wonCount = stageStats.find((s) => s.key === 'Won')?.count || 0;
    const totalFinished = wonCount + lostDeals.length;
    return totalFinished > 0 ? Math.round((wonCount / totalFinished) * 100) : 0;
  }, [stageStats, lostDeals]);

  const activeDealsForSelected = useMemo(() => {
    if (!selectedStage) return [];
    return deals.filter((d) => d.stage === selectedStage);
  }, [deals, selectedStage]);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Chart Funnel Penjualan Simetris</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Symmetrical Type
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualisasi simetris tahapan konversi deal, tingkat kelolosan (pass-rate), dan nilai pipeline tiap tahap
          </p>
        </div>

        {/* Metric Toggle & Info */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setMetric('value')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                metric === 'value'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Nilai (Rp)</span>
            </button>
            <button
              onClick={() => setMetric('count')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                metric === 'count'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              <span>Jumlah Deal</span>
            </button>
          </div>

          <span className="hidden md:inline-flex rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Win Rate: {overallWinRate}%
          </span>
        </div>
      </div>

      {/* Symmetrical Funnel Stage Rendering */}
      <div className="mt-6 space-y-3.5">
        {tiers.map((tier, idx) => {
          const isSelected = selectedStage === tier.key;

          return (
            <div key={tier.key} className="relative group">
              {/* Drop-off / Conversion indicator connecting tiers */}
              {idx > 0 && (
                <div className="flex items-center justify-center -my-2 z-10 relative">
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 shadow-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    <ArrowDown className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Pass: {tier.convRate}%</span>
                    {tier.dropRate > 0 && (
                      <span className="text-rose-500 font-semibold">
                        (Drop: {tier.dropRate}%)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Symmetrically Centered Tier Block */}
              <div
                onClick={() => setSelectedStage(isSelected ? null : tier.key)}
                style={{
                  width: `${tier.widthPct}%`,
                  margin: '0 auto',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={`cursor-pointer rounded-2xl bg-gradient-to-r ${tier.colorGrad} p-3.5 sm:p-4 text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition border ${
                  isSelected
                    ? 'ring-4 ring-emerald-400/50 shadow-emerald-500/20'
                    : 'border-white/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Left: Stage Title & Description */}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black tracking-tight drop-shadow-xs">
                        {tier.label}
                      </span>
                      <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px] font-bold backdrop-blur-xs">
                        {tier.count} Deal
                      </span>
                    </div>
                    <span className="text-[11px] text-white/80 line-clamp-1">
                      {tier.description}
                    </span>
                  </div>

                  {/* Right: Metrics & Value */}
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-sm sm:text-base font-black font-mono tracking-tight text-white drop-shadow-xs">
                      {idr(tier.totalVal)}
                    </div>
                    <div className="text-[10px] text-white/70 flex items-center sm:justify-end gap-1.5">
                      <span>Rata-rata: {tier.count > 0 ? idr(Math.round(tier.totalVal / tier.count)) : idr(0)}</span>
                      <span>&bull;</span>
                      <span className="font-bold text-white/90">{tier.topConv}% dari Top</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Footnote & Lost Deal Summary */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Klik pada setiap tahapan funnel simetris untuk memfilter dan memeriksa rincian deal di tahapan tersebut.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
            <XCircle className="h-3.5 w-3.5" />
            <span>Lost: {lostDeals.length} Deal ({idr(lostVal)})</span>
          </span>
        </div>
      </div>

      {/* Expanded Drilldown Panel when a stage is clicked */}
      {selectedStage && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Daftar Deal di Tahap: <span className="text-emerald-700 dark:text-emerald-300 font-black">{selectedStage}</span> ({activeDealsForSelected.length} Deal)
              </h4>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Tutup Rincian &times;
            </button>
          </div>

          {activeDealsForSelected.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Belum ada deal aktif pada tahapan ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto">
              {activeDealsForSelected.map((d) => {
                const client = accounts.find((a) => a.id === d.accId);
                return (
                  <div
                    key={d.id}
                    onClick={() => onSelectDeal && onSelectDeal(d)}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {d.title}
                      </h5>
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {idr(d.value)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {client?.name || 'Customer'} &bull; Segmen: {client?.industry || 'General'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t pt-1 border-slate-100 dark:border-slate-800">
                      <span>Owner: {d.owner}</span>
                      <span>Target: {d.close || '-'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
