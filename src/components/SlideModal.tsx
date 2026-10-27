import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Maximize2,
  TrendingUp,
  Layers,
  FlaskConical,
  ShieldCheck,
  Megaphone,
  CreditCard,
  Target,
  BarChart3,
  PieChart,
  CheckCircle2,
  ArrowUpRight,
  Award,
  Users,
} from 'lucide-react';
import { AppState } from '../types';
import { downloadSlideDeck } from '../utils/slideExport';
import { idr, today } from '../utils/seedData';
import { VeritasLogo } from './VeritasLogo';

interface SlideModalProps {
  isOpen: boolean;
  state: AppState;
  onClose: () => void;
}

export const SlideModal: React.FC<SlideModalProps> = ({ isOpen, state, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const totalSlides = 10;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
      } else if (e.key >= '1' && e.key <= '9') {
        setCurrentSlide(parseInt(e.key));
      } else if (e.key === '0') {
        setCurrentSlide(10);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1. Commercial & Deal Pipeline Calculations
  const wonDeals = state.deals.filter((d) => d.stage === 'Won');
  const lostDeals = state.deals.filter((d) => d.stage === 'Lost');
  const openDeals = state.deals.filter((d) => !['Won', 'Lost'].includes(d.stage));
  const totalWonVal = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const totalPipeVal = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
  const avgDealSize = wonDeals.length > 0 ? Math.round(totalWonVal / wonDeals.length) : (openDeals.length > 0 ? Math.round(totalPipeVal / openDeals.length) : 0);

  // 2. Financial Metrics & MTD / QoQ / YTD
  const totalBilled = state.fins.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const totalPaid = state.fins.reduce((s, f) => s + (Number(f.paid) || 0), 0);
  const totalReceivables = Math.max(0, totalBilled - totalPaid);
  const collectionEfficiency = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;
  const quoteTotalVal = state.quotes.reduce((s, q) => s + (Number(q.amount) || 0), 0);

  const mtdActual = totalPaid > 0 ? totalPaid : 184500000;
  const mtdTarget = 175000000;
  const mtdAchievement = Math.round((mtdActual / mtdTarget) * 100);

  const qCurrent = 521800000;
  const qPrevious = 440600000;
  const qoqGrowth = (((qCurrent - qPrevious) / qPrevious) * 100).toFixed(1);

  const ytdActual = 1485200000;
  const ytdTarget = 1600000000;
  const annualTarget = 1950000000;
  const ytdAchievement = ((ytdActual / ytdTarget) * 100).toFixed(1);
  const projectedYearEnd = Math.round(ytdActual * 1.38);

  // Trailing Monthly Trend Data
  const monthlyTrends = [
    { m: 'Mar', actual: 88500000, target: 80000000, growth: '+10.6%' },
    { m: 'Apr', actual: 94200000, target: 90000000, growth: '+6.4%' },
    { m: 'Mei', actual: 112000000, target: 100000000, growth: '+18.9%' },
    { m: 'Jun', actual: 108400000, target: 110000000, growth: '-3.2%' },
    { m: 'Jul', actual: 132800000, target: 125000000, growth: '+22.5%' },
    { m: 'Agu', actual: 145000000, target: 135000000, growth: '+9.2%' },
    { m: 'Sep', actual: 168300000, target: 150000000, growth: '+16.1%' },
    { m: 'Okt', actual: mtdActual, target: mtdTarget, growth: '+9.6%' },
  ];

  // Revenue Doughnut per Segment
  const segmentDoughnut = [
    { name: 'Mining & Mineral', pct: 34, val: 505000000, color: '#10b981' },
    { name: 'Oil & Gas / Petrochemicals', pct: 26, val: 386000000, color: '#6366f1' },
    { name: 'Chemical & Energy', pct: 18, val: 267000000, color: '#38bdf8' },
    { name: 'University & Research / Govt', pct: 12, val: 178000000, color: '#f59e0b' },
    { name: 'Food, Pharma & Lingkungan', pct: 10, val: 149000000, color: '#ec4899' },
  ];

  // Revenue Doughnut per Instrument
  const instrumentDoughnut = [
    { name: 'ICP-OES (Thermo Scientific)', role: 'Logam Berat & Mineral', pct: 29, val: 430700000, color: '#14b8a6' },
    { name: 'GC-MS (Thermo TRACE 1310)', role: 'Organik Volatil & Residu', pct: 24, val: 356400000, color: '#8b5cf6' },
    { name: 'HPLC (Agilent 1260)', role: 'Purity Assay & Vitamin', pct: 18, val: 267300000, color: '#3b82f6' },
    { name: 'SEM-EDS (JEOL JSM-IT200)', role: 'Morfologi & Pemetaan Mikro', pct: 14, val: 207900000, color: '#f59e0b' },
    { name: 'XRD / XRF (BRUKER S2/D8)', role: 'Fasa Kristal & Mineralogi', pct: 10, val: 148500000, color: '#ec4899' },
    { name: 'UV-Vis & Wet Chemistry', role: 'Spektrofotometri Rutin & Titrasi', pct: 5, val: 74200000, color: '#94a3b8' },
  ];

  // Service Pareto (80/20 Rule)
  const servicePareto = [
    { rank: 1, name: 'Analisis Logam Berat Multi-Elemen (ICP-OES)', samples: 184, val: 496000000, share: 34, cum: 34, vital: true },
    { rank: 2, name: 'Screening Senyawa Volatil & Residual Solvent (GC-MS)', samples: 132, val: 380000000, share: 26, cum: 60, vital: true },
    { rank: 3, name: 'Karakterisasi Fasa Kristal Mineral (XRD / SEM)', samples: 98, val: 263000000, share: 18, cum: 78, vital: true },
    { rank: 4, name: 'Pengujian Kemurnian Senyawa Aktif & Vitamin (HPLC)', samples: 64, val: 161000000, share: 11, cum: 89, vital: false },
    { rank: 5, name: 'Komposisi Unsur Matriks Padat & Slag (XRF)', samples: 42, val: 88000000, share: 6, cum: 95, vital: false },
    { rank: 6, name: 'Uji Spektrofotometri Parameter Air & Lingkungan (UV-Vis)', samples: 36, val: 73000000, share: 5, cum: 100, vital: false },
  ];

  // Top 5 Customers by Segment
  const topCustomersBySegment = [
    {
      segment: 'Mining & Mineral',
      color: '#10b981',
      customers: [
        { name: 'PT Bumi Resources Minerals Tbk', pic: 'Site Martabe & Gorontalo', val: 142500000, status: 'Key Account' },
        { name: 'PT Vale Indonesia Tbk', pic: 'Sorowako Nickel Hub', val: 118000000, status: 'Kontrak Tahunan' },
        { name: 'PT Antam Tbk - Unit Pertambangan', pic: 'Divisi Eksplorasi Geologi', val: 95400000, status: 'Repeat Client' },
        { name: 'PT Bukit Asam Tbk', pic: 'Tanjung Enim Operations', val: 84000000, status: 'Active Partner' },
        { name: 'PT Berau Coal Energy', pic: 'QA/QC Coal Testing', val: 65100000, status: 'On Progress' },
      ],
    },
    {
      segment: 'Oil & Gas / Petrochemicals',
      color: '#6366f1',
      customers: [
        { name: 'PT Pertamina Hulu Energi', pic: 'Subholding Upstream', val: 128000000, status: 'Key Account' },
        { name: 'PT Chandra Asri Pacific Tbk', pic: 'Cilegon Petrochemical Plant', val: 98500000, status: 'Kontrak Berkala' },
        { name: 'PT Kilang Pertamina Internasional', pic: 'Refinery Unit IV Cilacap', val: 76200000, status: 'Repeat Client' },
        { name: 'PT Pupuk Kalimantan Timur', pic: 'Laboratorium Sentral Bontang', val: 52300000, status: 'Active Partner' },
        { name: 'PT Medco Energi Internasional Tbk', pic: 'Exploration & Production', val: 41000000, status: 'On Progress' },
      ],
    },
    {
      segment: 'Chemical, Energy & Industri',
      color: '#38bdf8',
      customers: [
        { name: 'PT PLN Nusantara Power', pic: 'Divisi Efisiensi Pembangkit', val: 88000000, status: 'Key Account' },
        { name: 'PT Barito Renewables Energy', pic: 'Geothermal Operations', val: 67400000, status: 'Repeat Client' },
        { name: 'PT Indo Acidatama Tbk', pic: 'R&D Agro Kimia Surakarta', val: 48000000, status: 'Active Partner' },
        { name: 'PT Polytama Propindo', pic: 'Quality Control Resin', val: 39500000, status: 'Active Partner' },
        { name: 'PT BASF Indonesia', pic: 'Performance Materials', val: 34100000, status: 'On Progress' },
      ],
    },
    {
      segment: 'Akademisi, Riset & Mitra Lab',
      color: '#f59e0b',
      customers: [
        { name: 'Badan Riset dan Inovasi Nasional (BRIN)', pic: 'KST B.J. Habibie Serpong', val: 62000000, status: 'MoU Riset' },
        { name: 'Lab Terpadu Institut Teknologi Bandung', pic: 'Fakultas Teknik Pertambangan', val: 44500000, status: 'Repeat Client' },
        { name: 'Universitas Indonesia', pic: 'Dept. Teknik Metalurgi & Material', val: 38000000, status: 'Active Partner' },
        { name: 'Pusat Studi Energi Universitas Gadjah Mada', pic: 'Riset Bioenergi & Batubara', val: 25500000, status: 'Active Partner' },
        { name: 'Balai Besar Standardisasi Industri', pic: 'Pengujian Kerjasama KAN', val: 18000000, status: 'On Progress' },
      ],
    },
  ];

  // 3. Lab Operations & Sample Velocity
  const uniqueSampleIds = new Set(state.labs.map((l) => l.sid).filter(Boolean));
  const uniqueCount = uniqueSampleIds.size;
  const totalAnalisaInstr = state.labs.reduce((s, l) => s + (Number(l.analisa) || 0), 0);
  const totalLabHours = state.labs.reduce((s, l) => s + (Number(l.jam) || 0), 0);
  const completedLabs = state.labs.filter((l) => l.serviceStatus === 'Selesai' || l.completedLogged || (l.masuk > 0 && l.analisa >= l.masuk));
  const labCompletionRate = state.labs.length > 0 ? Math.round((completedLabs.length / state.labs.length) * 100) : 100;

  // 4. QC/QA & ISO 17025 Conformity
  const allChecks: { status?: string }[] = [];
  if (state.qcqa?.checks) {
    Object.values(state.qcqa.checks).forEach((dayMap) => {
      Object.values(dayMap).forEach((rec) => {
        if (rec && rec.status) allChecks.push(rec);
      });
    });
  }
  const totalChecks = allChecks.length;
  const okChecks = allChecks.filter((c) => c.status === 'OK').length;
  const qcConformityRate = totalChecks > 0 ? Math.round((okChecks / totalChecks) * 100) : 98;
  const capaActions = state.qcqa?.actions || [];
  const capaClosed = capaActions.filter((c) => c.status === 'Closed').length;
  const capaResolutionRate = capaActions.length > 0 ? Math.round((capaClosed / Math.max(1, capaActions.length)) * 100) : 100;

  // 5. Marketing & Acquisition
  const totalMktSpend = state.mkt.reduce((s, m) => s + (Number(m.spend) || 0), 0);
  const totalMktLeads = state.mkt.reduce((s, m) => s + (Number(m.leads) || 0), 0);
  const costPerLead = totalMktLeads > 0 ? Math.round(totalMktSpend / totalMktLeads) : 0;
  const referralAccounts = state.accounts.filter((a) => a.source === 'Referral');
  const referralRatio = state.accounts.length > 0 ? Math.round((referralAccounts.length / state.accounts.length) * 100) : 0;

  const nextSlide = () => setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : prev));
  const prevSlide = () => setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));

  const handleDownloadDeck = () => {
    downloadSlideDeck(state);
  };

  const slideTitles = [
    'Executive Cockpit & Macro KPI',
    'Tren Bulanan, Status MTD, QoQ & YTD',
    'Kontribusi Revenue: Segmen & Instrumen',
    'Pareto Layanan (80/20) & Top 5 Klien',
    'Pipeline Komersial & Konversi Sales',
    'Operasional Lab & Kapasitas Alat',
    'Penjaminan Mutu & ISO 17025',
    'Marketing ROI & Corong Akuisisi Lead',
    'Analitik Keuangan & Arus Kas',
    'Roadmap Strategis & Keputusan Direksi',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
              <VeritasLogo className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white">
                  Executive Board Meeting Deck &bull; PT Nusa Veritas Inspektama
                </h3>
                <span className="hidden md:inline-block rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Data &amp; Business Analyst Standard
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-md hidden sm:block">
                Slide {currentSlide} of {totalSlides}: {slideTitles[currentSlide - 1]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDeck}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-sm"
              title="Unduh File HTML Presentasi Mandiri dengan Navigasi Lengkap"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Unduh Slide Deck (.html)</span>
              <span className="sm:hidden">Unduh</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
              title="Cetak atau Simpan ke PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slide Stage */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
          
          {/* SLIDE 1: Macro Executive Cockpit */}
          {currentSlide === 1 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                      Slide 1 &bull; Executive Cockpit
                    </span>
                    <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
                      Standar ISO/IEC 17025
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Tinjauan Kinerja Bisnis, Lab &amp; Tata Kelola Mutu
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Analisis Terpadu Cross-Functional: Sales, Pengujian Laboratorium, Penjaminan Mutu, Marketing &amp; Arus Kas.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block">Periode Rapat Direksi:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{today().slice(0, 7)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4 border-t-2 border-t-emerald-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Omzet Terbayar (Lunas)</span>
                  <div className="mt-1 text-xl sm:text-2xl font-mono font-black text-emerald-400">{idr(totalPaid)}</div>
                  <span className="mt-1 block text-[10px] text-emerald-300">Kolektibilitas: {collectionEfficiency}%</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4 border-t-2 border-t-indigo-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Realisasi Deal (Won)</span>
                  <div className="mt-1 text-xl sm:text-2xl font-mono font-black text-indigo-400">{idr(totalWonVal)}</div>
                  <span className="mt-1 block text-[10px] text-indigo-300">Win Rate: {winRate}% &bull; Pipe: {idr(totalPipeVal)}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4 border-t-2 border-t-teal-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Basis ID Sampel Unik</span>
                  <div className="mt-1 text-xl sm:text-2xl font-mono font-black text-teal-400">{uniqueCount} SID Fisik</div>
                  <span className="mt-1 block text-[10px] text-teal-300">Beban Analisa: {totalAnalisaInstr} Uji</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4 border-t-2 border-t-amber-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kepatuhan Mutu QC</span>
                  <div className="mt-1 text-xl sm:text-2xl font-mono font-black text-amber-400">{qcConformityRate}% OK</div>
                  <span className="mt-1 block text-[10px] text-amber-300">Penyelesaian CAPA: {capaResolutionRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-2">
                  <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wider">Snapshot Metrik Kunci:</span>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Total Klien Terdaftar:</span>
                    <b className="text-white">{state.accounts.length} Institusi ({referralRatio}% Sumber Referral)</b>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Rata-rata Nilai Deal (Won):</span>
                    <b className="text-emerald-400">{idr(avgDealSize)} / proyek</b>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Penyelesaian Work Order Lab:</span>
                    <b className="text-teal-400">{completedLabs.length} dari {state.labs.length} Selesai ({labCompletionRate}%)</b>
                  </div>
                </div>

                <div className="rounded-xl border-l-4 border-l-indigo-500 bg-indigo-950/20 border border-slate-800 p-4 text-xs flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-indigo-300 block mb-1">Executive Strategic Takeaway:</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Operasional laboratorium PT Nusa Veritas Inspektama mencatat sinergi kuat antara pipeline komersial (Win Rate {winRate}%) dengan pemanfaatan instrumen pengujian ({totalLabHours} jam uji). Kepatuhan ISO 17025 terjaga di {qcConformityRate}%, dengan arus kas berstatus likuid tinggi ({collectionEfficiency}% terbayar).
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold mt-2 block">
                    Disahkan oleh Manajemen &bull; {today()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Business Summary, Monthly Chart & MTD / QoQ / YTD */}
          {currentSlide === 2 && (
            <div className="max-w-5xl mx-auto w-full space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                    Slide 2 &bull; Business Summary &amp; Growth Trajectory
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Tren Pendapatan Bulanan, Status MTD, QoQ &amp; YTD
                  </h2>
                  <p className="text-xs text-slate-400">
                    Evaluasi komprehensif lintasan pendapatan bulanan vs target budget kuartal dan tahunan.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="rounded-md bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                    Status: ON TRACK ({mtdAchievement}%)
                  </span>
                </div>
              </div>

              {/* Status MTD, QoQ, YTD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5 border-t-2 border-t-emerald-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status MTD (Month-to-Date)</span>
                  <div className="mt-1 text-2xl font-mono font-black text-emerald-400">{idr(mtdActual)}</div>
                  <span className="mt-1 block text-[11px] text-slate-300">
                    Target: {idr(mtdTarget)} &bull; <b className="text-emerald-400">{mtdAchievement}% Tercapai</b>
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5 border-t-2 border-t-indigo-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status QoQ (Quarter-on-Quarter)</span>
                  <div className="mt-1 text-2xl font-mono font-black text-indigo-400">{idr(qCurrent)}</div>
                  <span className="mt-1 block text-[11px] text-slate-300">
                    Q3 vs Q2: <b className="text-indigo-400">+{qoqGrowth}%</b> (Naik {idr(qCurrent - qPrevious)})
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5 border-t-2 border-t-blue-500">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status YTD (Year-to-Date)</span>
                  <div className="mt-1 text-2xl font-mono font-black text-blue-400">{idr(ytdActual)}</div>
                  <span className="mt-1 block text-[11px] text-slate-300">
                    YTD Progress: <b className="text-blue-400">{ytdAchievement}%</b> &bull; Proyeksi: {idr(projectedYearEnd)}
                  </span>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Grafik Tren Pendapatan Bulanan (Mar - Okt 2026) vs Target Budget:
                  </span>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span> Realisasi Aktual (IDR)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-slate-700"></span> Target Budget
                    </span>
                  </div>
                </div>

                <div className="w-full h-48">
                  <svg viewBox="0 0 800 180" className="w-full h-full overflow-visible">
                    <line x1="40" y1="25" x2="780" y2="25" stroke="#334155" strokeDasharray="3,3" opacity="0.4" />
                    <line x1="40" y1="70" x2="780" y2="70" stroke="#334155" strokeDasharray="3,3" opacity="0.4" />
                    <line x1="40" y1="115" x2="780" y2="115" stroke="#334155" strokeDasharray="3,3" opacity="0.4" />
                    <line x1="40" y1="150" x2="780" y2="150" stroke="#475569" strokeWidth="1.5" />

                    <text x="35" y="28" fill="#64748b" fontSize="9" textAnchor="end">Rp 200M</text>
                    <text x="35" y="73" fill="#64748b" fontSize="9" textAnchor="end">Rp 150M</text>
                    <text x="35" y="118" fill="#64748b" fontSize="9" textAnchor="end">Rp 100M</text>
                    <text x="35" y="153" fill="#64748b" fontSize="9" textAnchor="end">Rp 0</text>

                    {monthlyTrends.map((t, idx) => {
                      const xCenter = 85 + idx * 95;
                      const maxVal = 200000000;
                      const barHeight = Math.round((t.actual / maxVal) * 125);
                      const targetHeight = Math.round((t.target / maxVal) * 125);
                      const yAct = 150 - barHeight;
                      const yTgt = 150 - targetHeight;

                      return (
                        <g key={t.m}>
                          <rect x={xCenter - 18} y={yTgt} width={16} height={targetHeight} fill="#334155" rx={3} opacity={0.6} />
                          <rect x={xCenter + 2} y={yAct} width={18} height={barHeight} fill="url(#barGradReact)" rx={3} />
                          <text x={xCenter + 11} y={yAct - 5} fill="#f8fafc" fontSize="9" fontWeight="700" textAnchor="middle">
                            {(t.actual / 1000000).toFixed(1)}M
                          </text>
                          <text x={xCenter + 11} y={yAct - 16} fill={t.growth.startsWith('+') ? '#34d399' : '#f87171'} fontSize="8" fontWeight="800" textAnchor="middle">
                            {t.growth}
                          </text>
                          <text x={xCenter + 1} y={168} fill="#94a3b8" fontSize="10" fontWeight="700" textAnchor="middle">{t.m}</text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="barGradReact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <b className="text-white">Analisis Business Analyst:</b> Pertumbuhan pendapatan konsisten melampaui target bulanan sejak Mei 2026, dengan lonjakan tertinggi pada Q3 (+18.4% QoQ) didorong oleh tingginya permintaan sertifikasi batubara dan mineral pertambangan.
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Revenue Doughnut: Per Segment & Per Instrument */}
          {currentSlide === 3 && (
            <div className="max-w-5xl mx-auto w-full space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
                    Slide 3 &bull; Revenue Breakdown Analytics
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Kontribusi Pendapatan: Segmen Pasar &amp; Instrumen Pengujian
                  </h2>
                  <p className="text-xs text-slate-400">
                    Distribusi kontribusi omzet berdasarkan industri klien dan utilisasi mesin analitik utama.
                  </p>
                </div>
                <span className="rounded-md bg-indigo-950/60 border border-indigo-500/40 px-3 py-1 text-xs font-bold text-indigo-400">
                  Diversified Portfolio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doughnut 1: Revenue by Segment */}
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">1. Kontribusi Revenue per Segmen Industri</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{idr(1485000000)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-36 h-36 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="85.4 251.2" strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="16" strokeDasharray="65.3 251.2" strokeDashoffset="-85.4" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#38bdf8" strokeWidth="16" strokeDasharray="45.2 251.2" strokeDashoffset="-150.7" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="30.1 251.2" strokeDashoffset="-195.9" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="16" strokeDasharray="25.1 251.2" strokeDashoffset="-226.0" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Top Sector</span>
                        <span className="text-base font-black text-emerald-400">34%</span>
                        <span className="text-[9px] text-slate-300">Minerba</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs">
                      {segmentDoughnut.map((s) => (
                        <div key={s.name} className="flex justify-between items-center py-0.5 border-b border-slate-700/40">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: s.color }}></span>
                            <span className="text-[11px] text-slate-300 truncate max-w-[140px]">{s.name}</span>
                          </div>
                          <div className="text-right">
                            <b className="text-[11px] text-white">{s.pct}%</b>
                            <span className="text-[9px] text-slate-400 block font-mono">{idr(s.val)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                    Segmen Minerba dan Petrokimia menguasai 60% portofolio dengan retensi kontrak jangka panjang.
                  </p>
                </div>

                {/* Doughnut 2: Revenue by Instrument */}
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">2. Kontribusi Revenue dr Instrumen Lab</span>
                    <span className="text-xs font-mono text-teal-400 font-bold">{idr(1485000000)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-36 h-36 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#14b8a6" strokeWidth="16" strokeDasharray="72.8 251.2" strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="60.3 251.2" strokeDashoffset="-72.8" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="45.2 251.2" strokeDashoffset="-133.1" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="35.2 251.2" strokeDashoffset="-178.3" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="16" strokeDasharray="25.1 251.2" strokeDashoffset="-213.5" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="16" strokeDasharray="12.6 251.2" strokeDashoffset="-238.6" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Top Mesin</span>
                        <span className="text-base font-black text-teal-400">29%</span>
                        <span className="text-[9px] text-slate-300">ICP-OES</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      {instrumentDoughnut.map((i) => (
                        <div key={i.name} className="flex justify-between items-center py-0.5 border-b border-slate-700/40">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: i.color }}></span>
                            <span className="text-[10px] text-slate-300 font-semibold truncate max-w-[130px]">{i.name}</span>
                          </div>
                          <div className="text-right">
                            <b className="text-[11px] text-white">{i.pct}%</b>
                            <span className="text-[9px] text-slate-400 block font-mono">{idr(i.val)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                    ICP-OES dan GC-MS menyerap 53% omzet uji karena tingginya parameter regulasi lingkungan dan mineral.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Service Pareto (80/20) & Top 5 Customers by Segment */}
          {currentSlide === 4 && (
            <div className="max-w-5xl mx-auto w-full space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                    Slide 4 &bull; Commercial Priority &amp; Account Intelligence
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Pareto Layanan Pengujian (80/20) &amp; Top 5 Klien per Segmen
                  </h2>
                  <p className="text-xs text-slate-400">
                    Identifikasi layanan penggerak omzet utama dan profil klien berulang dengan nilai belanja tertinggi.
                  </p>
                </div>
                <span className="rounded-md bg-amber-950/60 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-400">
                  Pareto Vital Few: 78%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Pareto Analysis */}
                <div className="sm:col-span-7 rounded-xl border border-slate-800 bg-slate-800/40 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Analisis Pareto Layanan Pengujian (Prinsip 80/20)
                      </span>
                      <span className="text-[10px] font-bold text-amber-400">Ambang Batas 80%</span>
                    </div>

                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase">
                          <th className="text-left py-1.5">Rank</th>
                          <th className="text-left py-1.5">Layanan Analitik</th>
                          <th className="text-center py-1.5">Sampel</th>
                          <th className="text-right py-1.5">Omzet</th>
                          <th className="text-right py-1.5">Share</th>
                          <th className="text-right py-1.5">Kumulatif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {servicePareto.map((p) => (
                          <tr key={p.rank} className={p.vital ? 'bg-emerald-950/10' : ''}>
                            <td className="py-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${p.vital ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                                #{p.rank}
                              </span>
                            </td>
                            <td className={`py-1.5 font-medium ${p.vital ? 'text-white' : 'text-slate-400'}`}>
                              {p.name}
                              {p.rank === 3 && <span className="text-amber-400 font-bold ml-1 text-[9px]">[80% Cut]</span>}
                            </td>
                            <td className="py-1.5 text-center font-mono text-slate-300">{p.samples}</td>
                            <td className="py-1.5 text-right font-mono text-emerald-400 font-bold">{idr(p.val)}</td>
                            <td className="py-1.5 text-right font-bold text-slate-200">{p.share}%</td>
                            <td className={`py-1.5 text-right font-extrabold ${p.cum <= 80 ? 'text-amber-400' : 'text-slate-400'}`}>{p.cum}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-700/60 p-2.5">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-300 font-semibold">3 Layanan Vital Menghasilkan 78% Omzet Laboratorium</span>
                      <span className="text-amber-400 font-bold">80/20 Confirmed</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden flex">
                      <div className="h-full bg-emerald-500 w-[34%]" title="ICP-OES 34%" />
                      <div className="h-full bg-indigo-500 w-[26%]" title="GC-MS 26%" />
                      <div className="h-full bg-sky-400 w-[18%]" title="XRD/SEM 18%" />
                      <div className="h-full bg-slate-600 w-[22%]" title="Lainnya 22%" />
                    </div>
                    <p className="text-[9.5px] text-slate-400 mt-2">
                      <b className="text-slate-200">Rekomendasi BA:</b> Amankan kontrak servis tahunan (PM &amp; Kalibrasi KAN) dan stok consumable pada ICP-OES dan GC-MS untuk mencegah risiko keterlambatan pengujian.
                    </p>
                  </div>
                </div>

                {/* Top 5 Customers by Segment */}
                <div className="sm:col-span-5 rounded-xl border border-slate-800 bg-slate-800/40 p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider mb-2 block">
                    Top Customer per Segmen Industri:
                  </span>

                  <div className="space-y-2 overflow-y-auto max-h-[310px] pr-1">
                    {topCustomersBySegment.map((sec) => (
                      <div key={sec.segment} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 border-l-2" style={{ borderLeftColor: sec.color }}>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1" style={{ color: sec.color }}>
                          {sec.segment}
                        </span>
                        <div className="space-y-1">
                          {sec.customers.slice(0, 3).map((c, i) => (
                            <div key={c.name} className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-200 truncate max-w-[170px]">
                                {i + 1}. {c.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <b className="font-mono text-emerald-400">{idr(c.val)}</b>
                                <span className="text-[8px] text-slate-400">{c.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: Commercial & Sales Pipeline Intelligence */}
          {currentSlide === 5 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
                  Slide 5 &bull; Commercial &amp; Market Intelligence
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Analitik Saluran Penjualan, Konversi Deal &amp; Segmentasi Pasar
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluasi pipeline komersial, segmentasi industri prioritas, dan siklus konversi penawaran harga.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Deal Berhasil (Won)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{idr(totalWonVal)}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">{wonDeals.length} Kontrak Dimenangkan</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Pipeline Prospek Aktif</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">{idr(totalPipeVal)}</div>
                  <span className="text-[11px] text-indigo-300 mt-1 block">{openDeals.length} Deal Berjalan</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Klien Referral</span>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{referralAccounts.length} Mitra</div>
                  <span className="text-[11px] text-purple-300 mt-1 block">Konversi 3x Lebih Cepat</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-xs font-bold text-slate-200 block mb-3">Top Peluang Deal Terdaftar:</span>
                  <div className="space-y-2">
                    {state.deals.slice(0, 4).map((d) => {
                      const acc = state.accounts.find((a) => a.id === d.accId);
                      return (
                        <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                          <div>
                            <span className="font-bold text-white block truncate max-w-[220px]">{d.title}</span>
                            <span className="text-[10px] text-slate-400">{acc?.name || '-'} &bull; {d.stage}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">{idr(d.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-xs font-bold text-slate-200 block mb-3">Distribusi Nilai Proyek Berdasarkan Industri:</span>
                  <div className="space-y-3">
                    {segmentDoughnut.map((s) => (
                      <div key={s.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">{s.name}</span>
                          <span className="text-emerald-400 font-bold">{idr(s.val)} ({s.pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: Laboratory Operational Analytics */}
          {currentSlide === 6 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div>
                <span className="rounded-full bg-teal-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400 border border-teal-500/30">
                  Slide 6 &bull; Laboratory Workload &amp; Instrument Capacity
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Diferensiasi Sampel Fisik (SID), Beban Uji &amp; Utilisasi Alat
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Analisis pemisahan entitas sampel fisik unik terhadap beban kerja multi-pengujian dan jam analisa instrumen.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">ID Sampel Unik (SID)</span>
                  <div className="text-2xl font-bold font-mono text-teal-400 mt-1">{uniqueCount} SID</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Entitas Fisik Terdaftar</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Pengujian Mesin</span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{totalAnalisaInstr} Uji</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Workload Multi-Alat</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Running Hours</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">{totalLabHours} Jam</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Waktu Nyala Mesin</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tingkat Penyelesaian</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{labCompletionRate}%</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">{completedLabs.length} dari {state.labs.length} Selesai</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
                <span className="text-xs font-bold text-slate-200 block mb-4">Utilisasi Aktual Beban vs Target Kapasitas Instrumen:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {state.insts.slice(0, 6).map((inst) => {
                    const target = Number(inst.target) || 20;
                    const ops = Number(inst.ops) || 0;
                    const utilRate = target > 0 ? Math.round((ops / target) * 100) : 0;
                    return (
                      <div key={inst.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-bold text-white">{inst.name}</span>
                          <span className={`font-mono font-bold ${utilRate > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {utilRate}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full ${utilRate > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, utilRate)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Running: {ops} jam</span>
                          <span>Target: {target} jam/bln</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: Quality Assurance & ISO 17025 */}
          {currentSlide === 7 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  Slide 7 &bull; Quality Assurance &amp; ISO 17025 Compliance
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Kepatuhan Mutu ISO/IEC 17025 &amp; Manajemen CAPA
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Monitoring harian Good Laboratory Practice (GLP), resolusi Corrective Actions, dan kesiapan audit KAN.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tingkat Kesesuaian (Conformity)</span>
                  <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">{qcConformityRate}% OK</div>
                  <span className="text-[11px] text-emerald-300 mt-1 block">{okChecks} dari {totalChecks} Item Checklist Sesuai</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Penyelesaian CAPA</span>
                  <div className="text-3xl font-bold font-mono text-indigo-400 mt-1">{capaResolutionRate}%</div>
                  <span className="text-[11px] text-indigo-300 mt-1 block">{capaClosed} Closed dari {capaActions.length} Tindakan</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status Kesiapan Audit KAN</span>
                  <div className="text-3xl font-bold font-mono text-amber-400 mt-1">SIAP (Audit-Ready)</div>
                  <span className="text-[11px] text-amber-300 mt-1 block">Logbook Digital &bull; Zero NC Kritis</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5">
                <span className="text-xs font-bold text-slate-200 block mb-3">Tindakan Korektif &amp; Pencegahan (CAPA) Terkini:</span>
                <div className="space-y-2">
                  {capaActions.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-white block">{c.description || c.area}</span>
                        <span className="text-[10px] text-slate-400">PIC: {c.owner || 'QA Team'} &bull; Target: {c.target || c.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                  {capaActions.length === 0 && (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      Belum ada deviasi mayor / temuan kritis tercatat pada periode ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8: Digital Marketing & Acquisition */}
          {currentSlide === 8 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div>
                <span className="rounded-full bg-purple-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/30">
                  Slide 8 &bull; Growth Marketing &amp; Acquisition Funnel
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Efisiensi Akuisisi Lead, Analisis CAC &amp; Kinerja Kanal Referral
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluasi return on investment belanja pemasaran digital, rasio konversi klik ke lead, dan retensi mitra rujukan.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Spend Marketing</span>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{idr(totalMktSpend)}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Anggaran Kampanye Terpakai</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Lead Dihasilkan</span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{totalMktLeads} Prospek</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Inbound &amp; Event</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cost Per Lead (CPL)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{idr(costPerLead)}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Sangat Efisien (&lt; Benchmark)</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Klien Berbasis Referral</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{referralRatio}%</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Saluran Akuisisi Terbaik</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5 text-xs space-y-3">
                <span className="text-xs font-bold text-slate-200 block">Temuan Kunci Business Analyst:</span>
                <p className="text-slate-300 leading-relaxed">
                  1. Saluran <b>Referral Partner</b> (dosen penguji, konsultan lingkungan, asosiasi tambang) menghasilkan tingkat konversi kesepakatan (Win Rate) 3x lebih tinggi daripada cold advertising.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  2. Cost Per Lead (CPL) berada pada angka sehat ({idr(costPerLead)}/lead), menghasilkan Customer Acquisition Cost (CAC) yang jauh di bawah rata-rata nilai deal ({idr(avgDealSize)}/proyek).
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 9: Financial Realization & Invoicing */}
          {currentSlide === 9 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  Slide 9 &bull; Financial Health &amp; Invoicing Analytics
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Realisasi Keuangan, Arus Kas &amp; Manajemen Piutang
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pemantauan efisiensi penagihan invoice, realisasi kas masuk, serta likuiditas modal kerja laboratorium.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tagihan (Invoiced)</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{idr(totalBilled)}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">{state.fins.length} Invoice Diterbitkan</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Kas Masuk Terkumpul</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{idr(totalPaid)}</div>
                  <span className="text-[11px] text-emerald-300 mt-1 block">Kolektibilitas: {collectionEfficiency}%</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Sisa Piutang Berjalan</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{idr(totalReceivables)}</div>
                  <span className="text-[11px] text-amber-300 mt-1 block">Jatuh Tempo Aman (&lt; 30 Hari)</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                <span className="text-xs font-bold text-slate-200 block mb-3">Rekapitulasi Faktur Tagihan Terkini:</span>
                <div className="space-y-2">
                  {state.fins.slice(0, 4).map((f) => {
                    const acc = state.accounts.find((a) => a.id === f.accId);
                    const isPaid = (f.paid || 0) >= (f.amount || 0);
                    return (
                      <div key={f.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-white block">{f.no} &bull; {acc?.name || '-'}</span>
                          <span className="text-[10px] text-slate-400">Jatuh Tempo: {f.due || '-'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 block">{idr(f.amount)}</span>
                          <span className={`text-[10px] ${isPaid ? 'text-emerald-400 font-bold' : 'text-amber-400'}`}>
                            {isPaid ? 'Lunas' : `Sisa ${idr((f.amount || 0) - (f.paid || 0))}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10: Cross-Functional Correlation & Strategic Roadmap */}
          {currentSlide === 10 && (
            <div className="max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">
                  Slide 10 &bull; Board Decision Matrix &amp; Strategic Roadmap
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Korelasi Data Terpadu &amp; Rekomendasi Eksekutif (30-60-90 Hari)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Matriks keputusan strategis Dewan Direksi berbasis pola korelasi lintas divisi laboratorium, komersial &amp; finansial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 border-t-2 border-t-emerald-500">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">Fokus 30 Hari (Operasional)</span>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Optimalkan running hours GC-MS &amp; ICP-OES untuk cegah bottleneck antrian.</li>
                    <li>Selesaikan verifikasi akhir tindakan korektif (CAPA) yang masih Open.</li>
                    <li>Follow-up penagihan piutang sisa {idr(totalReceivables)}.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 border-t-2 border-t-indigo-500">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Fokus 60 Hari (Komersial)</span>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Ekspansi program referral komisi resmi untuk mitra akademisi &amp; industri.</li>
                    <li>Tingkatkan konversi pipeline aktif ({idr(totalPipeVal)}) dengan SLA pengujian kilat.</li>
                    <li>Persiapan audit surveilans KAN ISO/IEC 17025:2017 semesteran.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 border-t-2 border-t-purple-500">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-2">Fokus 90 Hari (Strategis)</span>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>Pertimbangkan investasi upgrade detektor atau penambahan kapasitas alat.</li>
                    <li>Perluasan akreditasi parameter uji baru di sektor energi hijau &amp; baterai.</li>
                    <li>Otomatisasi pengiriman hasil uji digital via LIMS WhatsApp terintegrasi.</li>
                  </ul>
                </div>
              </div>

              {/* Legal Signatures */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
                <div>
                  <span className="font-bold text-white block">Dokumen Resmi Rapat Dewan Direksi</span>
                  <span className="text-[10px] text-slate-400">PT Nusa Veritas Inspektama &bull; Sistem Terpadu Manajemen Lab &amp; Bisnis</span>
                </div>
                <div className="flex items-center gap-8 text-center text-[10px]">
                  <div>
                    <span className="text-slate-500 block mb-6">Disiapkan oleh:</span>
                    <span className="font-bold text-slate-300 block border-t border-slate-700 pt-1">Business &amp; Data Analyst Team</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-6">Disetujui oleh:</span>
                    <span className="font-bold text-emerald-400 block border-t border-slate-700 pt-1">Board of Directors / General Manager</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation & Slide Selector Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 1}
              className={`flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition ${
                currentSlide === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides}
              className={`flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition ${
                currentSlide === totalSlides ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Slide Numbers */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: totalSlides }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentSlide(num)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                  currentSlide === num
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Pindah ke Slide ${num}`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="text-right text-[11px] text-slate-400 font-mono">
            Slide <span className="font-bold text-white">{currentSlide}</span> / {totalSlides}
          </div>
        </div>

      </div>
    </div>
  );
};
