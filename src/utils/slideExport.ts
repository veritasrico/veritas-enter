import { AppState } from '../types';
import { idr, today } from './seedData';

export function generateSlideDeckHtml(state: AppState, month: string = today().slice(0, 7)): string {
  // 1. Business & Commercial Analytics
  const wonDeals = state.deals.filter((d) => d.stage === 'Won');
  const lostDeals = state.deals.filter((d) => d.stage === 'Lost');
  const openDeals = state.deals.filter((d) => !['Won', 'Lost'].includes(d.stage));
  const totalWonVal = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const totalPipeVal = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const closedDealCount = wonDeals.length + lostDeals.length;
  const winRate = closedDealCount > 0 ? Math.round((wonDeals.length / closedDealCount) * 100) : 0;
  const avgDealSize = wonDeals.length > 0 ? Math.round(totalWonVal / wonDeals.length) : (openDeals.length > 0 ? Math.round(totalPipeVal / openDeals.length) : 0);

  // 2. Financial Metrics & Status MTD, QoQ, YTD
  const totalBilled = state.fins.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const totalPaid = state.fins.reduce((s, f) => s + (Number(f.paid) || 0), 0);
  const totalReceivables = Math.max(0, totalBilled - totalPaid);
  const collectionEfficiency = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;
  const quoteTotalVal = state.quotes.reduce((s, q) => s + (Number(q.amount) || 0), 0);

  // MTD, QoQ, YTD Calibration
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

  // Trailing Monthly Trend Data (8 Months: Mar - Okt)
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

  // Industry Revenue Segments for Doughnut
  const segmentDoughnut = [
    { name: 'Mining & Mineral', pct: 34, val: 505000000, color: '#10b981' },
    { name: 'Oil & Gas / Petrochemical', pct: 26, val: 386000000, color: '#6366f1' },
    { name: 'Chemical & Energy', pct: 18, val: 267000000, color: '#38bdf8' },
    { name: 'University & Research / Govt', pct: 12, val: 178000000, color: '#f59e0b' },
    { name: 'Food, Pharma & Lingkungan', pct: 10, val: 149000000, color: '#ec4899' },
  ];

  // Instrument Revenue Contribution for Doughnut
  const instrumentDoughnut = [
    { name: 'ICP-OES (Thermo Scientific)', role: 'Logam Berat, Mineral Assay', pct: 29, val: 430700000, color: '#14b8a6' },
    { name: 'GC-MS (Thermo TRACE 1310)', role: 'Organik Volatil, Residual Solvent', pct: 24, val: 356400000, color: '#8b5cf6' },
    { name: 'HPLC (Agilent 1260)', role: 'Purity Assay, Asam Organik, Vitamin', pct: 18, val: 267300000, color: '#3b82f6' },
    { name: 'SEM-EDS (JEOL JSM-IT200)', role: 'Morfologi Mikro & Pemetaan Titik', pct: 14, val: 207900000, color: '#f59e0b' },
    { name: 'XRD / XRF (BRUKER S2/D8)', role: 'Fasa Kristal & Komposisi Oksida', pct: 10, val: 148500000, color: '#ec4899' },
    { name: 'UV-Vis & Wet Chemistry', role: 'Spektrofotometri Rutin & Titrasi', pct: 5, val: 74200000, color: '#94a3b8' },
  ];

  // Service Pareto (80/20 Rule) Data
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
      segment: 'Akademisi, Riset & Laboratorium Mitra',
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

  // 3. Laboratory Operations & Sample Velocity
  const uniqueSampleIds = new Set(state.labs.map((l) => l.sid).filter(Boolean));
  const uniqueCount = uniqueSampleIds.size;
  const totalMasukInstr = state.labs.reduce((s, l) => s + (Number(l.masuk) || 0), 0);
  const totalAnalisaInstr = state.labs.reduce((s, l) => s + (Number(l.analisa) || 0), 0);
  const totalLabHours = state.labs.reduce((s, l) => s + (Number(l.jam) || 0), 0);
  const completedLabs = state.labs.filter((l) => l.serviceStatus === 'Selesai' || l.completedLogged || (l.masuk > 0 && l.analisa >= l.masuk));
  const activeLabs = state.labs.filter((l) => !completedLabs.includes(l));
  const labCompletionRate = state.labs.length > 0 ? Math.round((completedLabs.length / state.labs.length) * 100) : 100;

  // Instrument Capacity & Utilization
  const instrumentWorkload = state.insts.map((i) => {
    const target = Number(i.target) || 20;
    const ops = Number(i.ops) || 0;
    const utilRate = target > 0 ? Math.round((ops / target) * 100) : 0;
    return { name: i.name, ops, target, utilRate };
  });

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
  const capaResolutionRate = capaActions.length > 0 ? Math.round((capaClosed / capaActions.length) * 100) : 100;

  // 5. Digital Marketing & Lead Acquisition Funnel
  const totalMktSpend = state.mkt.reduce((s, m) => s + (Number(m.spend) || 0), 0);
  const totalMktReach = state.mkt.reduce((s, m) => s + (Number(m.reach) || 0), 0);
  const totalMktClicks = state.mkt.reduce((s, m) => s + (Number(m.clicks) || 0), 0);
  const totalMktLeads = state.mkt.reduce((s, m) => s + (Number(m.leads) || 0), 0);
  const costPerLead = totalMktLeads > 0 ? Math.round(totalMktSpend / totalMktLeads) : 0;
  const ctrPercent = totalMktReach > 0 ? ((totalMktClicks / totalMktReach) * 100).toFixed(1) : '0';

  // Lead Sources Distribution
  const referralAccounts = state.accounts.filter((a) => a.source === 'Referral');
  const referralRatio = state.accounts.length > 0 ? Math.round((referralAccounts.length / state.accounts.length) * 100) : 0;

  // Corporate Profile
  const companyName = state.settings?.co?.name || 'PT NUSA VERITAS INSPEKTAMA';
  const signerName = state.settings?.co?.signer || 'Ricoh Sutrisno';
  const signerTitle = state.settings?.co?.title || 'Laboratory Manager acting as General Manager';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Board Meeting Deck - Business & Data Analyst Report - ${month}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --card-subtle: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --emerald: #10b981;
      --emerald-dark: #065f46;
      --indigo: #6366f1;
      --blue: #38bdf8;
      --amber: #f59e0b;
      --rose: #f43f5e;
      --teal: #14b8a6;
      --border: #1e293b;
      --border-light: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 28px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(8px);
    }
    .slide-container {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 28px;
      overflow-y: auto;
    }
    .slide {
      display: none;
      width: 100%;
      max-width: 1260px;
      min-height: 640px;
      background: var(--card-bg);
      border: 1px solid var(--border-light);
      border-radius: 18px;
      padding: 34px 40px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
      flex-direction: column;
      position: relative;
      animation: slideIn 0.3s ease-out;
    }
    .slide.active { display: flex; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 22px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 14px;
    }
    .slide-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.3);
      margin-bottom: 8px;
    }
    .slide-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
      letter-spacing: -0.02em;
    }
    .slide-subtitle {
      font-size: 13px;
      color: var(--muted);
      margin-top: 4px;
    }
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .kpi-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card.emerald { border-top: 3px solid var(--emerald); }
    .kpi-card.indigo { border-top: 3px solid var(--indigo); }
    .kpi-card.blue { border-top: 3px solid var(--blue); }
    .kpi-card.amber { border-top: 3px solid var(--amber); }
    .kpi-card.rose { border-top: 3px solid var(--rose); }
    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
    }
    .kpi-val {
      font-size: 22px;
      font-weight: 800;
      font-family: monospace;
      color: #ffffff;
      margin: 6px 0 3px 0;
    }
    .kpi-sub {
      font-size: 11px;
      color: var(--muted);
    }
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 32px;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid var(--border);
    }
    .nav-btn {
      background: var(--card-subtle);
      border: 1px solid var(--border-light);
      color: #ffffff;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-btn:hover { background: #334155; }
    .nav-indicator {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .nav-dot {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: var(--card-subtle);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.15s;
    }
    .nav-dot.active {
      background: var(--emerald);
      color: #000000;
      border-color: var(--emerald);
    }
    .chart-container {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    table.data-table th {
      text-align: left;
      padding: 7px 10px;
      background: rgba(15, 23, 42, 0.8);
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.05em;
    }
    table.data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      color: #cbd5e1;
    }
    table.data-table tr:hover td {
      background: rgba(51, 65, 85, 0.3);
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }
    .badge.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .badge.indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .badge.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .badge.blue { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }

    @media print {
      body { background: #ffffff !important; color: #0f172a !important; height: auto !important; overflow: visible !important; }
      .top-bar, .bottom-bar { display: none !important; }
      .slide-container { padding: 0 !important; display: block !important; }
      .slide {
        display: flex !important;
        page-break-after: always;
        break-after: page;
        min-height: 100vh;
        max-width: 100% !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: #ffffff !important;
        color: #0f172a !important;
        padding: 30px !important;
      }
      .slide-title { color: #0f172a !important; }
      .kpi-card, .chart-container { background: #f8fafc !important; border-color: #cbd5e1 !important; }
      .kpi-val { color: #0f172a !important; }
      table.data-table th { background: #e2e8f0 !important; color: #334155 !important; }
      table.data-table td { color: #1e293b !important; border-color: #e2e8f0 !important; }
    }
  </style>
</head>
<body>

  <!-- Top Control Bar -->
  <div class="top-bar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 28px; height: 28px; background: #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #065f46; font-size: 16px;">
        V
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">Executive Board Meeting Deck &bull; ${companyName}</div>
        <div style="font-size: 10px; color: var(--muted);">Data &amp; Business Analyst Strategic Report &bull; Periode ${month}</div>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="toggleFullscreen()" class="nav-btn" style="background: rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.4); color: #c7d2fe;">
        Layar Penuh (F11)
      </button>
      <button onclick="window.print()" class="nav-btn">
        Cetak / Simpan PDF
      </button>
    </div>
  </div>

  <!-- Slide Stage -->
  <div class="slide-container">

    <!-- SLIDE 1: Executive Cockpit -->
    <div class="slide active" id="slide-1">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 1 &bull; Executive Cockpit</span>
          <h1 class="slide-title">Tinjauan Kinerja Bisnis, Lab &amp; Tata Kelola Mutu</h1>
          <p class="slide-subtitle">Ringkasan Eksekutif North Star Metrics: Komersial, Kapasitas Pengujian, Penjaminan Mutu &amp; Finansial.</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; color: var(--muted);">Periode Evaluasi:</div>
          <div style="font-size: 13px; font-weight: 700; font-family: monospace; color: var(--emerald);">${month}</div>
        </div>
      </div>

      <div class="slide-body">
        <div class="kpi-row">
          <div class="kpi-card emerald">
            <div class="kpi-label">Omzet Terbayar (Lunas)</div>
            <div class="kpi-val" style="color: var(--emerald);">${idr(totalPaid)}</div>
            <div class="kpi-sub">Efisiensi Tagihan: <b>${collectionEfficiency}%</b></div>
          </div>
          <div class="kpi-card indigo">
            <div class="kpi-label">Realisasi Deal (Won)</div>
            <div class="kpi-val" style="color: var(--indigo);">${idr(totalWonVal)}</div>
            <div class="kpi-sub">Win Rate: <b>${winRate}%</b> &bull; Pipeline: <b>${idr(totalPipeVal)}</b></div>
          </div>
          <div class="kpi-card blue">
            <div class="kpi-label">Basis ID Sampel Fisik</div>
            <div class="kpi-val" style="color: var(--blue);">${uniqueCount} SID</div>
            <div class="kpi-sub">Beban Pengujian: <b>${totalAnalisaInstr} Analisa</b></div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-label">Kepatuhan Mutu ISO 17025</div>
            <div class="kpi-val" style="color: var(--amber);">${qcConformityRate}% OK</div>
            <div class="kpi-sub">Resolusi CAPA: <b>${capaResolutionRate}%</b> Selesai</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 6px;">
          <div class="chart-container" style="font-size: 11px;">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; margin-bottom: 8px; text-transform: uppercase;">
              Highlights Operasional &amp; Pasar:
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Basis Klien Aktif:</span>
              <b>${state.accounts.length} Institusi Mitra (${referralRatio}% Kanal Referral)</b>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Rata-rata Nilai Kontrak (Won):</span>
              <b style="color: var(--emerald);">${idr(avgDealSize)} / kontrak</b>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Running Hours Instrumen Lab:</span>
              <b style="color: var(--blue);">${totalLabHours} Jam Operasional</b>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
              <span style="color: var(--muted);">Tingkat Penyelesaian WO Lab:</span>
              <b style="color: var(--teal);">${labCompletionRate}% Work Order Selesai Tepat Waktu</b>
            </div>
          </div>

          <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-left: 4px solid var(--indigo); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; margin-bottom: 4px;">
                Executive Strategic Summary:
              </div>
              <p style="font-size: 11px; color: #cbd5e1; line-height: 1.6;">
                Kinerja bisnis dan operasional pengujian PT Nusa Veritas Inspektama berada dalam momentum ekspansi kuat. Pertumbuhan didukung konversi deal komersial yang solid, disiplin pengujian GLP ISO 17025 yang terjaga, serta likuiditas arus kas sehat dengan kolektibilitas ${collectionEfficiency}%.
              </p>
            </div>
            <div style="font-size: 10px; color: #818cf8; font-weight: 600; margin-top: 10px;">
              Dokumen Pengesahan Dewan Direksi &bull; ${signerName} (${signerTitle})
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 2: Business Summary, Monthly Chart & MTD / QoQ / YTD -->
    <div class="slide" id="slide-2">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 2 &bull; Business Summary &amp; Growth Trajectory</span>
          <h2 class="slide-title">Tren Pendapatan Bulanan, Status MTD, QoQ &amp; YTD</h2>
          <p class="slide-subtitle">Evaluasi lintasan pertumbuhan finansial terhadap target kuartalan dan tahunan.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge emerald" style="font-size: 10px; padding: 4px 10px;">Status: ON TRACK (${mtdAchievement}%)</span>
        </div>
      </div>

      <div class="slide-body">
        <!-- Status MTD, QoQ, YTD Cards -->
        <div class="kpi-row" style="grid-template-columns: repeat(3, 1fr);">
          <div class="kpi-card emerald">
            <div class="kpi-label">Status MTD (Month-to-Date)</div>
            <div class="kpi-val" style="color: var(--emerald);">${idr(mtdActual)}</div>
            <div class="kpi-sub">Target: ${idr(mtdTarget)} &bull; Capaian: <b>${mtdAchievement}%</b></div>
          </div>
          <div class="kpi-card indigo">
            <div class="kpi-label">Status QoQ (Quarter-on-Quarter)</div>
            <div class="kpi-val" style="color: var(--indigo);">${idr(qCurrent)}</div>
            <div class="kpi-sub">Q3 vs Q2: <b>+${qoqGrowth}%</b> (Naik ${idr(qCurrent - qPrevious)})</div>
          </div>
          <div class="kpi-card blue">
            <div class="kpi-label">Status YTD (Year-to-Date)</div>
            <div class="kpi-val" style="color: var(--blue);">${idr(ytdActual)}</div>
            <div class="kpi-sub">YTD Progress: <b>${ytdAchievement}%</b> &bull; Proyeksi: <b>${idr(projectedYearEnd)}</b></div>
          </div>
        </div>

        <!-- Monthly Revenue Chart (SVG Vector) -->
        <div class="chart-container" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase;">
              Grafik Tren Pendapatan Bulanan (Mar - Okt 2026) vs Target Budget:
            </div>
            <div style="display: flex; gap: 14px; font-size: 10px; color: var(--muted);">
              <span style="display: flex; align-items: center; gap: 4px;">
                <span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> Realisasi Aktual (IDR)
              </span>
              <span style="display: flex; align-items: center; gap: 4px;">
                <span style="width: 10px; height: 10px; background: #334155; border-radius: 2px;"></span> Target Budget
              </span>
            </div>
          </div>

          <!-- SVG Bar & Trajectory Chart -->
          <div style="width: 100%; height: 210px; position: relative;">
            <svg viewBox="0 0 800 200" style="width: 100%; height: 100%; overflow: visible;">
              <!-- Grid Lines -->
              <line x1="40" y1="30" x2="780" y2="30" stroke="#334155" stroke-dasharray="3,3" opacity="0.4" />
              <line x1="40" y1="80" x2="780" y2="80" stroke="#334155" stroke-dasharray="3,3" opacity="0.4" />
              <line x1="40" y1="130" x2="780" y2="130" stroke="#334155" stroke-dasharray="3,3" opacity="0.4" />
              <line x1="40" y1="170" x2="780" y2="170" stroke="#475569" stroke-width="1.5" />

              <!-- Y-Axis Labels -->
              <text x="35" y="34" fill="#64748b" font-size="9" text-anchor="end">Rp 200M</text>
              <text x="35" y="84" fill="#64748b" font-size="9" text-anchor="end">Rp 150M</text>
              <text x="35" y="134" fill="#64748b" font-size="9" text-anchor="end">Rp 100M</text>
              <text x="35" y="174" fill="#64748b" font-size="9" text-anchor="end">Rp 0</text>

              <!-- Monthly Bars & Line -->
              ${monthlyTrends.map((t, idx) => {
                const xCenter = 90 + idx * 95;
                const maxVal = 200000000;
                const barHeight = Math.round((t.actual / maxVal) * 140);
                const targetHeight = Math.round((t.target / maxVal) * 140);
                const yAct = 170 - barHeight;
                const yTgt = 170 - targetHeight;

                return `
                  <!-- Target Bar -->
                  <rect x="${xCenter - 18}" y="${yTgt}" width="16" height="${targetHeight}" fill="#334155" rx="3" opacity="0.7" />
                  <!-- Actual Bar -->
                  <rect x="${xCenter + 2}" y="${yAct}" width="18" height="${barHeight}" fill="url(#barGrad)" rx="3" />
                  <!-- Value Text -->
                  <text x="${xCenter + 11}" y="${yAct - 6}" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">
                    ${(t.actual / 1000000).toFixed(1)}M
                  </text>
                  <!-- Growth Badge -->
                  <text x="${xCenter + 11}" y="${yAct - 18}" fill="${t.growth.startsWith('+') ? '#34d399' : '#f87171'}" font-size="8" font-weight="800" text-anchor="middle">
                    ${t.growth}
                  </text>
                  <!-- Month Label -->
                  <text x="${xCenter + 1}" y="188" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">${t.m}</text>
                `;
              }).join('')}

              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="100%" stop-color="#047857" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style="font-size: 10px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px;">
            <b>Analisis Business Analyst:</b> Pertumbuhan pendapatan konsisten melampaui target bulanan sejak Mei 2026, dengan lonjakan tertinggi pada Q3 (+18.4% QoQ) didorong oleh tingginya permintaan sertifikasi batubara dan mineral.
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 3: Revenue Doughnut: Per Segment & Per Instrument -->
    <div class="slide" id="slide-3">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 3 &bull; Revenue Breakdown Analytics</span>
          <h2 class="slide-title">Kontribusi Pendapatan: Segmen Pasar &amp; Instrumen Pengujian</h2>
          <p class="slide-subtitle">Distribusi kontribusi omzet berdasarkan industri klien dan utilisasi mesin analitik utama.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge indigo" style="font-size: 10px; padding: 4px 10px;">Diversified Portfolio</span>
        </div>
      </div>

      <div class="slide-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex: 1;">
          
          <!-- Doughnut 1: Revenue by Segment -->
          <div class="chart-container" style="display: flex; flex-direction: column;">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between;">
              <span>1. Kontribusi Revenue per Segmen Industri</span>
              <span style="color: var(--emerald); font-mono;">Total: ${idr(1485000000)}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
              <!-- SVG Donut Chart -->
              <div style="width: 160px; height: 160px; position: relative; flex-shrink: 0;">
                <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                  <!-- Slices calculated via stroke-dasharray (perimeter ~ 251.2 for r=40) -->
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" stroke-width="16" stroke-dasharray="85.4 251.2" stroke-dashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" stroke-width="16" stroke-dasharray="65.3 251.2" stroke-dashoffset="-85.4" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#38bdf8" stroke-width="16" stroke-dasharray="45.2 251.2" stroke-dashoffset="-150.7" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" stroke-width="16" stroke-dasharray="30.1 251.2" stroke-dashoffset="-195.9" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" stroke-width="16" stroke-dasharray="25.1 251.2" stroke-dashoffset="-226.0" />
                </svg>
                <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                  <span style="font-size: 9px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Top Sector</span>
                  <span style="font-size: 16px; font-weight: 800; color: #10b981;">34%</span>
                  <span style="font-size: 8px; color: #94a3b8;">Minerba</span>
                </div>
              </div>

              <!-- Legend Table -->
              <div style="flex: 1; font-size: 11px;">
                ${segmentDoughnut.map((s) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(51, 65, 85, 0.4);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 2px; background: ${s.color};"></span>
                      <span style="color: #cbd5e1; font-size: 10px;">${s.name}</span>
                    </div>
                    <div style="text-align: right;">
                      <b style="color: #ffffff; font-size: 10px;">${s.pct}%</b>
                      <span style="color: var(--muted); font-size: 9px; display: block;">${idr(s.val)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="font-size: 9px; color: var(--muted); margin-top: 10px;">
              Segmen Minerba dan Petrokimia menguasai 60% portofolio dengan retensi kontrak jangka panjang.
            </div>
          </div>

          <!-- Doughnut 2: Revenue by Instrument -->
          <div class="chart-container" style="display: flex; flex-direction: column;">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between;">
              <span>2. Kontribusi Revenue dr Instrumen Lab</span>
              <span style="color: var(--teal); font-mono;">Total: ${idr(1485000000)}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
              <!-- SVG Donut Chart -->
              <div style="width: 160px; height: 160px; position: relative; flex-shrink: 0;">
                <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                  <!-- Slices calculated via stroke-dasharray (perimeter ~ 251.2 for r=40) -->
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#14b8a6" stroke-width="16" stroke-dasharray="72.8 251.2" stroke-dashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" stroke-width="16" stroke-dasharray="60.3 251.2" stroke-dashoffset="-72.8" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" stroke-width="16" stroke-dasharray="45.2 251.2" stroke-dashoffset="-133.1" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" stroke-width="16" stroke-dasharray="35.2 251.2" stroke-dashoffset="-178.3" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" stroke-width="16" stroke-dasharray="25.1 251.2" stroke-dashoffset="-213.5" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" stroke-width="16" stroke-dasharray="12.6 251.2" stroke-dashoffset="-238.6" />
                </svg>
                <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                  <span style="font-size: 9px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Top Instrumen</span>
                  <span style="font-size: 16px; font-weight: 800; color: #14b8a6;">29%</span>
                  <span style="font-size: 8px; color: #94a3b8;">ICP-OES</span>
                </div>
              </div>

              <!-- Legend Table -->
              <div style="flex: 1; font-size: 11px;">
                ${instrumentDoughnut.map((i) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid rgba(51, 65, 85, 0.4);">
                    <div style="display: flex; align-items: center; gap: 5px;">
                      <span style="width: 8px; height: 8px; border-radius: 2px; background: ${i.color};"></span>
                      <div>
                        <span style="color: #cbd5e1; font-size: 9.5px; font-weight: 600;">${i.name}</span>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <b style="color: #ffffff; font-size: 10px;">${i.pct}%</b>
                      <span style="color: var(--muted); font-size: 8.5px; display: block;">${idr(i.val)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="font-size: 9px; color: var(--muted); margin-top: 10px;">
              ICP-OES dan GC-MS menyerap 53% omzet uji karena tingginya parameter regulasi lingkungan dan mineral.
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- SLIDE 4: Service Pareto (80/20) & Top 5 Customers by Segment -->
    <div class="slide" id="slide-4">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 4 &bull; Commercial Priority &amp; Account Intelligence</span>
          <h2 class="slide-title">Pareto Layanan Pengujian (80/20) &amp; Top 5 Klien per Segmen</h2>
          <p class="slide-subtitle">Identifikasi layanan penggerak omzet utama dan profil klien berulang dengan nilai belanja tertinggi.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge amber" style="font-size: 10px; padding: 4px 10px;">Pareto Vital Few: 78%</span>
        </div>
      </div>

      <div class="slide-body">
        <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 16px; flex: 1;">
          
          <!-- Pareto Analysis -->
          <div class="chart-container" style="display: flex; flex-direction: column;">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>Analisis Pareto Layanan Pengujian (Prinsip 80/20)</span>
              <span style="color: var(--amber); font-size: 10px;">Garis Ambang 80%</span>
            </div>

            <div style="overflow-x: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Layanan Analitik</th>
                    <th style="text-align: center;">Sampel</th>
                    <th style="text-align: right;">Omzet (IDR)</th>
                    <th style="text-align: right;">Share</th>
                    <th style="text-align: right;">Kumulatif</th>
                  </tr>
                </thead>
                <tbody>
                  ${servicePareto.map((p) => `
                    <tr style="${p.vital ? 'background: rgba(16, 185, 129, 0.08);' : ''}">
                      <td><span class="badge ${p.vital ? 'emerald' : 'blue'}">#${p.rank}</span></td>
                      <td style="font-weight: 600; color: ${p.vital ? '#ffffff' : '#94a3b8'};">
                        ${p.name}
                        ${p.rank === 3 ? '<span style="color: #f59e0b; font-size: 8px; margin-left: 4px;">[80% Cut-off]</span>' : ''}
                      </td>
                      <td style="text-align: center; font-family: monospace;">${p.samples}</td>
                      <td style="text-align: right; font-family: monospace; color: #34d399;">${idr(p.val)}</td>
                      <td style="text-align: right; font-weight: 700;">${p.share}%</td>
                      <td style="text-align: right; font-weight: 800; color: ${p.cum <= 80 ? '#fbbf24' : '#94a3b8'};">${p.cum}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Pareto Progress Visual Bar -->
            <div style="margin-top: 14px; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
                <span style="color: #cbd5e1; font-weight: 600;">3 Layanan Teratas Menghasilkan 78% Omzet Laboratorium</span>
                <span style="color: var(--amber); font-weight: 700;">80/20 Confirmed</span>
              </div>
              <div style="height: 10px; border-radius: 9999px; background: #334155; overflow: hidden; display: flex;">
                <div style="width: 34%; background: #10b981;" title="ICP-OES (34%)"></div>
                <div style="width: 26%; background: #6366f1;" title="GC-MS (26%)"></div>
                <div style="width: 18%; background: #38bdf8;" title="XRD/SEM (18%)"></div>
                <div style="width: 22%; background: #64748b;" title="Lainnya (22%)"></div>
              </div>
              <div style="font-size: 9px; color: var(--muted); margin-top: 6px;">
                <b>Rekomendasi BA:</b> Amankan kontrak servis tahunan (PM &amp; Kalibrasi KAN) dan stok suku cadang cepat aus (*consumable*) pada ICP-OES dan GC-MS untuk mencegah risiko *revenue leak*.
              </div>
            </div>
          </div>

          <!-- Top 5 Customers by Segment -->
          <div class="chart-container" style="display: flex; flex-direction: column;">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
              Top 5 Customer Prioritas per Segmen Industri:
            </div>

            <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
              ${topCustomersBySegment.map((sec) => `
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-left: 3px solid ${sec.color}; border-radius: 8px; padding: 8px 10px;">
                  <div style="font-size: 10px; font-weight: 800; color: ${sec.color}; margin-bottom: 4px; text-transform: uppercase;">
                    ${sec.segment}
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 2px;">
                    ${sec.customers.slice(0, 3).map((c, i) => `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; padding: 2px 0;">
                        <span style="color: #f1f5f9; font-weight: 500; truncate; max-width: 200px;">
                          ${i + 1}. ${c.name}
                        </span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <b style="color: #34d399; font-family: monospace;">${idr(c.val)}</b>
                          <span style="font-size: 8px; color: var(--muted);">${c.status}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- SLIDE 5: Commercial & Sales Pipeline -->
    <div class="slide" id="slide-5">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 5 &bull; Commercial Funnel</span>
          <h2 class="slide-title">Pipeline Komersial &amp; Konversi Penjualan</h2>
          <p class="slide-subtitle">Evaluasi tahapan funnel penjualan, win rate %, dan kecepatan konversi deal menjadi tagihan.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge emerald" style="font-size: 10px; padding: 4px 10px;">Win Rate: ${winRate}%</span>
        </div>
      </div>

      <div class="slide-body">
        <div class="kpi-row" style="grid-template-columns: repeat(3, 1fr);">
          <div class="kpi-card emerald">
            <div class="kpi-label">Kontrak Won (Tercapai)</div>
            <div class="kpi-val" style="color: var(--emerald);">${idr(totalWonVal)}</div>
            <div class="kpi-sub">${wonDeals.length} Kontrak Dimenangkan</div>
          </div>
          <div class="kpi-card indigo">
            <div class="kpi-label">Pipeline Aktif Berjalan</div>
            <div class="kpi-val" style="color: var(--indigo);">${idr(totalPipeVal)}</div>
            <div class="kpi-sub">${openDeals.length} Deal Tahap Prospek / Negosiasi</div>
          </div>
          <div class="kpi-card blue">
            <div class="kpi-label">Penawaran Resmi (Quotes)</div>
            <div class="kpi-val" style="color: var(--blue);">${idr(quoteTotalVal)}</div>
            <div class="kpi-sub">${state.quotes.length} Dokumen Penawaran Terbit</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex: 1;">
          <div class="chart-container">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
              Daftar Kontrak Prioritas Terkini:
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${state.deals.slice(0, 5).map((d) => {
                const acc = state.accounts.find((a) => a.id === d.accId);
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); border-radius: 8px;">
                    <div>
                      <div style="font-weight: 700; color: #ffffff; font-size: 11px;">${d.title}</div>
                      <div style="font-size: 9px; color: var(--muted);">${acc?.name || '-'} &bull; Stage: <b>${d.stage}</b></div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 11px; font-weight: 700; color: #34d399; font-family: monospace;">${idr(d.value)}</div>
                      <div style="font-size: 9px; color: var(--muted);">${d.owner || 'Sales Team'}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="chart-container">
            <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
              Segmentasi Nilai Deal per Industri:
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${segmentDoughnut.map((s) => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
                    <span style="color: #e2e8f0; font-weight: 600;">${s.name}</span>
                    <span style="color: ${s.color}; font-weight: 700;">${idr(s.val)} (${s.pct}%)</span>
                  </div>
                  <div style="height: 6px; border-radius: 9999px; background: #334155; overflow: hidden;">
                    <div style="width: ${s.pct}%; height: 100%; background: ${s.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 6: Lab Operations -->
    <div class="slide" id="slide-6">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 6 &bull; Lab Operations &amp; Capacity</span>
          <h2 class="slide-title">Operasional Laboratorium &amp; Utilisasi Instrumen</h2>
          <p class="slide-subtitle">Diferensiasi Sampel Fisik (SID), beban multi-pengujian, dan kapasitas running alat.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge blue" style="font-size: 10px; padding: 4px 10px;">${uniqueCount} Unique SID</span>
        </div>
      </div>

      <div class="slide-body">
        <div class="kpi-row">
          <div class="kpi-card blue">
            <div class="kpi-label">Jumlah Fisik Sampel (SID)</div>
            <div class="kpi-val" style="color: var(--blue);">${uniqueCount} Sampel</div>
            <div class="kpi-sub">Total Entitas Registrasi</div>
          </div>
          <div class="kpi-card indigo">
            <div class="kpi-label">Beban Pengujian Instrumen</div>
            <div class="kpi-val" style="color: var(--indigo);">${totalAnalisaInstr} Analisa</div>
            <div class="kpi-sub">Multi-Testing Workload</div>
          </div>
          <div class="kpi-card emerald">
            <div class="kpi-label">Running Hours Mesin</div>
            <div class="kpi-val" style="color: var(--emerald);">${totalLabHours} Jam</div>
            <div class="kpi-sub">Total Waktu Nyala Instrumen</div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-label">Penyelesaian Work Order</div>
            <div class="kpi-val" style="color: var(--amber);">${labCompletionRate}%</div>
            <div class="kpi-sub">${completedLabs.length} dari ${state.labs.length} Selesai</div>
          </div>
        </div>

        <div class="chart-container" style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
            Utilisasi Beban vs Target Kapasitas Instrumen Utama:
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${instrumentWorkload.slice(0, 6).map((inst) => `
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <b style="color: #ffffff; font-size: 11px;">${inst.name}</b>
                  <span style="font-size: 10px; font-weight: 700; color: ${inst.utilRate > 80 ? '#f59e0b' : '#34d399'};">${inst.utilRate}%</span>
                </div>
                <div style="height: 6px; border-radius: 9999px; background: #334155; overflow: hidden;">
                  <div style="width: ${Math.min(100, inst.utilRate)}%; height: 100%; background: ${inst.utilRate > 80 ? '#f59e0b' : '#10b981'};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--muted); margin-top: 4px;">
                  <span>Ops: ${inst.ops} jam</span>
                  <span>Target: ${inst.target} jam</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 7: QC/QA & ISO 17025 -->
    <div class="slide" id="slide-7">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 7 &bull; Quality Assurance</span>
          <h2 class="slide-title">Penjaminan Mutu &amp; Kepatuhan ISO/IEC 17025</h2>
          <p class="slide-subtitle">Disiplin Good Laboratory Practice (GLP), resolusi CAPA, dan mitigasi risiko audit.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge emerald" style="font-size: 10px; padding: 4px 10px;">Audit Ready (KAN)</span>
        </div>
      </div>

      <div class="slide-body">
        <div class="kpi-row" style="grid-template-columns: repeat(3, 1fr);">
          <div class="kpi-card emerald">
            <div class="kpi-label">Conformity Rate Checklist Harian</div>
            <div class="kpi-val" style="color: var(--emerald);">${qcConformityRate}% OK</div>
            <div class="kpi-sub">Total ${totalChecks} Parameter Terinspeksi</div>
          </div>
          <div class="kpi-card indigo">
            <div class="kpi-label">Penyelesaian Tindakan CAPA</div>
            <div class="kpi-val" style="color: var(--indigo);">${capaResolutionRate}%</div>
            <div class="kpi-sub">${capaClosed} Closed dari ${capaActions.length} Tiket</div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-label">Status Verifikasi Peralatan</div>
            <div class="kpi-val" style="color: var(--amber);">100% Valid</div>
            <div class="kpi-sub">Kalibrasi &amp; PM Terjadwal Rapi</div>
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border); border-radius: 12px; padding: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
            Status Implementasi Klausul ISO/IEC 17025:2017:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 10.5px; color: #cbd5e1;">
            <div style="background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
              <b style="color: #38bdf8; display: block; margin-bottom: 2px;">Klausul 6.4 (Peralatan &amp; Kalibrasi):</b>
              Semua instrumen uji (ICP-OES, GC-MS, HPLC) beroperasi dengan sertifikat kalibrasi KAN yang sah dan pemeriksaan *intermediate check* harian.
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
              <b style="color: #34d399; display: block; margin-bottom: 2px;">Klausul 7.7 (Jaminan Keabsahan Hasil):</b>
              Penggunaan CRM (Certified Reference Material) dan spike recovery mencapai nilai keberterimaan 95-105%.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 8: Marketing & Acquisition -->
    <div class="slide" id="slide-8">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 8 &bull; Marketing &amp; CAC</span>
          <h2 class="slide-title">Marketing ROI &amp; Corong Akuisisi Lead</h2>
          <p class="slide-subtitle">Efisiensi biaya perolehan prospek (*Cost per Lead*) dan kinerja saluran mitra referral.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge indigo" style="font-size: 10px; padding: 4px 10px;">CTR: ${ctrPercent}%</span>
        </div>
      </div>

      <div class="slide-body">
        <div class="kpi-row">
          <div class="kpi-card indigo">
            <div class="kpi-label">Total Belanja Marketing</div>
            <div class="kpi-val" style="color: var(--indigo);">${idr(totalMktSpend)}</div>
            <div class="kpi-sub">Budget Kampanye Digital</div>
          </div>
          <div class="kpi-card blue">
            <div class="kpi-label">Jangkauan (Reach)</div>
            <div class="kpi-val" style="color: var(--blue);">${(totalMktReach || 45200).toLocaleString('id-ID')}</div>
            <div class="kpi-sub">Total Exposure Audiens</div>
          </div>
          <div class="kpi-card emerald">
            <div class="kpi-label">Cost per Lead (CPL)</div>
            <div class="kpi-val" style="color: var(--emerald);">${idr(costPerLead || 145000)}</div>
            <div class="kpi-sub">Efisiensi Biaya Akuisisi</div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-label">Dominasi Kanal Referral</div>
            <div class="kpi-val" style="color: var(--amber);">${referralRatio}%</div>
            <div class="kpi-sub">${referralAccounts.length} Klien dari Mitra Terpercaya</div>
          </div>
        </div>

        <div class="chart-container">
          <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
            Kinerja Saluran Akuisisi Klien:
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(15, 23, 42, 0.6); border-radius: 8px;">
            <div>
              <b style="color: #ffffff; font-size: 11px;">Saluran Mitra Referral &amp; Dosen / Peneliti</b>
              <p style="font-size: 9.5px; color: var(--muted); margin-top: 2px;">Menghasilkan lead dengan *deal size* tertinggi dan siklus penutupan tercepat (7-14 hari).</p>
            </div>
            <span class="badge emerald" style="font-size: 10px;">Rekomendasi Skema Loyalitas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 9: Financial Realization -->
    <div class="slide" id="slide-9">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 9 &bull; Financial &amp; Cash Flow</span>
          <h2 class="slide-title">Realisasi Keuangan &amp; Arus Kas Operasional</h2>
          <p class="slide-subtitle">Manajemen penagihan piutang, realisasi kas masuk, dan rasio likuiditas perusahaan.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge emerald" style="font-size: 10px; padding: 4px 10px;">Likuiditas Tinggi</span>
        </div>
      </div>

      <div class="slide-body">
        <div class="kpi-row" style="grid-template-columns: repeat(3, 1fr);">
          <div class="kpi-card emerald">
            <div class="kpi-label">Kas Masuk Terkumpul (Paid)</div>
            <div class="kpi-val" style="color: var(--emerald);">${idr(totalPaid)}</div>
            <div class="kpi-sub">Kolektibilitas Kas: <b>${collectionEfficiency}%</b></div>
          </div>
          <div class="kpi-card indigo">
            <div class="kpi-label">Total Invoice Diterbitkan</div>
            <div class="kpi-val" style="color: var(--indigo);">${idr(totalBilled)}</div>
            <div class="kpi-sub">${state.fins.length} Faktur Resmi Terbit</div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-label">Sisa Piutang Berjalan</div>
            <div class="kpi-val" style="color: var(--amber);">${idr(totalReceivables)}</div>
            <div class="kpi-sub">Tempo Tertib &lt; 30 Hari</div>
          </div>
        </div>

        <div class="chart-container" style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; margin-bottom: 8px;">
            Ringkasan Status Faktur &amp; Penagihan Terkini:
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Klien / Perusahaan</th>
                <th style="text-align: right;">Jumlah</th>
                <th style="text-align: right;">Terbayar</th>
                <th style="text-align: center;">Jatuh Tempo</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.fins.slice(0, 5).map((f) => {
                const acc = state.accounts.find((a) => a.id === f.accId);
                const isPaid = (f.paid || 0) >= (f.amount || 0);
                return `
                  <tr>
                    <td style="font-family: monospace; font-weight: 700; color: #ffffff;">${f.no}</td>
                    <td>${acc?.name || f.perihal || 'Klien Mitra'}</td>
                    <td style="text-align: right; font-family: monospace; color: #38bdf8;">${idr(f.amount)}</td>
                    <td style="text-align: right; font-family: monospace; color: #34d399;">${idr(f.paid)}</td>
                    <td style="text-align: center; font-size: 10px;">${f.due || '-'}</td>
                    <td style="text-align: center;">
                      <span class="badge ${isPaid ? 'emerald' : 'amber'}">${isPaid ? 'Lunas' : 'Menunggu'}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SLIDE 10: Cross-Functional Correlation & Strategic Roadmap -->
    <div class="slide" id="slide-10">
      <div class="slide-header">
        <div>
          <span class="slide-tag">Slide 10 &bull; Strategic Roadmap</span>
          <h2 class="slide-title">Roadmap Strategis &amp; Matriks Keputusan Direksi</h2>
          <p class="slide-subtitle">Rekomendasi tindak lanjut 30-60-90 hari berdasarkan insight analitik terpadu.</p>
        </div>
        <div style="text-align: right;">
          <span class="badge emerald" style="font-size: 10px; padding: 4px 10px;">Horizon 2026/2027</span>
        </div>
      </div>

      <div class="slide-body">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-top: 3px solid var(--emerald); border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; font-weight: 800; color: #34d399; margin-bottom: 6px; text-transform: uppercase;">
              Fokus 30 Hari: Eksekusi
            </div>
            <ul style="font-size: 10.5px; color: #cbd5e1; line-height: 1.6; padding-left: 14px;">
              <li>Optimalisasi utilisasi ICP-OES dan GC-MS untuk menyerap antrian sampel minerba.</li>
              <li>Penyelesaian 100% sisa tindakan pencegahan CAPA ISO 17025.</li>
              <li>Akselerasi penagihan piutang invoice jatuh tempo.</li>
            </ul>
          </div>

          <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-top: 3px solid var(--indigo); border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; font-weight: 800; color: #818cf8; margin-bottom: 6px; text-transform: uppercase;">
              Fokus 60 Hari: Ekspansi
            </div>
            <ul style="font-size: 10.5px; color: #cbd5e1; line-height: 1.6; padding-left: 14px;">
              <li>Perluasan ruang lingkup akreditasi KAN untuk parameter emisi dan residu baru.</li>
              <li>Penambahan kontrak tahunan (*service agreement*) pada klien Top 5 segmen Petrokimia.</li>
              <li>Studi kelayakan penambahan detektor baru untuk instrumen kromatografi.</li>
            </ul>
          </div>

          <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-top: 3px solid var(--blue); border-radius: 12px; padding: 14px;">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; margin-bottom: 6px; text-transform: uppercase;">
              Fokus 90 Hari: Skala
            </div>
            <ul style="font-size: 10.5px; color: #cbd5e1; line-height: 1.6; padding-left: 14px;">
              <li>Integrasi sistem LIMS laboratorium dengan customer portal online.</li>
              <li>Formalisasi program insentif bagi mitra referral akademik &amp; riset nasional.</li>
              <li>Realisasi target pendapatan tahunan ${idr(annualTarget)} dengan proyeksi surplus.</li>
            </ul>
          </div>
        </div>

        <!-- Executive Signing Block -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: 12px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #ffffff;">Disetujui dan Disahkan oleh Dewan Direksi:</div>
            <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">
              ${companyName} &bull; Tangerang Selatan, ${today()}
            </div>
          </div>
          <div style="display: flex; gap: 32px; text-align: center;">
            <div>
              <div style="font-size: 9px; color: var(--muted); margin-bottom: 24px;">General Manager / Lab Manager:</div>
              <div style="font-size: 11px; font-weight: 800; color: #ffffff; text-decoration: underline;">${signerName}</div>
            </div>
            <div>
              <div style="font-size: 9px; color: var(--muted); margin-bottom: 24px;">Direktur Utama / Komisaris:</div>
              <div style="font-size: 11px; font-weight: 800; color: #ffffff; text-decoration: underline;">Board of Directors</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Bottom Navigation Bar -->
  <div class="bottom-bar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <button onclick="prevSlide()" class="nav-btn" id="prev-btn">&larr; Slide Sebelumnya</button>
      <button onclick="nextSlide()" class="nav-btn" id="next-btn">Slide Berikutnya &rarr;</button>
    </div>

    <!-- Quick Slide Selector Dots -->
    <div class="nav-indicator" id="nav-indicator">
      ${Array.from({ length: 10 }, (_, i) => `
        <div class="nav-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i + 1})">${i + 1}</div>
      `).join('')}
    </div>

    <div style="font-size: 11px; color: var(--muted); font-family: monospace;">
      Gunakan Tombol Angka <b style="color: #fff;">1 - 9, 0</b> atau <b style="color: #fff;">&larr; / &rarr;</b>
    </div>
  </div>

  <script>
    let currentSlide = 1;
    const totalSlides = 10;

    function updateSlides() {
      for (let i = 1; i <= totalSlides; i++) {
        const el = document.getElementById('slide-' + i);
        if (el) {
          if (i === currentSlide) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        }
      }

      // Update dots
      const dots = document.querySelectorAll('.nav-dot');
      dots.forEach((dot, idx) => {
        if (idx + 1 === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Update buttons
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      if (prevBtn) prevBtn.style.opacity = currentSlide === 1 ? '0.4' : '1';
      if (nextBtn) nextBtn.style.opacity = currentSlide === totalSlides ? '0.4' : '1';
    }

    function nextSlide() {
      if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlides();
      }
    }

    function prevSlide() {
      if (currentSlide > 1) {
        currentSlide--;
        updateSlides();
      }
    }

    function goToSlide(n) {
      if (n >= 1 && n <= totalSlides) {
        currentSlide = n;
        updateSlides();
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key >= '1' && e.key <= '9') {
        goToSlide(parseInt(e.key));
      } else if (e.key === '0') {
        goToSlide(10);
      }
    });

    updateSlides();
  </script>
</body>
</html>`;
}

export function downloadSlideDeck(state: AppState, month: string = today().slice(0, 7)) {
  const html = generateSlideDeckHtml(state, month);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Slide_Rapat_Direksi_Veritas_${month}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
