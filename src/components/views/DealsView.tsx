import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, X, Upload } from 'lucide-react';
import { Account, Deal, Invoice, LabWorkOrder, MasterInstrument, Quote } from '../../types';
import { STAGES, idr, uid } from '../../utils/seedData';

interface DealsViewProps {
  deals: Deal[];
  accounts: Account[];
  fins?: Invoice[];
  labs?: LabWorkOrder[];
  insts?: MasterInstrument[];
  quotes?: Quote[];
  onSaveDeal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
  onOpenImportExcel?: () => void;
  isMobile?: boolean;
}

// Compact currency formatter matching screenshot (e.g., "Rp 3 jt", "Rp 500 rb", "Rp 0")
export const compactIdr = (val: number): string => {
  if (!val || val === 0) return 'Rp 0';
  if (val >= 1_000_000_000) {
    const b = val / 1_000_000_000;
    return `Rp ${b % 1 === 0 ? b : b.toFixed(1)} M`;
  }
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return `Rp ${m % 1 === 0 ? m : m.toFixed(1)} jt`;
  }
  if (val >= 1_000) {
    const k = val / 1_000;
    return `Rp ${k % 1 === 0 ? k : k.toFixed(0)} rb`;
  }
  return idr(val);
};

export const DealsView: React.FC<DealsViewProps> = ({
  deals,
  accounts,
  fins = [],
  labs = [],
  quotes = [],
  onSaveDeal,
  onDeleteDeal,
  onOpenImportExcel,
  isMobile = false,
}) => {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detect small screens (mobile phones) or mobile frame simulator
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const isMobileEffective = isMobile || isSmallScreen;

  // Mobile-specific layout switchers to prevent squishing or overlapping
  const [mobileCardTab, setMobileCardTab] = useState<'all' | 'funnel' | 'pipeline' | 'service'>('all');
  const [selectedMobileStage, setSelectedMobileStage] = useState<'all' | Deal['stage']>('all');

  // Card 2: Pipeline Composition Filters
  const [groupBy, setGroupBy] = useState<'industry' | 'source'>('industry');
  const [metricBy, setMetricBy] = useState<'value' | 'count'>('value');

  // Card 3: Service Contribution Filters
  const [filterYear, setFilterYear] = useState<string>('2026');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<'metode' | 'instrumen' | 'layanan'>('metode');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'piutang'>('all');

  // Form State
  const [formData, setFormData] = useState<Partial<Deal>>({
    title: '',
    accId: accounts[0]?.id || '',
    value: 10000000,
    stage: 'Lead',
    owner: 'Ricoh',
    close: '',
    probability: 50,
    serviceStatus: 'Normal',
    serviceClosedNote: '',
    closedFrom: '',
    closedUntil: '',
  });

  const openAddModal = (initialStage: Deal['stage'] = 'Lead') => {
    setEditingDeal(null);
    setFormData({
      id: uid(),
      title: '',
      accId: accounts[0]?.id || '',
      value: 15000000,
      stage: initialStage,
      owner: 'Ricoh',
      close: '',
      probability: 50,
      serviceStatus: 'Normal',
      serviceClosedNote: '',
      closedFrom: '',
      closedUntil: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: Deal) => {
    setEditingDeal(d);
    setFormData({
      ...d,
      serviceStatus: d.serviceStatus || 'Normal',
      serviceClosedNote: d.serviceClosedNote || '',
      closedFrom: d.closedFrom || '',
      closedUntil: d.closedUntil || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const dealToSave: Deal = {
      id: editingDeal ? editingDeal.id : uid(),
      title: formData.title || '',
      accId: formData.accId || accounts[0]?.id || '',
      value: Number(formData.value) || 0,
      stage: (formData.stage as Deal['stage']) || 'Lead',
      owner: formData.owner || 'Ricoh',
      close: formData.close || '',
      probability: Number(formData.probability) || 50,
      serviceStatus: formData.serviceStatus || 'Normal',
      serviceClosedNote: formData.serviceClosedNote || undefined,
      closedFrom: formData.closedFrom || undefined,
      closedUntil: formData.closedUntil || undefined,
    };

    onSaveDeal(dealToSave);
    setIsModalOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal['stage']) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    const deal = deals.find((d) => d.id === dealId);
    if (deal && deal.stage !== targetStage) {
      onSaveDeal({ ...deal, stage: targetStage });
    }
  };

  // =========================================================================
  // 1. CARD 1: FUNNEL PENJUALAN (SIMETRIS)
  // "Tiap tahap menghitung deal yang mencapai tahap itu atau lebih jauh; deal Lost dihitung di tahap Lead."
  // =========================================================================
  const funnelStages: Deal['stage'][] = ['Lead', 'Qualified', 'Proposal', 'Negosiasi', 'Won'];

  const getCumulativeDeals = (st: Deal['stage']) => {
    if (st === 'Lead') {
      return deals; // All deals reached at least Lead (including Lost)
    }
    if (st === 'Qualified') {
      return deals.filter(
        (d) => d.stage === 'Qualified' || d.stage === 'Proposal' || d.stage === 'Negosiasi' || d.stage === 'Won'
      );
    }
    if (st === 'Proposal') {
      return deals.filter((d) => d.stage === 'Proposal' || d.stage === 'Negosiasi' || d.stage === 'Won');
    }
    if (st === 'Negosiasi') {
      return deals.filter((d) => d.stage === 'Negosiasi' || d.stage === 'Won');
    }
    if (st === 'Won') {
      return deals.filter((d) => d.stage === 'Won');
    }
    return [];
  };

  const funnelStats = funnelStages.map((stageName, idx) => {
    const stageDeals = getCumulativeDeals(stageName);
    const count = stageDeals.length;
    const val = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    let convPct = 0;
    let valPct = 0;
    if (idx > 0) {
      const prevDeals = getCumulativeDeals(funnelStages[idx - 1]);
      const prevCount = prevDeals.length;
      const prevVal = prevDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
      convPct = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
      valPct = prevVal > 0 ? Math.round((val / prevVal) * 100) : 0;
    }

    return {
      stage: stageName,
      count,
      val,
      convPct,
      valPct,
    };
  });

  const leadCount = funnelStats[0]?.count || 0;
  const wonCount = funnelStats[4]?.count || 0;
  const overallLeadToWon = leadCount > 0 ? Math.round((wonCount / leadCount) * 100) : 0;

  // =========================================================================
  // 2. CARD 2: KOMPOSISI PIPELINE PER SEGMEN / BIDANG
  // "Tidak termasuk deal Lost."
  // =========================================================================
  const pipelinePalette = ['#0c5c48', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#64748b'];

  const pipelineDistribution: Record<string, number> = {};
  deals
    .filter((d) => d.stage !== 'Lost')
    .forEach((d) => {
      const acc = accounts.find((a) => a.id === d.accId);
      const key = (groupBy === 'industry' ? acc?.industry : acc?.source) || 'Lainnya';
      pipelineDistribution[key] =
        (pipelineDistribution[key] || 0) + (metricBy === 'value' ? Number(d.value) || 0 : 1);
    });

  const totalPipelineDist = Object.values(pipelineDistribution).reduce((sum, v) => sum + v, 0);
  const pipelineEntries = Object.entries(pipelineDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([label, val], idx) => ({
      label,
      value: val,
      pct: totalPipelineDist > 0 ? Math.round((val / totalPipelineDist) * 100) : 0,
      color: pipelinePalette[idx % pipelinePalette.length],
    }));

  // =========================================================================
  // 3. CARD 3: KONTRIBUSI LAYANAN (REVENUE PER KATEGORI PENGUJIAN / METODE)
  // =========================================================================
  const servicePalette = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1', '#64748b'];

  const filteredInvoices = useMemo(() => {
    return fins.filter((inv) => {
      if (filterYear !== 'all') {
        const invYear = inv.date?.slice(0, 4) || '2026';
        if (invYear !== filterYear) return false;
      }
      if (filterMonth !== 'all') {
        const invMonth = parseInt(inv.date?.slice(5, 7) || '1', 10).toString();
        if (invMonth !== filterMonth) return false;
      }
      if (filterStatus === 'lunas') {
        if ((inv.paid || 0) < (inv.amount || 0) || inv.amount <= 0) return false;
      } else if (filterStatus === 'piutang') {
        if ((inv.paid || 0) >= (inv.amount || 0)) return false;
      }
      return true;
    });
  }, [fins, filterYear, filterMonth, filterStatus]);

  // Aggregate revenue by method/instrument
  const { serviceSlices, totalRevenue, totalPaid, totalPiutang } = useMemo(() => {
    let rev = 0;
    let paid = 0;
    let piutang = 0;
    const catMap: Record<string, number> = {};

    filteredInvoices.forEach((inv) => {
      const invAmt = Number(inv.amount) || 0;
      const invPaid = Number(inv.paid) || 0;
      rev += invAmt;
      paid += Math.min(invPaid, invAmt);
      piutang += Math.max(0, invAmt - invPaid);

      if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item) => {
          const method = item.m || item.d?.replace(/^Jasa analisa:\s*/i, '').slice(0, 15) || 'Umum';
          const itemVal = (Number(item.p) || 0) * (Number(item.q) || 1);
          catMap[method] = (catMap[method] || 0) + itemVal;
        });
      } else {
        const linkedLab = labs.find((l) => l.id === inv.labId);
        const linkedQuote = quotes.find((q) => q.id === inv.dealId);
        const method = linkedLab?.service || linkedQuote?.items?.[0]?.m || 'FTIR';
        catMap[method] = (catMap[method] || 0) + invAmt;
      }
    });

    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const slices = entries.map(([label, val], idx) => ({
      label,
      value: val,
      pct: rev > 0 ? Number(((val / rev) * 100).toFixed(1)) : 0,
      color: servicePalette[idx % servicePalette.length],
    }));

    return {
      serviceSlices: slices,
      totalRevenue: rev,
      totalPaid: paid,
      totalPiutang: piutang,
    };
  }, [filteredInvoices, labs, quotes]);

  // =========================================================================
  // 4. KANBAN BOARD: SEARCH FILTERED DEALS
  // =========================================================================
  const filteredDeals = useMemo(() => {
    if (!searchQuery.trim()) return deals;
    const q = searchQuery.toLowerCase();
    return deals.filter((d) => {
      const acc = accounts.find((a) => a.id === d.accId);
      return (
        d.title.toLowerCase().includes(q) ||
        (acc?.name || '').toLowerCase().includes(q) ||
        (acc?.pic || '').toLowerCase().includes(q)
      );
    });
  }, [deals, accounts, searchQuery]);

  // Symmetrical Funnel Box Width Helper (Mobile-first responsive percentages with max-width)
  const getFunnelWidthClass = (idx: number) => {
    switch (idx) {
      case 0:
        return 'w-full max-w-[320px]';
      case 1:
        return 'w-[92%] max-w-[290px]';
      case 2:
        return 'w-[84%] max-w-[260px]';
      case 3:
        return 'w-[76%] max-w-[230px]';
      case 4:
        return 'w-[68%] max-w-[200px]';
      default:
        return 'w-[80%] max-w-[260px]';
    }
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* MOBILE TAB CONTROLLER FOR 3 ANALYTICS CARDS (PREVENTS SQUISHING ON MOBILE)*/}
      {/* ========================================================================= */}
      {isMobileEffective && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setMobileCardTab('all')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-center text-[11px] font-bold rounded-lg transition ${
              mobileCardTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setMobileCardTab('funnel')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 text-center text-[11px] font-bold rounded-lg transition ${
              mobileCardTab === 'funnel'
                ? 'bg-white text-[#0c5c48] shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Funnel
          </button>
          <button
            onClick={() => setMobileCardTab('pipeline')}
            className={`flex-1 min-w-[80px] py-1.5 px-2 text-center text-[11px] font-bold rounded-lg transition ${
              mobileCardTab === 'pipeline'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Komposisi
          </button>
          <button
            onClick={() => setMobileCardTab('service')}
            className={`flex-1 min-w-[80px] py-1.5 px-2 text-center text-[11px] font-bold rounded-lg transition ${
              mobileCardTab === 'service'
                ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Layanan
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP SECTION: 3 CARDS (DESKTOP: 3 COLS, MOBILE: STACKED / TABBED)          */}
      {/* ========================================================================= */}
      <div className={isMobileEffective ? 'flex flex-col space-y-4' : 'grid grid-cols-1 xl:grid-cols-3 gap-4'}>
        {/* CARD 1: FUNNEL PENJUALAN */}
        {(!isMobileEffective || mobileCardTab === 'all' || mobileCardTab === 'funnel') && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full overflow-hidden">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
                Funnel penjualan
              </h3>

              {/* Symmetrical Funnel Container */}
              <div className="flex flex-col items-center justify-center py-1 w-full">
                {funnelStats.map((item, idx) => (
                  <React.Fragment key={item.stage}>
                    {idx > 0 && (
                      <div className="text-[10px] text-slate-400 py-1 text-center font-medium">
                        &darr; konversi {item.convPct}% &bull; nilai {item.valPct}%
                      </div>
                    )}

                    <div
                      className={`${getFunnelWidthClass(
                        idx
                      )} rounded-xl bg-[#0c5c48] px-3.5 py-2 text-white shadow-xs transition-all flex items-center justify-between text-xs font-semibold mx-auto`}
                    >
                      <span className="truncate pr-1">{item.stage}</span>
                      <span className="font-normal font-mono text-[11px] opacity-95 shrink-0">
                        {item.count} deal &bull; {compactIdr(item.val)}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/60">
              Konversi keseluruhan Lead&rarr;Won: <b>{overallLeadToWon}%</b>. Tiap tahap menghitung deal yang mencapai tahap itu atau lebih jauh; deal Lost dihitung di tahap Lead.
            </p>
          </div>
        )}

        {/* CARD 2: KOMPOSISI PIPELINE PER SEGMEN / BIDANG */}
        {(!isMobileEffective || mobileCardTab === 'all' || mobileCardTab === 'pipeline') && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full overflow-hidden">
            <div>
              {/* Header & Dropdowns */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Komposisi pipeline per segmen / bidang
                </h3>

                <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="industry">Segmen / bidang</option>
                    <option value="source">Sumber Lead</option>
                  </select>

                  <select
                    value={metricBy}
                    onChange={(e) => setMetricBy(e.target.value as any)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="value">% Nilai (Rp)</option>
                    <option value="count">% Jumlah Deal</option>
                  </select>
                </div>
              </div>

              {/* Donut Chart: Bounded SVG 140x140 with Radius 50 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 w-full overflow-hidden">
                <div className="relative shrink-0 flex items-center justify-center" style={{ width: 140, height: 140 }}>
                  <svg width={140} height={140} viewBox="0 0 140 140" className="rotate-[-90deg] shrink-0">
                    {/* Background Track Circle */}
                    <circle
                      cx={70}
                      cy={70}
                      r={50}
                      fill="none"
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                      strokeWidth={18}
                    />

                    {/* Slices */}
                    {totalPipelineDist > 0 &&
                      (() => {
                        const circumference = 2 * Math.PI * 50;
                        let offset = 0;
                        return pipelineEntries.map((slice, i) => {
                          const dasharray = `${(slice.pct / 100) * circumference} ${circumference}`;
                          const dashoffset = -offset;
                          offset += (slice.pct / 100) * circumference;

                          return (
                            <circle
                              key={i}
                              cx={70}
                              cy={70}
                              r={50}
                              fill="none"
                              stroke={slice.color}
                              strokeWidth={18}
                              strokeDasharray={dasharray}
                              strokeDashoffset={dashoffset}
                            />
                          );
                        });
                      })()}
                  </svg>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {metricBy === 'value' ? compactIdr(totalPipelineDist) : `${totalPipelineDist} Deal`}
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="w-full sm:flex-1 min-w-[120px] space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
                  {totalPipelineDist === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center sm:text-left py-4">
                      Belum ada deal
                    </p>
                  ) : (
                    pipelineEntries.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-slate-700 dark:text-slate-300">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-900 dark:text-white">{item.pct}%</span>
                          <span className="text-slate-400 font-mono">
                            {metricBy === 'value' ? compactIdr(item.value) : `${item.value} deal`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              Tidak termasuk deal Lost.
            </p>
          </div>
        )}

        {/* CARD 3: KONTRIBUSI LAYANAN */}
        {(!isMobileEffective || mobileCardTab === 'all' || mobileCardTab === 'service') && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full overflow-hidden">
            <div>
              {/* Header & Subtitle */}
              <div className="mb-2.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Kontribusi Layanan
                </h3>
                <p className="text-[11px] text-slate-400">
                  Proporsi revenue per kategori &bull; tahun {filterYear === 'all' ? 'semua' : filterYear}
                </p>
              </div>

              {/* Filter Dropdowns Row: 2x2 grid on mobile to prevent overlapping */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 mb-3 w-full">
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="all">Semua</option>
                </select>

                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto"
                >
                  <option value="all">Semua bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto"
                >
                  <option value="metode">Per metode</option>
                  <option value="instrumen">Per instrumen</option>
                  <option value="layanan">Per layanan</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto"
                >
                  <option value="all">Semua status</option>
                  <option value="lunas">Lunas</option>
                  <option value="piutang">Piutang</option>
                </select>
              </div>

              {/* Donut Chart: Bounded SVG 140x140 with Radius 50 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 w-full overflow-hidden">
                <div className="relative shrink-0 flex items-center justify-center" style={{ width: 140, height: 140 }}>
                  <svg width={140} height={140} viewBox="0 0 140 140" className="rotate-[-90deg] shrink-0">
                    {/* Background Track Circle */}
                    <circle
                      cx={70}
                      cy={70}
                      r={50}
                      fill="none"
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                      strokeWidth={18}
                    />

                    {/* Slices */}
                    {totalRevenue > 0 &&
                      (() => {
                        const circumference = 2 * Math.PI * 50;
                        let offset = 0;
                        return serviceSlices.map((slice, i) => {
                          const dasharray = `${(slice.pct / 100) * circumference} ${circumference}`;
                          const dashoffset = -offset;
                          offset += (slice.pct / 100) * circumference;

                          return (
                            <circle
                              key={i}
                              cx={70}
                              cy={70}
                              r={50}
                              fill="none"
                              stroke={slice.color}
                              strokeWidth={18}
                              strokeDasharray={dasharray}
                              strokeDashoffset={dashoffset}
                            />
                          );
                        });
                      })()}
                  </svg>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                      Revenue
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {compactIdr(totalRevenue)}
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="w-full sm:flex-1 min-w-[120px] space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
                  {totalRevenue === 0 || serviceSlices.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center sm:text-left py-4">
                      Belum ada invoice / layanan
                    </p>
                  ) : (
                    serviceSlices.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-slate-700 dark:text-slate-300">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-900 dark:text-white">{item.pct}%</span>
                          <span className="text-slate-400 font-mono">{compactIdr(item.value)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Badges: Lunas & Piutang */}
              <div className="flex items-center gap-2 mt-2 w-full">
                <span className="flex-1 sm:flex-initial text-center inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Lunas {compactIdr(totalPaid)}
                </span>
                <span className="flex-1 sm:flex-initial text-center inline-flex items-center justify-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Piutang {compactIdr(totalPiutang)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-slate-400 leading-tight pt-2 border-t border-slate-100 dark:border-slate-800/60">
              Revenue = nilai item invoice sebelum PPN. Lunas = bagian yang sudah dibayar, Piutang = sisa tagihan. Tahun mengikuti Kalender.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: PAPAN DEAL (KANBAN BOARD)                                */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        {/* Kanban Top Header with Search and + Deal Button */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Papan deal
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredDeals.length} Deal
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 shadow-2xs placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {onOpenImportExcel && (
              <button
                onClick={onOpenImportExcel}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-2xs shrink-0"
                title="Impor Pipeline Deal dari File Excel (.xlsx / .csv)"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Impor Excel</span>
                <span className="sm:hidden">Impor</span>
              </button>
            )}

            <button
              onClick={() => openAddModal()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0c5c48] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#094636] transition active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>+ Deal</span>
            </button>
          </div>
        </div>

        {/* Mobile Stage Selector Pills */}
        {isMobileEffective && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setSelectedMobileStage('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition ${
                selectedMobileStage === 'all'
                  ? 'bg-[#0c5c48] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              Semua ({filteredDeals.length})
            </button>
            {STAGES.map((st) => {
              const count = filteredDeals.filter((d) => d.stage === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedMobileStage(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition ${
                    selectedMobileStage === st
                      ? 'bg-[#0c5c48] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Kanban Board Container */}
        {isMobileEffective && selectedMobileStage !== 'all' ? (
          /* Mobile Single Focused Stage View (Full Width, Zero Squeeze) */
          (() => {
            const stage = selectedMobileStage;
            const stageDeals = filteredDeals.filter((d) => d.stage === stage);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

            return (
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs w-full">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Tahap: {stage}
                    </h4>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {stageDeals.length} Deal
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {idr(stageTotal)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stageDeals.map((d) => {
                    const client = accounts.find((a) => a.id === d.accId);
                    return (
                      <div
                        key={d.id}
                        onClick={() => openEditModal(d)}
                        className="group cursor-pointer rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-2xs hover:border-emerald-500 hover:bg-white transition dark:border-slate-800 dark:bg-slate-800/80"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                            {d.title}
                          </h5>
                        </div>

                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {client?.name || 'Pelanggan'} {client?.pic ? `• ${client.pic}` : ''}
                        </div>

                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs dark:border-slate-700/60">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {idr(d.value)}
                          </span>
                          <span className="text-[10px] text-slate-400">Target: {d.close || '-'}</span>
                        </div>

                        {d.serviceStatus && d.serviceStatus !== 'Normal' && (
                          <div className="mt-2 rounded bg-rose-50 p-1.5 text-[10px] text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                            <span className="font-bold">⛔ {d.serviceStatus}:</span> {d.serviceClosedNote || 'Layanan sedang ditutup'}
                          </div>
                        )}

                        {/* Mobile 1-Tap Stage Switcher */}
                        <div
                          className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between gap-1 text-[10px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-slate-400 font-medium">Pindah tahap:</span>
                          <select
                            value={d.stage}
                            onChange={(e) => onSaveDeal({ ...d, stage: e.target.value as Deal['stage'] })}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {stageDeals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
                      <p>Belum ada deal di tahap {stage}</p>
                      <button
                        onClick={() => openAddModal(stage)}
                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                      >
                        + Tambah deal baru
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          /* Mobile Horizontal Snap-Swipe Carousel OR Desktop 6-Column Grid */
          <div
            className={
              isMobileEffective
                ? 'flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar -mx-2 px-2'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3'
            }
          >
            {STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage);
              const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

              return (
                <div
                  key={stage}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-3 min-h-[260px] dark:border-slate-800 dark:bg-slate-900 shadow-2xs ${
                    isMobileEffective ? 'w-[82vw] max-w-[320px] shrink-0 snap-center' : ''
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {stage}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {stageDeals.length} &bull; {compactIdr(stageTotal)}
                    </span>
                  </div>

                  {/* Deal Cards Container */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
                    {stageDeals.map((d) => {
                      const client = accounts.find((a) => a.id === d.accId);

                      return (
                        <div
                          key={d.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', d.id)}
                          onClick={() => openEditModal(d)}
                          className="group cursor-grab rounded-xl border border-slate-200/90 bg-slate-50/60 p-2.5 shadow-2xs hover:border-emerald-500 hover:bg-white hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                              {d.title}
                            </h5>
                          </div>

                          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {client?.name || 'Pelanggan'} {client?.pic ? `• ${client.pic}` : ''}
                          </div>

                          <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[11px] dark:border-slate-700/60">
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {idr(d.value)}
                            </span>
                            <span className="text-[10px] text-slate-400">{d.close || '-'}</span>
                          </div>

                          {d.serviceStatus && d.serviceStatus !== 'Normal' && (
                            <div className="mt-1.5 rounded bg-rose-50 p-1.5 text-[10px] text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                              <span className="font-bold">⛔ {d.serviceStatus}:</span> {d.serviceClosedNote || 'Layanan sedang ditutup'}
                            </div>
                          )}

                          {/* Quick Stage Mover on Mobile */}
                          {isMobileEffective && (
                            <div
                              className="mt-2 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between gap-1 text-[10px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-slate-400">Tahap:</span>
                              <select
                                value={d.stage}
                                onChange={(e) => onSaveDeal({ ...d, stage: e.target.value as Deal['stage'] })}
                                className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                              >
                                {STAGES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200/70 text-[11px] text-slate-400 dark:border-slate-800/80">
                        {isMobileEffective ? 'Belum ada deal' : 'Tarik deal ke sini'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL EDIT / TAMBAH DEAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDeal ? 'Edit Deal Penjualan' : 'Tambah Deal Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Deal / Proyek Pengujian *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Paket Karakterisasi Material Riset SEM & XRD"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Customer / Perusahaan
                  </label>
                  <select
                    value={formData.accId}
                    onChange={(e) => setFormData({ ...formData, accId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {accounts.length === 0 ? (
                      <option value="">-- Belum ada akun mitra --</option>
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
                    Nilai Kontrak (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.value || 0}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tahapan Funnel
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Closing
                  </label>
                  <input
                    type="date"
                    value={formData.close || ''}
                    onChange={(e) => setFormData({ ...formData, close: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Layanan & Catatan Keterangan Penutupan */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Status Layanan Terkait Deal
                  </label>
                  <select
                    value={formData.serviceStatus || 'Normal'}
                    onChange={(e) => setFormData({ ...formData, serviceStatus: e.target.value as any })}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      formData.serviceStatus === 'Layanan Ditutup'
                        ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : formData.serviceStatus === 'Ditunda'
                        ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <option value="Normal">Normal (Beroperasi)</option>
                    <option value="Layanan Ditutup">⛔ Layanan Ditutup</option>
                    <option value="Ditunda">⚠️ Ditunda Sementara</option>
                  </select>
                </div>

                {formData.serviceStatus && formData.serviceStatus !== 'Normal' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-semibold text-rose-800 dark:text-rose-300 mb-1">
                        Catatan Keterangan Layanan Ditutup / Alasan Penutupan *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formData.serviceClosedNote || ''}
                        onChange={(e) => setFormData({ ...formData, serviceClosedNote: e.target.value })}
                        placeholder="Contoh: Permintaan pengujian XRD ditutup sementara hingga kalibrasi tabung selesai, telah diinfokan ke PIC..."
                        className="w-full rounded-lg border border-rose-300 p-2 text-xs dark:border-rose-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400">
                          Mulai Ditutup
                        </label>
                        <input
                          type="date"
                          value={formData.closedFrom || ''}
                          onChange={(e) => setFormData({ ...formData, closedFrom: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400">
                          Estimasi Dibuka Kembali
                        </label>
                        <input
                          type="date"
                          value={formData.closedUntil || ''}
                          onChange={(e) => setFormData({ ...formData, closedUntil: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {editingDeal && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hapus deal ini?')) {
                        onDeleteDeal(editingDeal.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Deal</span>
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0c5c48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094636] transition"
                  >
                    Simpan Deal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
