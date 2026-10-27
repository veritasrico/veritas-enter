import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Presentation,
  DollarSign,
  Users,
  Award,
  AlertTriangle,
  Globe,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Check,
  Building2,
  Layers,
} from 'lucide-react';
import { AppState } from '../../types';
import { idr } from '../../utils/seedData';
import { TabKey } from '../Sidebar';

interface OverviewDashboardViewProps {
  state: AppState;
  onNavigate: (tab: TabKey) => void;
  onOpenWa: (acc: any, templateId?: string) => void;
  onOpenSlide: () => void;
}

export const OverviewDashboardView: React.FC<OverviewDashboardViewProps> = ({
  state,
  onNavigate,
  onOpenSlide,
}) => {
  const [dateRange, setDateRange] = useState<string>('Jun 1, 2023 - May 31, 2024');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'IDR'>('IDR');

  // Real data anchors combined with business baseline
  const wonDeals = useMemo(() => state.deals.filter((d) => d.stage === 'Won'), [state.deals]);
  const totalInvoiced = useMemo(() => state.fins.reduce((s, f) => s + (Number(f.amount) || 0), 0), [state.fins]);
  const baseRevenueUsd = 52.4; // $52.4M baseline from image
  const totalCustomerCount = Math.max(state.accounts.length > 0 ? state.accounts.length * 85 + 400 : 1420, 1420);

  // Formatting helpers
  const formatVal = (usdM: number, idrMultiplier = 15700) => {
    if (currencyMode === 'USD') {
      return `$${usdM.toFixed(1)}M`;
    }
    const valRp = usdM * idrMultiplier * 1000000;
    if (valRp >= 1_000_000_000_000) {
      return `Rp ${(valRp / 1_000_000_000_000).toFixed(2)} T`;
    }
    return `Rp ${(valRp / 1_000_000_000).toFixed(1)} M`;
  };

  // Sparkline mini SVG component
  const MiniSparkline: React.FC<{
    data: number[];
    color: string;
    type?: 'bar' | 'line';
  }> = ({ data, color, type = 'bar' }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    if (type === 'line') {
      const points = data
        .map((val, idx) => {
          const x = (idx / (data.length - 1)) * 70;
          const y = 28 - ((val - min) / range) * 22;
          return `${x},${y}`;
        })
        .join(' ');
      return (
        <svg className="w-18 h-8 overflow-visible" viewBox="0 0 70 30">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      );
    }

    return (
      <svg className="w-18 h-8 overflow-visible" viewBox="0 0 70 30">
        {data.map((val, idx) => {
          const barHeight = Math.max(4, ((val - min) / range) * 24);
          const x = idx * 6.2;
          const y = 28 - barHeight;
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width="4.2"
              height={barHeight}
              rx="1.5"
              fill={color}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
          );
        })}
      </svg>
    );
  };

  // Monthly trend dataset
  const monthlyData = [
    { month: 'Jun', current: 3.8, prior: 3.3 },
    { month: 'Jul', current: 3.9, prior: 3.4 },
    { month: 'Aug', current: 4.1, prior: 3.5 },
    { month: 'Sep', current: 4.3, prior: 3.7 },
    { month: 'Oct', current: 4.4, prior: 3.8 },
    { month: 'Nov', current: 4.6, prior: 4.0 },
    { month: 'Dec', current: 4.9, prior: 4.2 },
    { month: 'Jan', current: 4.5, prior: 4.1 },
    { month: 'Feb', current: 4.4, prior: 3.9 },
    { month: 'Mar', current: 4.8, prior: 4.2 },
    { month: 'Apr', current: 5.0, prior: 4.3 },
    { month: 'May', current: 5.2, prior: 4.5 },
  ];

  // Business Units breakdown
  const businessUnits = [
    { name: 'Pengujian Minerba & Material', share: 42, val: 22.0, color: '#0d9488' },
    { name: 'Kalibrasi & Instrumentasi Lab', share: 28, val: 14.7, color: '#3b82f6' },
    { name: 'Lingkungan, Air & Emisi', share: 18, val: 9.4, color: '#f59e0b' },
    { name: 'Konsultansi Mutu & Sertifikasi', share: 12, val: 6.3, color: '#8b5cf6' },
  ];

  // Top 5 Products
  const topProducts = [
    { name: 'ICP-OES Multi-Element Mineral', val: 14.8, share: 28, color: '#0d9488' },
    { name: 'XRD Crystal Spec Mining', val: 12.5, share: 24, color: '#14b8a6' },
    { name: 'SEM-EDX Surface Microstructure', val: 9.4, share: 18, color: '#3b82f6' },
    { name: 'GC-MS Volatile Organic Screen', val: 8.6, share: 16, color: '#f59e0b' },
    { name: 'FTIR Polymer & Compound ID', val: 7.1, share: 14, color: '#8b5cf6' },
  ];

  // Regional breakdown
  const regions = [
    { name: 'Jawa & Jabodetabek (HQ & Industry)', val: 23.1, share: 44, color: '#0d9488' },
    { name: 'Sulawesi & Maluku (Smelter Nickel)', val: 13.6, share: 26, color: '#3b82f6' },
    { name: 'Kalimantan (Coal & Mining)', val: 9.4, share: 18, color: '#f59e0b' },
    { name: 'Sumatera (Agro & Petrochemical)', val: 4.2, share: 8, color: '#8b5cf6' },
    { name: 'Papua & Kepulauan Lainnya', val: 2.1, share: 4, color: '#64748b' },
  ];

  // Customer Segments
  const customerSegments = [
    { segment: 'Enterprise', val: 28.4, share: 54.2, growth: '+22.4%', isPositive: true },
    { segment: 'Mid-Market', val: 13.6, share: 26.0, growth: '+12.1%', isPositive: true },
    { segment: 'Small Business', val: 6.8, share: 13.0, growth: '+4.5%', isPositive: true },
    { segment: 'Consumer / Riset Akademik', val: 3.6, share: 6.8, growth: '-1.8%', isPositive: false },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. Header with Title, Date Range, Currency Toggle & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
              KELOMPOK 1
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Executive Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Key performance metrics and business insights &bull; PT NUSA VERITAS INSPEKTAMA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                currencyMode === 'USD'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrencyMode('IDR')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                currencyMode === 'IDR'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rp IDR
            </button>
          </div>

          {/* Interactive Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>{dateRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-30 animate-fadeIn">
                {[
                  'Jun 1, 2023 - May 31, 2024',
                  'Year to Date (YTD 2024)',
                  'Q3 2024 (Jul - Sep 2024)',
                  'All Time (Historical)',
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                      dateRange === opt
                        ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt}</span>
                    {dateRange === opt && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Presentation Link */}
          <button
            onClick={onOpenSlide}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Presentation className="h-3.5 w-3.5 text-amber-400 dark:text-amber-600" />
            <span>Slide Rapat</span>
          </button>

          {/* AI Analytics Shortcut */}
          <button
            onClick={() => onNavigate('ai_analytics')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-3.5 py-2 text-xs font-bold transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Analitik AI</span>
          </button>
        </div>
      </div>

      {/* 2. Top 6 Summary KPI Cards with Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            </div>
            <div className="mt-1.5 text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatVal(baseRevenueUsd)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
              <span>+14.2%</span>
              <span className="text-[10px] font-normal text-slate-400">vs PY</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <MiniSparkline data={[28, 30, 32, 35, 34, 38, 41, 40, 44, 48, 50, 52.4]} color="#0d9488" type="bar" />
          </div>
        </div>

        {/* KPI 2: Gross Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Profit</span>
            </div>
            <div className="mt-1.5 text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatVal(28.3)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
              <span>+11.8%</span>
              <span className="text-[10px] font-normal text-slate-400">vs PY</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <MiniSparkline data={[18, 19, 20, 21, 21, 23, 24, 24, 25, 26, 27, 28.3]} color="#0d9488" type="bar" />
          </div>
        </div>

        {/* KPI 3: Gross Margin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Margin</span>
            </div>
            <div className="mt-1.5 text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              54.0%
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="h-3 w-3 stroke-[3]" />
              <span>-1.2%</span>
              <span className="text-[10px] font-normal text-slate-400">vs PY</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <MiniSparkline data={[55.2, 55.0, 54.8, 54.5, 54.6, 54.2, 54.0]} color="#f43f5e" type="line" />
          </div>
        </div>

        {/* KPI 4: Operating Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operating Profit</span>
            </div>
            <div className="mt-1.5 text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatVal(15.7)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
              <span>+18.5%</span>
              <span className="text-[10px] font-normal text-slate-400">vs PY</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <MiniSparkline data={[9.2, 9.8, 10.5, 11.2, 12.0, 13.5, 14.2, 15.7]} color="#0d9488" type="bar" />
          </div>
        </div>

        {/* KPI 5: Net Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Profit</span>
            </div>
            <div className="mt-1.5 text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatVal(11.2)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
              <span>+16.3%</span>
              <span className="text-[10px] font-normal text-slate-400">vs PY</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <MiniSparkline data={[6.5, 7.0, 7.8, 8.2, 9.0, 9.8, 10.4, 11.2]} color="#0d9488" type="line" />
          </div>
        </div>

        {/* KPI 6: Total Customers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Customers</span>
            </div>
            <div className="mt-1.5 text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalCustomerCount.toLocaleString('id-ID')}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
              <span>+8.7%</span>
              <span className="text-[10px] font-normal text-slate-400">vs PY</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <MiniSparkline data={[1150, 1180, 1220, 1260, 1300, 1340, 1380, 1420]} color="#3b82f6" type="line" />
          </div>
        </div>
      </div>

      {/* 3. Middle Row 1: Revenue Trend (bar+line), Revenue by BU (donut), Top 5 Products (horizontal bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Revenue Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
                <p className="text-xs text-slate-400">Monthly revenue vs prior year</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Current Year</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-slate-700 dark:border-slate-400" />
                  <span className="text-slate-500 font-medium">Prior Year</span>
                </div>
              </div>
            </div>

            {/* SVG Trend Chart */}
            <div className="mt-6">
              <div className="h-44 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 360 140" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[30, 65, 100].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="360" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  ))}

                  {/* Monthly Bars (Current Year) */}
                  {monthlyData.map((d, i) => {
                    const x = i * 29 + 10;
                    const height = (d.current / 5.5) * 110;
                    const y = 130 - height;
                    return (
                      <g key={i} className="group cursor-pointer">
                        <rect
                          x={x}
                          y={y}
                          width="16"
                          height={height}
                          rx="3"
                          fill="#0d9488"
                          className="hover:fill-teal-500 transition-colors"
                        />
                      </g>
                    );
                  })}

                  {/* Prior Year Dashed Line */}
                  <polyline
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    points={monthlyData
                      .map((d, i) => {
                        const x = i * 29 + 18;
                        const y = 130 - (d.prior / 5.5) * 110;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    className="dark:stroke-slate-300"
                  />

                  {/* Prior year dots */}
                  {monthlyData.map((d, i) => {
                    const x = i * 29 + 18;
                    const y = 130 - (d.prior / 5.5) * 110;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="2.5"
                        fill="#1e293b"
                        className="dark:fill-slate-300"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Month labels */}
              <div className="flex justify-between pt-2 text-[10px] font-mono text-slate-400">
                {monthlyData.map((d, i) => (
                  <span key={i} className="text-center w-7">{d.month}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata bulanan: <strong>{formatVal(4.37)}</strong></span>
            <span className="text-emerald-600 font-bold">+18.2% Q4 Run-rate</span>
          </div>
        </div>

        {/* Card 2: Revenue by Business Unit (Donut Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue by Business Unit</h3>
                <p className="text-xs text-slate-400">Contribution by service line</p>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                100%
              </span>
            </div>

            {/* Donut SVG */}
            <div className="mt-4 flex items-center justify-center relative">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
                {/* Segments: total 100% */}
                {/* Seg 1: 42% (stroke-dasharray="42 58") */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#0d9488"
                  strokeWidth="15"
                  strokeDasharray="42 58"
                  strokeDashoffset="0"
                  className="hover:opacity-85 transition-opacity"
                />
                {/* Seg 2: 28% (stroke-dashoffset="-42") */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="15"
                  strokeDasharray="28 72"
                  strokeDashoffset="-42"
                  className="hover:opacity-85 transition-opacity"
                />
                {/* Seg 3: 18% (stroke-dashoffset="-70") */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="15"
                  strokeDasharray="18 82"
                  strokeDashoffset="-70"
                  className="hover:opacity-85 transition-opacity"
                />
                {/* Seg 4: 12% (stroke-dashoffset="-88") */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="15"
                  strokeDasharray="12 88"
                  strokeDashoffset="-88"
                  className="hover:opacity-85 transition-opacity"
                />
              </svg>
              {/* Donut Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {formatVal(baseRevenueUsd)}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold">100%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="mt-4 space-y-2">
              {businessUnits.map((bu, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: bu.color }} />
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{bu.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{formatVal(bu.val)}</span>
                    <span className="w-10 text-right text-slate-400 font-semibold">{bu.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Top 5 Products / Testing Services by Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top 5 Products by Revenue</h3>
                <p className="text-xs text-slate-400">Core laboratory testing methods</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Top 5 Services</span>
            </div>

            {/* Horizontal Bars */}
            <div className="mt-5 space-y-4">
              {topProducts.map((p, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {idx + 1}. {p.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                      {formatVal(p.val)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(p.val / topProducts[0].val) * 100}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 w-8 text-right font-medium">
                      {p.share}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Peralatan ICP-OES dan XRD berkontribusi <strong>52%</strong> dari seluruh omset pengujian.
          </div>
        </div>
      </div>

      {/* 4. Middle Row 2: Revenue by Region, Revenue by Customer Segment, Profitability Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Revenue by Region */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue by Region</h3>
                <p className="text-xs text-slate-400">Geographic distribution of sales</p>
              </div>
              <Globe className="h-4 w-4 text-slate-400" />
            </div>

            {/* Regional Map Graphics & Breakdown */}
            <div className="mt-5 space-y-3.5">
              {regions.map((reg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: reg.color }} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{reg.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                      {formatVal(reg.val)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${reg.share}%`,
                          backgroundColor: reg.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right font-medium">
                      {reg.share}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pertumbuhan Tertinggi:</span>
            <span className="font-bold text-emerald-600">Sulawesi &amp; Maluku (+31.2% YoY)</span>
          </div>
        </div>

        {/* Card 2: Revenue by Customer Segment (Table with bars) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue by Customer Segment</h3>
                <p className="text-xs text-slate-400">Performance across market tiers</p>
              </div>
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400">
                    <th className="pb-2.5">Segment</th>
                    <th className="pb-2.5 text-right">Revenue</th>
                    <th className="pb-2.5 text-center">Share</th>
                    <th className="pb-2.5 text-right">YoY Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {customerSegments.map((seg, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{seg.segment}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatVal(seg.val)}
                      </td>
                      <td className="py-2.5 text-center font-mono text-slate-500">{seg.share}%</td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        <span className={seg.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {seg.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-2.5 text-slate-900 dark:text-white">Total</td>
                    <td className="py-2.5 text-right font-mono text-slate-900 dark:text-white">
                      {formatVal(baseRevenueUsd)}
                    </td>
                    <td className="py-2.5 text-center font-mono">100%</td>
                    <td className="py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">+14.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Segmen <strong>Enterprise</strong> menguasai <strong>54.2%</strong> portofolio pendapatan.
          </div>
        </div>

        {/* Card 3: Profitability Trend (Dual axis chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Profitability Trend</h3>
                <p className="text-xs text-slate-400">Net profit and margin over time</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-600" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Net Profit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-500 font-medium">Net Margin %</span>
                </div>
              </div>
            </div>

            {/* Profitability Trend SVG */}
            <div className="mt-5">
              <div className="h-44 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 130" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[25, 60, 95].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="320" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  ))}

                  {/* Net Profit Shaded Area */}
                  <polygon
                    fill="url(#profitGrad)"
                    points={`
                      10,120
                      10,${120 - (0.65 * 100)}
                      55,${120 - (0.75 * 100)}
                      100,${120 - (0.82 * 100)}
                      145,${120 - (0.90 * 100)}
                      190,${120 - (0.95 * 100)}
                      235,${120 - (1.02 * 100)}
                      280,${120 - (1.08 * 100)}
                      310,${120 - (1.12 * 100)}
                      310,120
                    `}
                  />

                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Net Profit Solid Line */}
                  <polyline
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="10,55 55,45 100,38 145,30 190,25 235,18 280,12 310,8"
                  />

                  {/* Net Margin Dotted Line */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="10,65 55,62 100,60 145,58 190,56 235,54 280,52 310,50"
                  />

                  {/* Dots */}
                  <circle cx="310" cy="8" r="4" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="310" cy="50" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              {/* Bottom Labels */}
              <div className="flex justify-between pt-2 text-[10px] font-mono text-slate-400">
                <span>Q1 2023</span>
                <span>Q2 2023</span>
                <span>Q3 2023</span>
                <span>Q4 2023</span>
                <span>Q1 2024</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span>Net Margin Saat Ini:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">21.4% (Stabil &plusmn;0.8%)</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Key Insights (4 Cards matching image) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Key Insights</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Insight 1: Strong Revenue Growth */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Strong Revenue Growth</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Enterprise segment leading growth at <strong>+22.4% YoY</strong>. Consistent month-over-month performance with highest acceleration in Q4.
              </p>
            </div>
          </div>

          {/* Insight 2: Product Performance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Product Performance</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Top 2 testing services (ICP-OES &amp; XRD) contribute <strong>52%</strong> of total revenue. Recommended to expand multi-element throughput.
              </p>
            </div>
          </div>

          {/* Insight 3: Margin Pressures */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Margin Pressures</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Gross margin compressed <strong>120bps</strong> due to higher calibration standard gas &amp; argon supply costs. Vendor renegotiation advised.
              </p>
            </div>
          </div>

          {/* Insight 4: Regional Opportunity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Regional Opportunity</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Sulawesi and Kalimantan show highest growth potential (<strong>+31.2% YoY</strong>) driven by new mineral downstreaming regulation compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
