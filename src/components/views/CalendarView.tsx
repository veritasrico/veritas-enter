import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Briefcase,
  Megaphone,
  FlaskConical,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  FileText,
  User,
  Building,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';
import {
  Activity,
  AppState,
  InstrumentEvent,
  LabWorkOrder,
  MarketingCampaign,
  Account,
  ServiceCatalog,
} from '../../types';
import { pad, today, uid, idr, ACTIVITIES } from '../../utils/seedData';

interface CalendarViewProps {
  state: AppState;
  onSaveActivity: (act: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onSaveMkt: (m: MarketingCampaign) => void;
  onDeleteMkt: (id: string) => void;
  onSaveLab: (l: LabWorkOrder) => void;
  onDeleteLab: (id: string) => void;
  onSaveInstrumentEvent: (ev: InstrumentEvent) => void;
  onDeleteInstrumentEvent: (id: string) => void;
  onSaveAccount?: (acc: Account) => void;
  onSaveCat?: (cat: ServiceCatalog) => void;
}

type FormCategory = 'sales' | 'marketing' | 'lab' | 'agenda' | 'closed_service';

export const CalendarView: React.FC<CalendarViewProps> = ({
  state,
  onSaveActivity,
  onDeleteActivity,
  onSaveMkt,
  onDeleteMkt,
  onSaveLab,
  onDeleteLab,
  onSaveInstrumentEvent,
  onDeleteInstrumentEvent,
  onSaveAccount,
  onSaveCat,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const curDate = today();
  const [selectedDate, setSelectedDate] = useState<string>(curDate);
  const [viewMode, setViewMode] = useState<'auto' | 'matrix' | 'month'>('auto');

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const formatFullDateIndo = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dayName = indonesianDays[dt.getDay()] || '';
      const monthName = months[m - 1] || '';
      return `${dayName}, ${d} ${monthName} ${y}`;
    } catch {
      return dateStr;
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FormCategory>('sales');
  const [targetDate, setTargetDate] = useState<string>(curDate);

  // Form State: Sales
  const [salesForm, setSalesForm] = useState({
    accId: '',
    newAccName: '',
    type: 'Meeting' as Activity['type'],
    status: 'Terjadwal' as Activity['status'],
    note: '',
  });

  // Form State: Marketing
  const [mktForm, setMktForm] = useState({
    name: '',
    channel: 'LinkedIn',
    type: 'Iklan berbayar',
    spend: 0,
    reach: 0,
    clicks: 0,
    leads: 0,
    status: 'Dalam proses',
    note: '',
  });

  // Form State: Laboratorium
  const [labSubTab, setLabSubTab] = useState<'sample' | 'instrument'>('sample');
  const [labSampleForm, setLabSampleForm] = useState({
    sid: '',
    accId: '',
    newAccName: '',
    service: 'XRD',
    masuk: 5,
    analisa: 0,
    analyst: '',
    note: '',
  });

  const [labInstrForm, setLabInstrForm] = useState({
    name: 'XRD',
    type: 'Kalibrasi' as InstrumentEvent['type'],
    cat: 'Kalibrasi',
    hours: 0,
    next: '',
    note: '',
  });

  // Form State: Layanan Sedang Ditutup
  const [closedServiceForm, setClosedServiceForm] = useState({
    service: state.cat[0]?.d || 'Jasa analisa: Difraksi Sinar-X (XRD)',
    accId: '',
    status: 'Ditutup Sementara' as 'Ditutup Sementara' | 'Maintenance' | 'Layanan Ditutup',
    reason: '',
    startDate: curDate,
    endDate: '',
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Helper to retrieve all closed / suspended services on any given date
  const getClosedServicesOnDate = (dateStr: string) => {
    const list: Array<{
      id: string;
      serviceName: string;
      status: string;
      source: 'Katalog Layanan' | 'Work Order Lab' | 'Deal Customer';
      customer?: string;
      note?: string;
      period?: string;
    }> = [];

    // 1. Check Service Catalog
    (state.cat || []).forEach((c) => {
      if (c.status === 'Ditutup Sementara' || c.status === 'Maintenance') {
        const from = c.closedFrom || '';
        const until = c.closedUntil || '';
        let match = false;
        if (from && until) {
          match = dateStr >= from && dateStr <= until;
        } else if (from) {
          match = dateStr >= from;
        } else if (until) {
          match = dateStr <= until;
        } else {
          match = true;
        }

        if (match) {
          list.push({
            id: `cat-${c.id}`,
            serviceName: c.d,
            status: c.status,
            source: 'Katalog Layanan',
            note: c.closedReason || 'Layanan sedang ditutup sementara.',
            period: from && until ? `${from} s/d ${until}` : from ? `Mulai ${from}` : 'Sedang Ditutup',
          });
        }
      }
    });

    // 2. Check Lab Work Orders
    (state.labs || []).forEach((l) => {
      if (l.serviceStatus === 'Layanan Ditutup' || l.serviceStatus === 'Ditunda') {
        const from = l.closedFrom || l.date;
        const until = l.closedUntil || l.date;
        const match = dateStr >= from && dateStr <= until;
        if (match) {
          const acc = state.accounts.find((a) => a.id === l.accId);
          list.push({
            id: `lab-${l.id}`,
            serviceName: l.service,
            status: l.serviceStatus,
            source: 'Work Order Lab',
            customer: acc ? `${acc.name} (${acc.pic || 'PIC'})` : l.cust,
            note: l.serviceClosedNote || l.note || 'Permintaan pengujian ditutup/ditunda.',
            period: `${from} s/d ${until}`,
          });
        }
      }
    });

    // 3. Check Deals
    (state.deals || []).forEach((d) => {
      if (d.serviceStatus === 'Layanan Ditutup' || d.serviceStatus === 'Ditunda') {
        const from = d.closedFrom || d.close;
        const until = d.closedUntil || d.close;
        const match = dateStr >= from && dateStr <= until;
        if (match) {
          const acc = state.accounts.find((a) => a.id === d.accId);
          list.push({
            id: `deal-${d.id}`,
            serviceName: d.title,
            status: d.serviceStatus,
            source: 'Deal Customer',
            customer: acc ? acc.name : undefined,
            note: d.serviceClosedNote || 'Deal dengan permintaan layanan yang sedang ditutup.',
            period: `${from} s/d ${until}`,
          });
        }
      }
    });

    return list;
  };

  // Helper to get items on a date
  const getDayStatus = (dateStr: string) => {
    const hasSales = state.acts.some((a) => a.date === dateStr);
    const hasMkt = state.mkt.some((m) => m.date === dateStr);
    const hasLab = state.labs.some((l) => l.date === dateStr);
    const hasDowntime = state.instr.some((i) => i.date === dateStr && i.type === 'Downtime');
    const hasCalibration = state.instr.some((i) => i.date === dateStr && i.type === 'Kalibrasi');
    const closedList = getClosedServicesOnDate(dateStr);
    const hasClosedService = closedList.length > 0;
    const isPast = dateStr < curDate;

    return {
      hasSales,
      hasMkt,
      hasLab,
      hasDowntime: hasDowntime || hasCalibration,
      hasClosedService,
      isToday: dateStr === curDate,
      isPast,
      hasAny: hasSales || hasMkt || hasLab || hasDowntime || hasCalibration || hasClosedService,
    };
  };

  const openFormModal = (category: FormCategory, date: string = curDate) => {
    setTargetDate(date);
    setActiveTab(category);
    setFeedbackMsg(null);
    setIsModalOpen(true);
  };

  // Submit Handlers
  const handleSaveSalesActivity = (e: React.FormEvent) => {
    e.preventDefault();
    let accountId = salesForm.accId;

    // Create new account if typed
    if (!accountId && salesForm.newAccName.trim() && onSaveAccount) {
      accountId = uid();
      onSaveAccount({
        id: accountId,
        name: salesForm.newAccName.trim(),
        pic: 'PIC Baru',
        industry: 'University',
        source: 'WhatsApp Business',
        phone: '',
        email: '',
      });
    }

    const newAct: Activity = {
      id: uid(),
      accId: accountId || 'acc-umum',
      type: salesForm.type,
      date: targetDate,
      status: salesForm.status,
      note: salesForm.note.trim() || `Kebutuhan Sales: ${salesForm.type}`,
    };

    onSaveActivity(newAct);
    setFeedbackMsg(`Agenda sales berhasil dijadwalkan pada ${targetDate}`);
    setSalesForm({
      accId: '',
      newAccName: '',
      type: 'Meeting',
      status: 'Terjadwal',
      note: '',
    });
    setTimeout(() => {
      setActiveTab('agenda');
      setFeedbackMsg(null);
    }, 1000);
  };

  const handleSaveMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mktForm.name.trim()) return;

    const newMkt: MarketingCampaign = {
      id: uid(),
      date: targetDate,
      name: mktForm.name.trim(),
      channel: mktForm.channel,
      type: mktForm.type,
      spend: Number(mktForm.spend) || 0,
      reach: Number(mktForm.reach) || 0,
      clicks: Number(mktForm.clicks) || 0,
      leads: Number(mktForm.leads) || 0,
      status: mktForm.status,
      note: mktForm.note.trim(),
    };

    onSaveMkt(newMkt);
    setFeedbackMsg(`Campaign marketing "${newMkt.name}" berhasil dicatat pada ${targetDate}`);
    setMktForm({
      name: '',
      channel: 'LinkedIn',
      type: 'Iklan berbayar',
      spend: 0,
      reach: 0,
      clicks: 0,
      leads: 0,
      status: 'Dalam proses',
      note: '',
    });
    setTimeout(() => {
      setActiveTab('agenda');
      setFeedbackMsg(null);
    }, 1000);
  };

  const handleSaveLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (labSubTab === 'sample') {
      let accountId = labSampleForm.accId;
      if (!accountId && labSampleForm.newAccName.trim() && onSaveAccount) {
        accountId = uid();
        onSaveAccount({
          id: accountId,
          name: labSampleForm.newAccName.trim(),
          pic: 'Customer Lab',
          industry: 'Laboratory',
          source: 'Referral',
          email: '',
          phone: '',
        });
      }

      const newLab: LabWorkOrder = {
        id: uid(),
        sid: labSampleForm.sid.trim() || `SMP-${targetDate.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
        accId: accountId || 'acc-umum',
        service: labSampleForm.service,
        cust: 'Eksternal',
        analyst: labSampleForm.analyst.trim() || 'Tim Analis',
        date: targetDate,
        masuk: Number(labSampleForm.masuk) || 1,
        analisa: Number(labSampleForm.analisa) || 0,
        down: 'Tidak ada',
        jam: 0,
        note: labSampleForm.note.trim() || `Kebutuhan uji laboratorium ${labSampleForm.service}`,
        completedLogged: Number(labSampleForm.analisa) >= Number(labSampleForm.masuk) && Number(labSampleForm.masuk) > 0,
      };

      onSaveLab(newLab);
      setFeedbackMsg(`Jadwal pengujian sampel ${newLab.sid} berhasil dicatat`);
    } else {
      const newEvt: InstrumentEvent = {
        id: uid(),
        name: labInstrForm.name,
        type: labInstrForm.type,
        cat: labInstrForm.cat,
        date: targetDate,
        hours: Number(labInstrForm.hours) || 0,
        next: labInstrForm.next || undefined,
        note: labInstrForm.note.trim() || `Jadwal ${labInstrForm.type} instrumen ${labInstrForm.name}`,
      };

      onSaveInstrumentEvent(newEvt);
      setFeedbackMsg(`Jadwal instrumen ${newEvt.type} (${newEvt.name}) berhasil dicatat`);
    }

    setTimeout(() => {
      setActiveTab('agenda');
      setFeedbackMsg(null);
    }, 1000);
  };

  const handleSaveClosedService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closedServiceForm.service) return;

    const srvName = closedServiceForm.service.trim();
    const reasonText = closedServiceForm.reason.trim() || 'Layanan sedang ditutup sementara.';

    // 1. Update Catalog if onSaveCat is provided
    if (onSaveCat) {
      const existing = (state.cat || []).find(
        (c) => c.d.toLowerCase() === srvName.toLowerCase() ||
               c.m.toLowerCase() === srvName.toLowerCase()
      );
      if (existing) {
        onSaveCat({
          ...existing,
          status: closedServiceForm.status as any,
          closedReason: reasonText,
          closedFrom: closedServiceForm.startDate || targetDate,
          closedUntil: closedServiceForm.endDate || undefined,
        });
      } else {
        onSaveCat({
          id: uid(),
          d: srvName,
          m: srvName.split(' ')[0] || 'UJI',
          p: 500000,
          status: closedServiceForm.status as any,
          closedReason: reasonText,
          closedFrom: closedServiceForm.startDate || targetDate,
          closedUntil: closedServiceForm.endDate || undefined,
        });
      }
    }

    // 2. Also register a Lab Work Order record marked as 'Layanan Ditutup'
    const newClosedLab: LabWorkOrder = {
      id: uid(),
      sid: `CLSD-${targetDate.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
      accId: closedServiceForm.accId || 'acc-umum',
      service: srvName,
      cust: 'Internal',
      analyst: 'Koordinator QC/Lab',
      date: targetDate,
      masuk: 0,
      analisa: 0,
      down: 'Layanan Ditutup',
      jam: 24,
      note: reasonText,
      serviceStatus: 'Layanan Ditutup',
      serviceClosedNote: reasonText,
      closedFrom: closedServiceForm.startDate || targetDate,
      closedUntil: closedServiceForm.endDate || undefined,
    };
    onSaveLab(newClosedLab);

    setFeedbackMsg(`Jadwal penutupan layanan "${srvName}" berhasil dicatat & masuk ke Kalender Terpadu`);
    setClosedServiceForm({
      service: state.cat[0]?.d || 'Jasa analisa: Difraksi Sinar-X (XRD)',
      accId: '',
      status: 'Ditutup Sementara',
      reason: '',
      startDate: targetDate,
      endDate: '',
    });

    setTimeout(() => {
      setActiveTab('agenda');
      setFeedbackMsg(null);
    }, 1200);
  };

  // Agenda items on current targetDate
  const currentSalesActs = state.acts.filter((a) => a.date === targetDate);
  const currentMktCampaigns = state.mkt.filter((m) => m.date === targetDate);
  const currentLabOrders = state.labs.filter((l) => l.date === targetDate);
  const currentInstrEvents = state.instr.filter((i) => i.date === targetDate);
  const currentClosedServices = getClosedServicesOnDate(targetDate);
  const totalAgendasOnDate =
    currentSalesActs.length +
    currentMktCampaigns.length +
    currentLabOrders.length +
    currentInstrEvents.length +
    currentClosedServices.length;

  // Agendas on selectedDate for the monthly detail view
  const selectedSalesActs = state.acts.filter((a) => a.date === selectedDate);
  const selectedMktCampaigns = state.mkt.filter((m) => m.date === selectedDate);
  const selectedLabOrders = state.labs.filter((l) => l.date === selectedDate);
  const selectedInstrEvents = state.instr.filter((i) => i.date === selectedDate);
  const selectedClosedServices = getClosedServicesOnDate(selectedDate);
  const totalAgendasOnSelectedDate =
    selectedSalesActs.length +
    selectedMktCampaigns.length +
    selectedLabOrders.length +
    selectedInstrEvents.length +
    selectedClosedServices.length;

  // Monthly calendar math for selectedMonth & selectedYear
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Min, 1 = Sen, etc.
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthDayNumbers = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Header & Year Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-emerald-600" />
            <span>Kalender Terpadu &bull; Sales, Marketing &amp; Laboratorium</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Matriks tahunan terintegrasi: pantau agenda, isi form kebutuhan tiap divisi, atau klik tanggal untuk menjadwalkan
          </p>
        </div>

        {/* Year Switcher for Desktop & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Year Switcher (Tahun 2026 with < and >) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
              title="Tahun sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-lg bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Tahun {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
              title="Tahun berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('auto')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition ${
                viewMode === 'auto'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Otomatis: Web menampilkan 1 Tahun penuh, Mobile menampilkan Kalender Bulanan"
            >
              Otomatis
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Paksa tampilkan Matriks 1 Tahun penuh"
            >
              1 Tahun
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Paksa tampilkan Kalender Bulanan"
            >
              Bulanan
            </button>
          </div>
        </div>
      </div>

      {/* QUICK FORM LINKS ROW (Sales, Marketing, Laboratorium) */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Link Formulir Terpadu
            </span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Isi Kebutuhan Agenda / Tugas Divisi:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 w-full sm:w-auto">
            {/* 1. Link Form Sales */}
            <button
              onClick={() => openFormModal('sales', selectedDate)}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
            >
              <Briefcase className="h-4 w-4" />
              <span>+ Form Sales</span>
            </button>

            {/* 2. Link Form Marketing */}
            <button
              onClick={() => openFormModal('marketing', selectedDate)}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition active:scale-95"
            >
              <Megaphone className="h-4 w-4" />
              <span>+ Form Marketing</span>
            </button>

            {/* 3. Link Form Laboratorium */}
            <button
              onClick={() => openFormModal('lab', selectedDate)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
            >
              <FlaskConical className="h-4 w-4" />
              <span>+ Form Lab</span>
            </button>

            {/* 4. Link Form Layanan Ditutup */}
            <button
              onClick={() => openFormModal('closed_service', selectedDate)}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition active:scale-95"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>+ Catat Layanan Ditutup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Indikator Tanggal:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/40" />
            <span className="text-[11px] font-medium">Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-900/40" />
            <span className="text-[11px] font-medium">Laboratorium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-medium">Marketing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded-full bg-rose-500" />
            <span className="text-[11px] font-medium">Downtime / Kalibrasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded-full bg-rose-600 ring-1 ring-rose-400" />
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Layanan Ditutup</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 italic">
          *Klik sel tanggal untuk memilih hari, melihat rincian agenda, atau membuka formulir
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE-OPTIMIZED MONTHLY CALENDAR VIEW (FOR MOBILE / COMPACT)          */}
      {/* ========================================================================= */}
      {(viewMode === 'month' || viewMode === 'auto') && (
        <div className={viewMode === 'auto' ? 'block md:hidden space-y-4' : 'space-y-4'}>
          {/* Main Calendar Card - faithfully replicates image_5ad1dd0e.png */}
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header: < Month Year > */}
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <button
                onClick={handlePrevMonth}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-xl dark:text-slate-100">
                {months[selectedMonth]} {selectedYear}
              </h3>

              <button
                onClick={handleNextMonth}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title="Bulan berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Days of Week Header: Min, Sen, Sel, Rab, Kam, Jum, Sab */}
            <div className="mb-2 grid grid-cols-7 gap-2 sm:gap-2.5">
              {dayNamesShort.map((dayName) => (
                <div
                  key={dayName}
                  className="py-1 text-center text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
              {/* Empty Spacer Cells before 1st of month */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`spacer-${i}`} className="aspect-square min-h-[50px] sm:min-h-[64px]" />
              ))}

              {/* Day Cells 1..daysInMonth */}
              {monthDayNumbers.map((d) => {
                const dateStr = `${selectedYear}-${pad(selectedMonth + 1)}-${pad(d)}`;
                const st = getDayStatus(dateStr);
                const isSelected = selectedDate === dateStr;
                const isCurrentDay = dateStr === curDate;

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    onDoubleClick={() => openFormModal('agenda', dateStr)}
                    title={`Klik untuk melihat agenda tanggal ${dateStr}. Klik ganda untuk buka formulir.`}
                    className={`relative flex aspect-square min-h-[50px] sm:min-h-[64px] flex-col items-center justify-center rounded-2xl border transition-all duration-150 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-white font-bold text-slate-900 shadow-sm scale-[1.02] z-10 dark:border-blue-500 dark:bg-slate-800 dark:text-white'
                        : isCurrentDay
                        ? 'border-2 border-emerald-500 bg-emerald-50/50 font-bold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'border-slate-100 bg-slate-50/70 text-slate-700 hover:bg-slate-100/90 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'
                    }`}
                  >
                    {/* Day Number */}
                    <span className="text-sm font-semibold leading-none sm:text-base">{d}</span>

                    {/* Indicator Pill matching user image reference (e.g. amber bar like day 19) */}
                    <div className="mt-1 flex h-1.5 items-center justify-center gap-1">
                      {st.hasClosedService && (
                        <span
                          className="h-1.5 w-3.5 rounded-full bg-rose-600 ring-1 ring-rose-300 dark:ring-rose-800 shadow-2xs"
                          title="Layanan Sedang Ditutup / Suspended"
                        />
                      )}
                      {st.hasDowntime && (
                        <span
                          className="h-1.5 w-3.5 rounded-full bg-rose-500 shadow-2xs"
                          title="Downtime / Kalibrasi"
                        />
                      )}
                      {st.hasMkt && (
                        <span
                          className="h-1.5 w-3.5 rounded-full bg-amber-500 shadow-2xs"
                          title="Marketing"
                        />
                      )}
                      {st.hasSales && (
                        <span
                          className="h-1.5 w-2 rounded-full bg-blue-600 shadow-2xs"
                          title="Sales"
                        />
                      )}
                      {st.hasLab && (
                        <span
                          className="h-1.5 w-2 rounded-full bg-emerald-600 shadow-2xs"
                          title="Laboratorium"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DETAIL & FORM KEBUTUHAN FOR SELECTED DATE */}
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agenda &amp; Formulir Tanggal Terpilih
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{formatFullDateIndo(selectedDate)}</span>
                  {selectedDate === curDate && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Hari Ini
                    </span>
                  )}
                  {totalAgendasOnSelectedDate > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {totalAgendasOnSelectedDate} Agenda
                    </span>
                  )}
                </h4>
              </div>

              {/* Quick action buttons for this specific selected date */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => openFormModal('sales', selectedDate)}
                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition"
                >
                  + Sales
                </button>
                <button
                  onClick={() => openFormModal('marketing', selectedDate)}
                  className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 transition"
                >
                  + Marketing
                </button>
                <button
                  onClick={() => openFormModal('lab', selectedDate)}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition"
                >
                  + Lab
                </button>
                <button
                  onClick={() => openFormModal('closed_service', selectedDate)}
                  className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition"
                >
                  + Layanan Ditutup
                </button>
                <button
                  onClick={() => openFormModal('agenda', selectedDate)}
                  className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900 dark:bg-slate-700 transition"
                >
                  Buka Form Lengkap
                </button>
              </div>
            </div>

            {/* List of items on this date */}
            <div className="pt-3">
              {/* Prominent Closed Services Warning Box */}
              {selectedClosedServices.length > 0 && (
                <div className="mb-3 rounded-xl border border-rose-300 bg-rose-50/90 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-pulse" />
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                        Peringatan: Layanan Sedang Ditutup ({selectedClosedServices.length})
                      </span>
                    </div>
                    <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-300">
                      Tidak Menerima Sampel
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedClosedServices.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-white p-2.5 shadow-2xs border border-rose-200 dark:bg-slate-900 dark:border-rose-900/50 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-600" />
                            {item.serviceName}
                          </span>
                          <span className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 dark:bg-rose-950 dark:text-rose-300">
                            {item.source}
                          </span>
                        </div>
                        {item.customer && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            <span className="font-semibold">Customer / PIC Terkait:</span> {item.customer}
                          </div>
                        )}
                        <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 font-medium bg-rose-50/60 dark:bg-rose-950/30 p-1.5 rounded">
                          <span className="font-bold">Keterangan:</span> {item.note || 'Layanan sedang ditutup sementara.'}
                        </div>
                        {item.period && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Periode: {item.period}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalAgendasOnSelectedDate === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-850/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Belum ada agenda atau kebutuhan tercatat pada <b>{formatFullDateIndo(selectedDate)}</b>.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Klik tombol di atas untuk mengisi formulir Sales, Marketing, Laboratorium, atau Catat Layanan Ditutup.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Sales Activities */}
                  {selectedSalesActs.map((act) => {
                    const acc = state.accounts.find((a) => a.id === act.accId);
                    return (
                      <div
                        key={act.id}
                        className="flex items-start justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/40 p-2.5 dark:border-blue-900/50 dark:bg-blue-950/20"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            <span className="font-bold text-xs text-blue-900 dark:text-blue-200">
                              Sales: {act.type}
                            </span>
                            <span className="rounded bg-blue-200/60 px-1.5 py-0.2 text-[9px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {act.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {acc ? acc.name : 'Pelanggan'} • {act.note}
                          </p>
                        </div>
                        <button
                          onClick={() => onDeleteActivity(act.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Hapus aktivitas sales"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Lab Orders */}
                  {selectedLabOrders.map((lab) => {
                    const acc = state.accounts.find((a) => a.id === lab.accId);
                    return (
                      <div
                        key={lab.id}
                        className="flex items-start justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                              Lab: {lab.sid} ({lab.service})
                            </span>
                            <span className="rounded bg-emerald-200/60 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              {lab.analisa}/{lab.masuk} sampel
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {acc ? acc.name : 'Mitra'} • Analis: {lab.analyst || '-'} • {lab.note}
                          </p>
                        </div>
                        <button
                          onClick={() => onDeleteLab(lab.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Hapus order lab"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Marketing Campaigns */}
                  {selectedMktCampaigns.map((mkt) => (
                    <div
                      key={mkt.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                            Marketing: {mkt.name}
                          </span>
                          <span className="rounded bg-amber-200/60 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            {mkt.channel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {mkt.note || mkt.type} • Biaya: {idr(mkt.spend)} • Target Leads: {mkt.leads}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteMkt(mkt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Instrument Events */}
                  {selectedInstrEvents.map((instEv) => (
                    <div
                      key={instEv.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/40 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/20"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                            Instrumen: {instEv.type} ({instEv.name})
                          </span>
                          {instEv.hours > 0 && (
                            <span className="rounded bg-rose-200/60 px-1.5 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                              {instEv.hours} jam
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{instEv.note}</p>
                      </div>
                      <button
                        onClick={() => onDeleteInstrumentEvent(instEv.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus event instrumen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 12-MONTH MATRIX GRID (WEB / DESKTOP VIEW - 1 TAHUN PENUH)              */}
      {/* ========================================================================= */}
      {(viewMode === 'matrix' || viewMode === 'auto') && (
        <div className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${viewMode === 'auto' ? 'hidden md:block' : 'block'}`}>
          <table className="w-full min-w-[1080px] table-fixed border-collapse">
            <colgroup>
              <col style={{ width: '96px' }} />
              {Array.from({ length: 31 }, (_, i) => (
                <col key={i} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-850 text-[10px] font-bold text-slate-500">
                <th className="py-2 px-3 text-left border-r border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  Bulan
                </th>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <th
                    key={d}
                    className="py-1.5 text-center font-mono font-bold border-r border-slate-200/70 dark:border-slate-800/70 text-slate-500 dark:text-slate-400"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {months.map((mName, mIdx) => {
                const daysInMonth = new Date(selectedYear, mIdx + 1, 0).getDate();
                const days = Array.from({ length: 31 }, (_, i) => i + 1);

                return (
                  <tr key={mName} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Month Name Column */}
                    <td className="px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50/60 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800 truncate">
                      {mName}
                    </td>

                    {/* Days 1 - 31 (Strictly Uniform & Aligned) */}
                    {days.map((d) => {
                      if (d > daysInMonth) {
                        return (
                          <td
                            key={d}
                            className="p-0 border-r border-slate-100/70 bg-slate-50/40 dark:border-slate-800/60 dark:bg-slate-950/20"
                          />
                        );
                      }

                      const dateStr = `${selectedYear}-${pad(mIdx + 1)}-${pad(d)}`;
                      const st = getDayStatus(dateStr);

                      return (
                        <td key={d} className="p-0 border-r border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              openFormModal('agenda', dateStr);
                            }}
                            title={`Tanggal ${dateStr}: klik untuk melihat atau menambah data kebutuhan`}
                            className={`group relative flex h-11 w-full flex-col items-center justify-between p-1 text-[11px] transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
                              st.isToday
                                ? 'bg-emerald-50 font-black text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-inset ring-emerald-500 z-10'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {/* Top Indicator dots (Sales: blue left, Lab: green right) */}
                            <div className="flex h-1.5 w-full justify-between px-0.5 pointer-events-none">
                              <span
                                className={`h-1.5 w-1.5 rounded-full transition ${
                                  st.hasSales ? 'bg-blue-600 scale-110' : 'bg-transparent'
                                }`}
                              />
                              <span
                                className={`h-1.5 w-1.5 rounded-full transition ${
                                  st.hasLab ? 'bg-emerald-600 scale-110' : 'bg-transparent'
                                }`}
                              />
                            </div>

                            {/* Date Number - Uniform centered alignment */}
                            <span className="text-[10px] font-semibold tracking-tight leading-none pointer-events-none">
                              {d}
                            </span>

                            {/* Bottom Indicator Pill (Closed Service: rose-600, Downtime: rose-500, Marketing: amber) */}
                            <div className="flex h-1.5 w-full justify-center pointer-events-none">
                              {st.hasClosedService ? (
                                <span className="h-1.5 w-3 rounded-full bg-rose-600 ring-1 ring-rose-300 shadow-2xs" title="Layanan Ditutup" />
                              ) : st.hasDowntime ? (
                                <span className="h-1.5 w-3 rounded-full bg-rose-500 shadow-2xs" title="Downtime / Kalibrasi" />
                              ) : st.hasMkt ? (
                                <span className="h-1.5 w-3 rounded-full bg-amber-500 shadow-2xs" title="Marketing" />
                              ) : (
                                <span className="h-1.5 w-3" />
                              )}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODAL FOR FORM ISIAN SALES, MARKETING, LABORATORIUM, LAYANAN DITUTUP & AGENDA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Form Kebutuhan &bull; Tanggal {targetDate}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Input kebutuhan sales, strategi marketing, operasional lab, atau catat penutupan layanan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Date Picker & Tabs Switcher */}
            <div className="border-b border-slate-100 p-3 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                {targetDate === curDate && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Hari Ini
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-5 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('sales')}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 transition text-[11px] ${
                    activeTab === 'sales'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  <Briefcase className="h-3 w-3" />
                  <span>Sales</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('marketing')}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 transition text-[11px] ${
                    activeTab === 'marketing'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  <Megaphone className="h-3 w-3" />
                  <span>Mkt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lab')}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 transition text-[11px] ${
                    activeTab === 'lab'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  <FlaskConical className="h-3 w-3" />
                  <span>Lab</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('closed_service')}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 transition text-[11px] ${
                    activeTab === 'closed_service'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 hover:text-rose-900 dark:text-rose-400'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Ditutup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('agenda')}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 transition text-[11px] ${
                    activeTab === 'agenda'
                      ? 'bg-slate-700 text-white shadow-xs dark:bg-slate-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Agenda ({totalAgendasOnDate})</span>
                </button>
              </div>
            </div>

            {/* Feedback notification toast */}
            {feedbackMsg && (
              <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Modal Body / Tab Contents */}
            <div className="p-4 overflow-y-auto flex-1 text-xs">
              {/* TAB 1: FORM KEBUTUHAN SALES */}
              {activeTab === 'sales' && (
                <form onSubmit={handleSaveSalesActivity} className="space-y-3.5">
                  <div className="rounded-lg bg-blue-50/60 p-2.5 text-[11px] text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 border border-blue-100 dark:border-blue-900/50">
                    Isikan kebutuhan kegiatan sales untuk tanggal <b>{targetDate}</b>. Agenda akan langsung tercatat di CRM dan kalender ditandai dengan titik <b>Biru</b>.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Jenis Aktivitas Sales
                      </label>
                      <select
                        value={salesForm.type}
                        onChange={(e) => setSalesForm({ ...salesForm, type: e.target.value as any })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {ACTIVITIES.map((act) => (
                          <option key={act} value={act}>
                            {act}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Status Agenda
                      </label>
                      <select
                        value={salesForm.status}
                        onChange={(e) => setSalesForm({ ...salesForm, status: e.target.value as any })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="Terjadwal">Terjadwal</option>
                        <option value="Dalam proses">Dalam proses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pilih Kontak Pelanggan / Institusi
                    </label>
                    <select
                      value={salesForm.accId}
                      onChange={(e) => setSalesForm({ ...salesForm, accId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">-- Pilih dari kontak terdaftar --</option>
                      {state.accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.industry} - {acc.pic})
                        </option>
                      ))}
                    </select>
                  </div>

                  {!salesForm.accId && (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Atau Ketik Nama Kontak / Perusahaan Baru
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: PT Mineral Maju Bersama / Dr. Hasan"
                        value={salesForm.newAccName}
                        onChange={(e) => setSalesForm({ ...salesForm, newAccName: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan / Deskripsi Kebutuhan Sales *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Follow up penawaran pengujian SEM-EDS 10 sampel, butuh koordinasi SLA 3 hari kerja..."
                      value={salesForm.note}
                      onChange={(e) => setSalesForm({ ...salesForm, note: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                    >
                      Simpan Kebutuhan Sales
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: FORM KEBUTUHAN MARKETING */}
              {activeTab === 'marketing' && (
                <form onSubmit={handleSaveMarketing} className="space-y-3.5">
                  <div className="rounded-lg bg-amber-50/60 p-2.5 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-100 dark:border-amber-900/50">
                    Isikan program promosi atau kampanye marketing pada tanggal <b>{targetDate}</b>. Kalender akan ditandai dengan garis <b>Oranye</b> di bagian bawah.
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Program / Judul Kampanye Marketing *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kampanye Karakterisasi Mineral XRD via LinkedIn / Expo Sains"
                      value={mktForm.name}
                      onChange={(e) => setMktForm({ ...mktForm, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Saluran / Channel
                      </label>
                      <select
                        value={mktForm.channel}
                        onChange={(e) => setMktForm({ ...mktForm, channel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="WhatsApp Business">WhatsApp Business</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Event/Pameran">Event / Pameran</option>
                        <option value="Email campaign">Email Campaign</option>
                        <option value="Media sosial">Instagram / Sosmed</option>
                        <option value="Webinar/Seminar">Webinar / Seminar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tipe Kegiatan
                      </label>
                      <select
                        value={mktForm.type}
                        onChange={(e) => setMktForm({ ...mktForm, type: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="Iklan berbayar">Iklan berbayar</option>
                        <option value="Post organik">Post organik</option>
                        <option value="Broadcast referral">Broadcast referral</option>
                        <option value="Booth pameran">Booth pameran</option>
                        <option value="Sponsorship">Sponsorship</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Anggaran / Biaya (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={mktForm.spend || 0}
                        onChange={(e) => setMktForm({ ...mktForm, spend: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Leads (Calon Klien)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={mktForm.leads || 0}
                        onChange={(e) => setMktForm({ ...mktForm, leads: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan / Rincian Kampanye
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Target audiens peneliti kampus, manajer QA industri nikel & semen..."
                      value={mktForm.note}
                      onChange={(e) => setMktForm({ ...mktForm, note: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-500 px-5 py-2 font-bold text-white shadow-sm hover:bg-amber-600"
                    >
                      Simpan Kebutuhan Marketing
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: FORM KEBUTUHAN LABORATORIUM */}
              {activeTab === 'lab' && (
                <form onSubmit={handleSaveLabOrder} className="space-y-3.5">
                  {/* Sub-tab selection: Uji Sampel vs Kalibrasi/Downtime */}
                  <div className="flex gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLabSubTab('sample')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        labSubTab === 'sample'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      🧪 Order Uji Sampel
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabSubTab('instrument')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        labSubTab === 'instrument'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      ⚙️ Kalibrasi / Downtime Alat
                    </button>
                  </div>

                  {labSubTab === 'sample' ? (
                    <>
                      <div className="rounded-lg bg-emerald-50/60 p-2.5 text-[11px] text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/50">
                        Catat jadwal masuk sampel pada tanggal <b>{targetDate}</b>. Kalender akan menampilkan titik <b>Hijau</b> di sisi kanan atas.
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Kode / ID Sampel
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: SMP-2026-010"
                            value={labSampleForm.sid}
                            onChange={(e) => setLabSampleForm({ ...labSampleForm, sid: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Instrumen / Layanan Uji
                          </label>
                          <select
                            value={labSampleForm.service}
                            onChange={(e) => setLabSampleForm({ ...labSampleForm, service: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            {state.insts.length > 0 ? (
                              state.insts.map((i) => (
                                <option key={i.id} value={i.name}>
                                  {i.name} ({i.brand || 'Alat'})
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="XRD">XRD</option>
                                <option value="SEM">SEM</option>
                                <option value="ICP-OES">ICP-OES</option>
                                <option value="FTIR">FTIR</option>
                                <option value="HPLC">HPLC</option>
                                <option value="GC-MS">GC-MS</option>
                                <option value="XRF">XRF</option>
                                <option value="UV-Vis">UV-Vis</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Jumlah Sampel Masuk (Fisik)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={labSampleForm.masuk || 1}
                            onChange={(e) => setLabSampleForm({ ...labSampleForm, masuk: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            PIC Analis Penanggung Jawab
                          </label>
                          <input
                            type="text"
                            placeholder="Nama Analis Lab"
                            value={labSampleForm.analyst}
                            onChange={(e) => setLabSampleForm({ ...labSampleForm, analyst: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Pelanggan / Institusi Pengirim
                        </label>
                        <select
                          value={labSampleForm.accId}
                          onChange={(e) => setLabSampleForm({ ...labSampleForm, accId: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="">-- Pilih dari kontak atau ketik baru --</option>
                          {state.accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} ({acc.industry})
                            </option>
                          ))}
                        </select>
                      </div>

                      {!labSampleForm.accId && (
                        <div>
                          <input
                            type="text"
                            placeholder="Ketik nama institusi / customer jika belum ada di list"
                            value={labSampleForm.newAccName}
                            onChange={(e) => setLabSampleForm({ ...labSampleForm, newAccName: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Catatan / Parameter Uji Khusus
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Preparasi khusus, temperatur uji, rentang 2-theta..."
                          value={labSampleForm.note}
                          onChange={(e) => setLabSampleForm({ ...labSampleForm, note: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg bg-rose-50/60 p-2.5 text-[11px] text-rose-900 dark:bg-rose-950/30 dark:text-rose-200 border border-rose-100 dark:border-rose-900/50">
                        Catat jadwal kalibrasi tahunan, preventive maintenance (PM), atau kendala downtime instrumen pada tanggal <b>{targetDate}</b>.
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Pilih Instrumen
                          </label>
                          <select
                            value={labInstrForm.name}
                            onChange={(e) => setLabInstrForm({ ...labInstrForm, name: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            {state.insts.map((i) => (
                              <option key={i.id} value={i.name}>
                                {i.name} ({i.brand})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Jenis Event
                          </label>
                          <select
                            value={labInstrForm.type}
                            onChange={(e) => setLabInstrForm({ ...labInstrForm, type: e.target.value as any })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="Kalibrasi">Kalibrasi Resmi</option>
                            <option value="PM">Preventive Maintenance (PM)</option>
                            <option value="Downtime">Downtime / Gangguan Part</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Durasi Downtime (Jam)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={labInstrForm.hours || 0}
                            onChange={(e) => setLabInstrForm({ ...labInstrForm, hours: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Jadwal Berikutnya (Opsional)
                          </label>
                          <input
                            type="date"
                            value={labInstrForm.next}
                            onChange={(e) => setLabInstrForm({ ...labInstrForm, next: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Catatan Teknis / Vendor Servis
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Sertifikasi BSN/KAN atau pergantian spare part..."
                          value={labInstrForm.note}
                          onChange={(e) => setLabInstrForm({ ...labInstrForm, note: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-700"
                    >
                      Simpan Kebutuhan Lab
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: FORM PENCATATAN LAYANAN DITUTUP */}
              {activeTab === 'closed_service' && (
                <form onSubmit={handleSaveClosedService} className="space-y-3.5">
                  <div className="rounded-lg bg-rose-50/70 p-2.5 text-[11px] text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50">
                    Catat penutupan layanan (karena maintenance, kalibrasi tahunan, perbaikan alat, atau permintaan khusus customer yang ditutup) pada tanggal <b>{targetDate}</b>. Kalender akan menampilkan indikator <b>Merah/Rose</b>.
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Layanan / Pengujian *
                    </label>
                    <div className="space-y-2">
                      <select
                        value={closedServiceForm.service}
                        onChange={(e) => setClosedServiceForm({ ...closedServiceForm, service: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">-- Pilih dari Katalog atau Alat Lab --</option>
                        <optgroup label="Katalog Layanan">
                          {state.cat.map((c) => (
                            <option key={c.id} value={c.d}>
                              {c.d} ({c.m})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Daftar Instrumen">
                          {state.insts.map((i) => (
                            <option key={i.id} value={`Pengujian ${i.name}`}>
                              Pengujian {i.name} ({i.brand})
                            </option>
                          ))}
                        </optgroup>
                      </select>

                      <input
                        type="text"
                        placeholder="Atau ketik nama layanan kustom yang ditutup..."
                        value={closedServiceForm.service}
                        onChange={(e) => setClosedServiceForm({ ...closedServiceForm, service: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Status Penutupan
                      </label>
                      <select
                        value={closedServiceForm.status}
                        onChange={(e) => setClosedServiceForm({ ...closedServiceForm, status: e.target.value as any })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="Ditutup Sementara">Ditutup Sementara</option>
                        <option value="Maintenance">Maintenance / Kalibrasi</option>
                        <option value="Layanan Ditutup">Layanan Ditutup (Permanen/Khusus)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Terkait Customer / PIC (Opsional)
                      </label>
                      <select
                        value={closedServiceForm.accId}
                        onChange={(e) => setClosedServiceForm({ ...closedServiceForm, accId: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">-- Umum / Semua Customer --</option>
                        {state.accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.pic || 'PIC'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tanggal Mulai Penutupan *
                      </label>
                      <input
                        type="date"
                        required
                        value={closedServiceForm.startDate || targetDate}
                        onChange={(e) => setClosedServiceForm({ ...closedServiceForm, startDate: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Estimasi Dibuka Kembali (Opsional)
                      </label>
                      <input
                        type="date"
                        value={closedServiceForm.endDate}
                        onChange={(e) => setClosedServiceForm({ ...closedServiceForm, endDate: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan / Keterangan Alasan Penutupan *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Overhaul tabung X-ray XRD & rekualifikasi standar KAN; permintaan customer batch ini tidak dapat diproses hingga kalibrasi selesai..."
                      value={closedServiceForm.reason}
                      onChange={(e) => setClosedServiceForm({ ...closedServiceForm, reason: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-rose-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-rose-700"
                    >
                      Catat Layanan Ditutup
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: LIHAT AGENDA TERDAFTAR PADA TANGGAL INI */}
              {activeTab === 'agenda' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Daftar Agenda &amp; Tugas ({targetDate})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Total: {totalAgendasOnDate} item
                    </span>
                  </div>

                  {/* Closed Services on this targetDate */}
                  {currentClosedServices.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Layanan Sedang Ditutup ({currentClosedServices.length})</span>
                      </div>
                      {currentClosedServices.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/30"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-rose-600" />
                              <span className="font-bold text-rose-900 dark:text-rose-200">
                                {item.serviceName}
                              </span>
                              <span className="rounded bg-rose-200/80 px-1.5 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                {item.status} ({item.source})
                              </span>
                            </div>
                            {item.customer && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Customer / PIC:</span> {item.customer}
                              </div>
                            )}
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              <span className="font-semibold text-rose-700 dark:text-rose-400">Alasan:</span> {item.note || 'Layanan sedang ditutup sementara.'}
                            </p>
                            {item.period && (
                              <span className="text-[10px] text-slate-500 block">
                                Periode: {item.period}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalAgendasOnDate === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <Clock className="h-8 w-8 mx-auto opacity-30" />
                      <p>Belum ada jadwal atau kebutuhan tercatat pada tanggal {targetDate}.</p>
                      <div className="flex justify-center gap-2 pt-2">
                        <button
                          onClick={() => setActiveTab('sales')}
                          className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                        >
                          + Tambah Sales
                        </button>
                        <button
                          onClick={() => setActiveTab('marketing')}
                          className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                        >
                          + Tambah Marketing
                        </button>
                        <button
                          onClick={() => setActiveTab('lab')}
                          className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          + Tambah Lab
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {/* Sales Activities */}
                      {currentSalesActs.map((act) => {
                        const acc = state.accounts.find((a) => a.id === act.accId);
                        return (
                          <div
                            key={act.id}
                            className="flex items-start justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/50 p-2.5 dark:border-blue-900/50 dark:bg-blue-950/20"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-600" />
                                <span className="font-bold text-blue-900 dark:text-blue-200">
                                  Sales: {act.type}
                                </span>
                                <span className="rounded bg-blue-200/60 px-1.5 py-0.2 text-[9px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {act.status}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{act.note}</p>
                              {acc && (
                                <span className="text-[10px] text-slate-500 block">
                                  Klien: <b>{acc.name}</b> ({acc.industry})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => onDeleteActivity(act.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Hapus agenda ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      {/* Lab Orders */}
                      {currentLabOrders.map((lab) => {
                        const acc = state.accounts.find((a) => a.id === lab.accId);
                        return (
                          <div
                            key={lab.id}
                            className="flex items-start justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                  Lab: {lab.service} (Sample {lab.sid})
                                </span>
                                <span className="rounded bg-emerald-200/60 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  {lab.analisa}/{lab.masuk} Sampel
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{lab.note}</p>
                              <span className="text-[10px] text-slate-500 block">
                                Analis: <b>{lab.analyst || '-'}</b> {acc ? `• Mitra: ${acc.name}` : ''}
                              </span>
                            </div>
                            <button
                              onClick={() => onDeleteLab(lab.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Hapus order lab ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      {/* Marketing Campaigns */}
                      {currentMktCampaigns.map((mkt) => (
                        <div
                          key={mkt.id}
                          className="flex items-start justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              <span className="font-bold text-amber-900 dark:text-amber-200">
                                Marketing: {mkt.name}
                              </span>
                              <span className="rounded bg-amber-200/60 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                {mkt.channel}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{mkt.note || mkt.type}</p>
                            <span className="text-[10px] text-slate-500 block">
                              Biaya: {idr(mkt.spend)} • Target Leads: {mkt.leads}
                            </span>
                          </div>
                          <button
                            onClick={() => onDeleteMkt(mkt.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Hapus campaign ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Instrument Events (Downtime / Kalibrasi) */}
                      {currentInstrEvents.map((instEv) => (
                        <div
                          key={instEv.id}
                          className="flex items-start justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/20"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              <span className="font-bold text-rose-900 dark:text-rose-200">
                                {instEv.type}: {instEv.name}
                              </span>
                              {instEv.hours > 0 && (
                                <span className="rounded bg-rose-200/60 px-1.5 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                  {instEv.hours} jam
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{instEv.note}</p>
                          </div>
                          <button
                            onClick={() => onDeleteInstrumentEvent(instEv.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Hapus event ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50/70 p-3 flex justify-between items-center text-xs dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[11px] text-slate-500">
                Pilih tab di atas untuk berganti antar formulir Sales, Marketing &amp; Lab
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 font-semibold text-white dark:bg-slate-700 hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
