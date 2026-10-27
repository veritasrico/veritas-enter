import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  FileCheck2,
  Sliders,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { CapaAction, DailyCheckRecord, QcQaState } from '../../types';
import {
  DAILY_QC_QUESTIONS,
  ISO_GAP_QUESTIONS,
  QCQA_AREAS,
  CAPA_SOURCES,
  CAPA_STATUSES,
  exportDailyCsv,
  exportActionsCsv,
  exportGapCsv,
} from '../../utils/qcqaData';
import { today, uid } from '../../utils/seedData';

interface QcQaViewProps {
  qcqa?: QcQaState;
  onSaveQcQa: (newState: QcQaState) => void;
  isAdmin?: boolean;
}

export const QcQaView: React.FC<QcQaViewProps> = ({
  qcqa = { checks: {}, actions: [], gaps: {} },
  onSaveQcQa,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'daily' | 'capa' | 'iso_gap' | 'guide'>('summary');
  const [selectedDate, setSelectedDate] = useState<string>(today());
  const [searchDaily, setSearchDaily] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('Semua');

  const [searchCapa, setSearchCapa] = useState<string>('');
  const [statusFilterCapa, setStatusFilterCapa] = useState<string>('Semua');

  const [searchGap, setSearchGap] = useState<string>('');
  const [selectedGapArea, setSelectedGapArea] = useState<string>('Semua');

  // Modal State for CAPA Form
  const [isCapaModalOpen, setIsCapaModalOpen] = useState<boolean>(false);
  const [editingCapa, setEditingCapa] = useState<CapaAction | null>(null);
  const [capaForm, setCapaForm] = useState<Partial<CapaAction>>({
    date: today(),
    source: 'Daily GLP',
    area: 'Kesiapan personel',
    owner: '',
    description: '',
    risk: '',
    immediate: '',
    cause: '',
    corrective: '',
    target: today(),
    status: 'Open',
    verification: '',
  });

  // Feedback toast state
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2800);
  };

  // Safe accessor for checks on current selected date
  const currentDailyChecks = qcqa.checks[selectedDate] || {};

  // Stats calculation
  const totalDaily = DAILY_QC_QUESTIONS.length;
  const answeredDaily = Object.values(currentDailyChecks).filter((c) => c.status).length;
  const okDaily = Object.values(currentDailyChecks).filter((c) => c.status === 'OK').length;
  const ncDaily = Object.values(currentDailyChecks).filter((c) => c.status === 'NC').length;
  const naDaily = Object.values(currentDailyChecks).filter((c) => c.status === 'NA').length;
  const openCapa = qcqa.actions.filter((a) => a.status !== 'Closed').length;

  const gapScores = Object.values(qcqa.gaps)
    .map((g) => g.score)
    .filter((s) => s !== undefined && s !== 'NA') as number[];
  const avgGapScore = gapScores.length > 0
    ? (gapScores.reduce((acc, curr) => acc + Number(curr), 0) / gapScores.length).toFixed(1)
    : '-';
  const lowScoreGapCount = gapScores.filter((s) => s <= 2).length;

  // Handlers for Daily GLP
  const handleSetDailyStatus = (id: number, status: 'OK' | 'NC' | 'NA') => {
    const existing = currentDailyChecks[id]?.status;
    // Dynamic toggle: jika pilihan yang sama diklik lagi, batalkan pilihan (reset)
    if (existing === status) {
      handleResetDailyItem(id);
      return;
    }

    const updatedChecksOnDate = {
      ...currentDailyChecks,
      [id]: {
        ...(currentDailyChecks[id] || {}),
        status,
      },
    };
    onSaveQcQa({
      ...qcqa,
      checks: {
        ...qcqa.checks,
        [selectedDate]: updatedChecksOnDate,
      },
    });
    triggerFeedback(`Butir #${id} ditandai ${status}`);
  };

  // Reset pilihan per butir checklist harian
  const handleResetDailyItem = (id: number) => {
    const nextChecks = { ...currentDailyChecks };
    delete nextChecks[id];
    onSaveQcQa({
      ...qcqa,
      checks: {
        ...qcqa.checks,
        [selectedDate]: nextChecks,
      },
    });
    triggerFeedback(`Pilihan butir #${id} berhasil di-reset`);
  };

  // Kosongkan rincian isian temuan NC pada butir tertentu
  const handleClearDailyNcDetails = (id: number) => {
    const current = currentDailyChecks[id];
    if (!current) return;
    const updatedChecksOnDate = {
      ...currentDailyChecks,
      [id]: {
        status: current.status,
      },
    };
    onSaveQcQa({
      ...qcqa,
      checks: {
        ...qcqa.checks,
        [selectedDate]: updatedChecksOnDate,
      },
    });
    triggerFeedback(`Rincian temuan NC butir #${id} telah dikosongkan`);
  };

  // Reset semua pilihan per area/kategori pada tanggal terpilih
  const handleResetDailyArea = (area: string) => {
    const itemsInArea = DAILY_QC_QUESTIONS.filter((q) => q.area === area).map((q) => q.id);
    const affectedCount = itemsInArea.filter((id) => currentDailyChecks[id]?.status).length;
    if (affectedCount === 0) {
      triggerFeedback(`Belum ada butir terisi di area "${area}"`);
      return;
    }

    if (!window.confirm(`Reset semua pilihan (${affectedCount} butir terisi) pada area "${area}" untuk tanggal ${selectedDate}?`)) {
      return;
    }

    const nextChecks = { ...currentDailyChecks };
    itemsInArea.forEach((id) => {
      delete nextChecks[id];
    });

    onSaveQcQa({
      ...qcqa,
      checks: {
        ...qcqa.checks,
        [selectedDate]: nextChecks,
      },
    });
    triggerFeedback(`Pilihan di area "${area}" berhasil di-reset (${affectedCount} butir)`);
  };

  // Reset semua pilihan pada tanggal yang dipilih
  const handleResetDailyDate = () => {
    const totalFilled = Object.values(currentDailyChecks).filter((c) => c.status).length;
    if (totalFilled === 0) {
      triggerFeedback(`Checklist pada tanggal ${selectedDate} sudah kosong`);
      return;
    }

    if (!window.confirm(`Reset seluruh pilihan checklist harian GLP (${totalFilled} butir terisi) pada tanggal ${selectedDate}?`)) {
      return;
    }

    const nextChecksMap = { ...qcqa.checks };
    delete nextChecksMap[selectedDate];

    onSaveQcQa({
      ...qcqa,
      checks: nextChecksMap,
    });
    triggerFeedback(`Seluruh checklist tanggal ${selectedDate} berhasil di-reset`);
  };

  const handleResetDailyFilters = () => {
    setSearchDaily('');
    setSelectedArea('Semua');
    triggerFeedback('Filter checklist harian telah di-reset');
  };

  const handleUpdateDailyDetails = (id: number, field: keyof DailyCheckRecord, value: string) => {
    const updatedChecksOnDate = {
      ...currentDailyChecks,
      [id]: {
        ...(currentDailyChecks[id] || {}),
        [field]: value,
      },
    };
    onSaveQcQa({
      ...qcqa,
      checks: {
        ...qcqa.checks,
        [selectedDate]: updatedChecksOnDate,
      },
    });
  };

  const handlePromoteToCapa = (questionId: number) => {
    const q = DAILY_QC_QUESTIONS.find((item) => item.id === questionId);
    const detail = currentDailyChecks[questionId] || {};
    setEditingCapa(null);
    setCapaForm({
      date: selectedDate,
      source: 'Daily GLP',
      area: q?.area || 'Kesiapan personel',
      owner: detail.owner || '',
      description: detail.finding || q?.q || '',
      immediate: detail.action || '',
      target: detail.target || today(),
      status: 'Open',
      verification: detail.verification || '',
      risk: '',
      cause: '',
      corrective: '',
    });
    setIsCapaModalOpen(true);
  };

  // Handlers for CAPA
  const handleOpenAddCapa = () => {
    setEditingCapa(null);
    setCapaForm({
      date: selectedDate,
      source: 'Daily GLP',
      area: 'Peralatan',
      owner: '',
      description: '',
      risk: '',
      immediate: '',
      cause: '',
      corrective: '',
      target: today(),
      status: 'Open',
      verification: '',
    });
    setIsCapaModalOpen(true);
  };

  const handleOpenEditCapa = (action: CapaAction) => {
    setEditingCapa(action);
    setCapaForm({ ...action });
    setIsCapaModalOpen(true);
  };

  const handleSaveCapa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capaForm.description?.trim()) return;

    let updatedActions: CapaAction[];
    if (editingCapa) {
      updatedActions = qcqa.actions.map((a) =>
        a.id === editingCapa.id
          ? ({
              ...editingCapa,
              ...capaForm,
            } as CapaAction)
          : a
      );
    } else {
      const newAction: CapaAction = {
        id: `CAPA-${Date.now().toString().slice(-6)}`,
        date: capaForm.date || today(),
        source: capaForm.source || 'Daily GLP',
        area: capaForm.area || 'Umum',
        owner: capaForm.owner || 'Analis',
        description: capaForm.description.trim(),
        risk: capaForm.risk || '',
        immediate: capaForm.immediate || '',
        cause: capaForm.cause || '',
        corrective: capaForm.corrective || '',
        target: capaForm.target || today(),
        status: (capaForm.status as 'Open' | 'In progress' | 'Closed') || 'Open',
        verification: capaForm.verification || '',
      };
      updatedActions = [newAction, ...qcqa.actions];
    }

    onSaveQcQa({
      ...qcqa,
      actions: updatedActions,
    });
    setIsCapaModalOpen(false);
  };

  const handleChangeCapaStatus = (id: string, newStatus: 'Open' | 'In progress' | 'Closed') => {
    const updated = qcqa.actions.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    onSaveQcQa({
      ...qcqa,
      actions: updated,
    });
  };

  const handleDeleteCapa = (id: string) => {
    if (confirm('Hapus tiket CAPA ini?')) {
      onSaveQcQa({
        ...qcqa,
        actions: qcqa.actions.filter((a) => a.id !== id),
      });
    }
  };

  // Handlers for ISO GAP
  const handleUpdateGap = (
    id: number,
    field: 'score' | 'gap' | 'action' | 'owner' | 'target',
    value: any
  ) => {
    const currentGap = qcqa.gaps[id] || {};
    const parsedVal = field === 'score' && value !== '' && value !== 'NA' ? Number(value) : value;

    onSaveQcQa({
      ...qcqa,
      gaps: {
        ...qcqa.gaps,
        [id]: {
          ...currentGap,
          [field]: parsedVal,
        },
      },
    });
  };

  // Reset evaluasi pada satu butir klausul GAP ISO
  const handleResetGapItem = (id: number) => {
    const nextGaps = { ...qcqa.gaps };
    delete nextGaps[id];
    onSaveQcQa({
      ...qcqa,
      gaps: nextGaps,
    });
    const q = ISO_GAP_QUESTIONS.find((item) => item.id === id);
    triggerFeedback(`Pilihan evaluasi klausul §${q?.cl || id} berhasil di-reset`);
  };

  // Reset evaluasi pada seluruh klausul dalam area tertentu
  const handleResetGapArea = (area: string) => {
    const itemsInArea = ISO_GAP_QUESTIONS.filter((g) => g.area === area).map((g) => g.id);
    const affectedCount = itemsInArea.filter(
      (id) => qcqa.gaps[id] && (qcqa.gaps[id].score !== undefined || qcqa.gaps[id].gap)
    ).length;
    if (affectedCount === 0) {
      triggerFeedback(`Belum ada klausul terisi di area "${area}"`);
      return;
    }

    if (!window.confirm(`Reset seluruh evaluasi klausul (${affectedCount} terisi) pada area "${area}"?`)) {
      return;
    }

    const nextGaps = { ...qcqa.gaps };
    itemsInArea.forEach((id) => delete nextGaps[id]);
    onSaveQcQa({
      ...qcqa,
      gaps: nextGaps,
    });
    triggerFeedback(`Evaluasi klausul di area "${area}" berhasil di-reset`);
  };

  // Reset semua evaluasi GAP ISO 17025
  const handleResetAllGaps = () => {
    const totalFilled = Object.keys(qcqa.gaps).length;
    if (totalFilled === 0) {
      triggerFeedback('Evaluasi GAP ISO 17025 sudah dalam keadaan kosong');
      return;
    }

    if (!window.confirm(`Reset seluruh evaluasi gap ISO 17025 (${totalFilled} butir)? Seluruh skor dan rencana tindakan akan dikosongkan.`)) {
      return;
    }

    onSaveQcQa({
      ...qcqa,
      gaps: {},
    });
    triggerFeedback('Seluruh evaluasi GAP ISO/IEC 17025 berhasil di-reset');
  };

  const handleResetGapFilters = () => {
    setSearchGap('');
    setSelectedGapArea('Semua');
    triggerFeedback('Filter GAP ISO 17025 telah di-reset');
  };

  const handleResetCapaFilters = () => {
    setSearchCapa('');
    setStatusFilterCapa('Semua');
    triggerFeedback('Filter CAPA telah di-reset');
  };

  const handleResetCapaForm = () => {
    setCapaForm({
      date: selectedDate,
      source: 'Daily GLP',
      area: 'Kesiapan personel',
      owner: '',
      description: '',
      risk: '',
      immediate: '',
      cause: '',
      corrective: '',
      target: today(),
      status: 'Open',
      verification: '',
    });
    triggerFeedback('Isian formulir CAPA telah dikosongkan');
  };

  // Filtered Daily items
  const filteredDailyList = DAILY_QC_QUESTIONS.filter((item) => {
    const matchArea = selectedArea === 'Semua' || item.area === selectedArea;
    const matchQ =
      item.q.toLowerCase().includes(searchDaily.toLowerCase()) ||
      item.e.toLowerCase().includes(searchDaily.toLowerCase());
    return matchArea && matchQ;
  });

  // Filtered CAPA items
  const filteredCapaList = qcqa.actions.filter((action) => {
    const matchStatus = statusFilterCapa === 'Semua' || action.status === statusFilterCapa;
    const q = searchCapa.toLowerCase();
    const matchSearch =
      action.description.toLowerCase().includes(q) ||
      action.owner.toLowerCase().includes(q) ||
      action.area.toLowerCase().includes(q) ||
      action.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Filtered GAP items
  const gapAreas = ['Semua', ...new Set(ISO_GAP_QUESTIONS.map((g) => g.area))];
  const filteredGapList = ISO_GAP_QUESTIONS.filter((g) => {
    const matchArea = selectedGapArea === 'Semua' || g.area === selectedGapArea;
    const q = searchGap.toLowerCase();
    const matchSearch =
      g.q.toLowerCase().includes(q) ||
      g.cl.toLowerCase().includes(q) ||
      g.area.toLowerCase().includes(q);
    return matchArea && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ISO/IEC 17025 &bull; Good Laboratory Practice
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              PT NUSA VERITAS INSPEKTAMA
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <span>Panel QC/QA &amp; Kepatuhan Mutu Laboratorium</span>
          </h2>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddCapa}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Catat Temuan / CAPA</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Notification Toast */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Tab Navigation Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'summary'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Ringkasan Mutu &amp; KPI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'daily'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Checklist Harian GLP</span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px]">
            {answeredDaily}/{totalDaily}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('capa')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'capa'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Tindak Lanjut &amp; CAPA</span>
          {openCapa > 0 && (
            <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px]">
              {openCapa}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('iso_gap')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'iso_gap'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>GAP Assessment ISO 17025</span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px]">
            {ISO_GAP_QUESTIONS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Panduan Kepatuhan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. RINGKASAN MUTU & KPI (DASHBOARD TAB)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Top KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 block">Pemeriksaan Terisi</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {answeredDaily}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ {totalDaily} butir</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium block mt-1">
                Tanggal: {selectedDate}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 block">Kontrol OK</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {okDaily}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Lulus verifikasi</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Bukti objektif tersedia</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 block">Perlu Tindak Lanjut</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                  {ncDaily}
                </span>
                <span className="text-xs text-slate-400 font-semibold">NC Hari Ini</span>
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium block mt-1">
                {ncDaily > 0 ? 'Wajib segera dicatat tindakannya' : 'Kondisi stabil & terkendali'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 block">Temuan CAPA Terbuka</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {openCapa}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Tiket aktif</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Rata-rata Skor ISO: <b>{avgGapScore}</b>/5</span>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Checklist Harian Good Laboratory Practice (GLP)
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                Pastikan seluruh 40 parameter kesiapan personel, instrumen, reagen, dan data dicek sebelum uji laboratorium dimulai.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('daily')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shrink-0"
            >
              <span>Buka Checklist Harian &rarr;</span>
            </button>
          </div>

          {/* Open CAPA Priority Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prioritas Tindak Lanjut &amp; CAPA Terbuka
                </h3>
                <p className="text-xs text-slate-400">Temuan non-conformance yang sedang dalam proses investigasi atau perbaikan</p>
              </div>
              <button
                onClick={() => setActiveTab('capa')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            {qcqa.actions.filter((a) => a.status !== 'Closed').length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
                Tidak ada temuan non-conformance terbuka. Seluruh kendali mutu berjalan dengan baik.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">ID / Tanggal</th>
                      <th className="py-2.5 px-3">Sumber / Area</th>
                      <th className="py-2.5 px-3">Deskripsi Temuan</th>
                      <th className="py-2.5 px-3">PIC / Target</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {qcqa.actions
                      .filter((a) => a.status !== 'Closed')
                      .slice(0, 5)
                      .map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            {act.id}
                            <span className="block text-[10px] text-slate-400 font-sans font-normal">{act.date}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{act.source}</span>
                            <span className="block text-[10px] text-slate-400">{act.area}</span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300">
                            <b>{act.description}</b>
                            {act.immediate && <span className="block text-[10px] text-slate-400 truncate">Segera: {act.immediate}</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{act.owner || '-'}</span>
                            <span className="block text-[10px] text-slate-400">{act.target}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              act.status === 'Open'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Monitoring Rhythm Guide */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Ritme Pengawasan Standar PT Nusa Veritas Inspektama
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <b className="text-emerald-700 dark:text-emerald-400 block mb-1">1. Harian (Daily GLP)</b>
                <p className="text-[11px] text-slate-500">Checklist 40 parameter lingkungan, kesiapan instrumen, reagen, dan eskalasi deviasi kritis.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <b className="text-blue-700 dark:text-blue-400 block mb-1">2. Mingguan (Weekly QC)</b>
                <p className="text-[11px] text-slate-500">Evaluasi grafik kendali mutu (Control Chart), penyelesaian backlog, status kalibrasi, dan stok CRM.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <b className="text-purple-700 dark:text-purple-400 block mb-1">3. Bulanan (Monthly QA)</b>
                <p className="text-[11px] text-slate-500">Tinjauan KPI laboratorium, asesmen gap ISO 17025, efektivitas CAPA, dan kesiapan audit KAN.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHECKLIST HARIAN GLP (40 BUTIR)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Tanggal Pemeriksaan:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {selectedDate === today() && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Hari Ini
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {answeredDaily > 0 && (
                <button
                  type="button"
                  onClick={handleResetDailyDate}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition"
                  title="Reset semua pilihan checklist pada tanggal ini"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Hari Ini ({answeredDaily})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => exportDailyCsv(selectedDate, currentDailyChecks)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddCapa}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Catat Temuan</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchDaily}
                onChange={(e) => setSearchDaily(e.target.value)}
                placeholder="Cari butir checklist, bukti objektif..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-500">Area:</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {QCQA_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {selectedArea !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => handleResetDailyArea(selectedArea)}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition"
                  title={`Reset semua pilihan di area ${selectedArea} pada tanggal ${selectedDate}`}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Pilihan Area Ini</span>
                </button>
              )}
            </div>

            {(searchDaily || selectedArea !== 'Semua') && (
              <button
                type="button"
                onClick={handleResetDailyFilters}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                title="Kembalikan pencarian dan filter ke Semua"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filter</span>
              </button>
            )}

            <div className="text-[11px] text-slate-500 ml-auto">
              <b>{answeredDaily}</b> dari {totalDaily} butir terisi &bull;{' '}
              <b className="text-emerald-600">{okDaily} OK</b> &bull;{' '}
              <b className="text-rose-600">{ncDaily} NC</b> &bull;{' '}
              <b className="text-slate-400">{naDaily} NA</b>
            </div>
          </div>

          {/* Questions Grouped List */}
          <div className="space-y-3">
            {filteredDailyList.map((item) => {
              const rec = currentDailyChecks[item.id] || {};
              const st = rec.status;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                        #{item.id}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                          {item.area}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {item.q}
                        </h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Bukti Objektif: <b>{item.e}</b>
                        </span>
                      </div>
                    </div>

                    {/* OK / NC / NA Status Selector & Reset Button */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetDailyStatus(item.id, 'OK')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          st === 'OK'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title={st === 'OK' ? 'Klik lagi untuk batalkan pilihan OK' : 'Tandai OK'}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDailyStatus(item.id, 'NC')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          st === 'NC'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title={st === 'NC' ? 'Klik lagi untuk batalkan pilihan NC' : 'Tandai NC'}
                      >
                        NC
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDailyStatus(item.id, 'NA')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          st === 'NA'
                            ? 'bg-slate-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title={st === 'NA' ? 'Klik lagi untuk batalkan pilihan NA' : 'Tandai NA'}
                      >
                        NA
                      </button>
                      {st && (
                        <button
                          type="button"
                          onClick={() => handleResetDailyItem(item.id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition"
                          title="Reset / batalkan pilihan butir ini (kosongkan status)"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span className="hidden sm:inline">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Finding Form for NC status */}
                  {st === 'NC' && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Rincian Temuan Ketidaksesuaian (NC)
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(rec.finding || rec.action || rec.owner || rec.target || rec.verification) && (
                            <button
                              type="button"
                              onClick={() => handleClearDailyNcDetails(item.id)}
                              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-300 transition"
                              title="Kosongkan teks isian temuan NC ini"
                            >
                              <RotateCcw className="h-2.5 w-2.5" />
                              <span>Kosongkan Isian</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePromoteToCapa(item.id)}
                            className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 shadow-2xs transition"
                            title="Eskalasikan ke tiket CAPA resmi"
                          >
                            <Plus className="h-3 w-3" />
                            <span>+ Buat Tiket CAPA</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Deskripsi Temuan / Deviasi:</label>
                          <textarea
                            rows={2}
                            value={rec.finding || ''}
                            onChange={(e) => handleUpdateDailyDetails(item.id, 'finding', e.target.value)}
                            placeholder="Jelaskan parameter yang tidak sesuai..."
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Tindakan Segera (Containment):</label>
                          <textarea
                            rows={2}
                            value={rec.action || ''}
                            onChange={(e) => handleUpdateDailyDetails(item.id, 'action', e.target.value)}
                            placeholder="Tindakan penahanan / perbaikan cepat..."
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">PIC Penanggung Jawab:</label>
                          <input
                            type="text"
                            value={rec.owner || ''}
                            onChange={(e) => handleUpdateDailyDetails(item.id, 'owner', e.target.value)}
                            placeholder="Nama analis / staf..."
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Target Tanggal Selesai:</label>
                          <input
                            type="date"
                            value={rec.target || ''}
                            onChange={(e) => handleUpdateDailyDetails(item.id, 'target', e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Bukti Verifikasi / Penyelesaian:</label>
                          <input
                            type="text"
                            value={rec.verification || ''}
                            onChange={(e) => handleUpdateDailyDetails(item.id, 'verification', e.target.value)}
                            placeholder="Nomor log / revisi SOP..."
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TINDAK LANJUT & CAPA (ACTION TRACKER TAB)                             */}
      {/* ========================================================================= */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Temuan, Investigasi Akar Masalah &amp; CAPA
              </h3>
              <p className="text-xs text-slate-500">
                Corrective Action &amp; Preventive Action untuk perbaikan berkelanjutan laboratorium
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportActionsCsv(qcqa.actions)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh CSV CAPA</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddCapa}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Tambah Tiket CAPA</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchCapa}
                onChange={(e) => setSearchCapa(e.target.value)}
                placeholder="Cari ID tiket, temuan, PIC, area..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-500">Status:</label>
              <select
                value={statusFilterCapa}
                onChange={(e) => setStatusFilterCapa(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Semua">Semua Status</option>
                {CAPA_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {(searchCapa || statusFilterCapa !== 'Semua') && (
              <button
                type="button"
                onClick={handleResetCapaFilters}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                title="Kembalikan pencarian dan status ke Semua"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filter</span>
              </button>
            )}

            <div className="text-[11px] text-slate-500 ml-auto">
              Total <b>{qcqa.actions.length}</b> tiket &bull;{' '}
              <b className="text-amber-600">{openCapa} Aktif</b>
            </div>
          </div>

          {/* CAPA Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3.5">ID / Tanggal</th>
                  <th className="py-3 px-3.5">Sumber / Area</th>
                  <th className="py-3 px-3.5">Deskripsi &amp; Investigasi Akar Masalah (RCA)</th>
                  <th className="py-3 px-3.5">Tindakan Korektif</th>
                  <th className="py-3 px-3.5">PIC / Target</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCapaList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ada catatan temuan atau tiket CAPA yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredCapaList.map((action) => (
                    <tr key={action.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {action.id}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">{action.date}</span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{action.source}</span>
                        <span className="block text-[10px] text-slate-400">{action.area}</span>
                      </td>
                      <td className="py-3 px-3.5 max-w-sm">
                        <b className="text-slate-900 dark:text-white block">{action.description}</b>
                        {action.risk && <span className="block text-[10px] text-rose-600 dark:text-rose-400">Risiko: {action.risk}</span>}
                        {action.immediate && <span className="block text-[10px] text-slate-500">Tindakan segera: {action.immediate}</span>}
                        {action.cause && <span className="block text-[10px] text-indigo-600 dark:text-indigo-400">Akar masalah (RCA): {action.cause}</span>}
                      </td>
                      <td className="py-3 px-3.5 max-w-xs">
                        <span className="text-slate-700 dark:text-slate-300 block">{action.corrective || '-'}</span>
                        {action.verification && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            Verifikasi: {action.verification}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">{action.owner || '-'}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{action.target || '-'}</span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={action.status}
                          onChange={(e) =>
                            handleChangeCapaStatus(
                              action.id,
                              e.target.value as 'Open' | 'In progress' | 'Closed'
                            )
                          }
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                            action.status === 'Open'
                              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300'
                              : action.status === 'In progress'
                              ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In progress">In progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCapa(action)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                            title="Edit rincian CAPA"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCapa(action.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                            title="Hapus tiket CAPA"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GAP ASSESSMENT ISO/IEC 17025 (29 KLAUSUL)                             */}
      {/* ========================================================================= */}
      {activeTab === 'iso_gap' && (
        <div className="space-y-4">
          {/* Controls Bar & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-semibold block">Klausul Dinilai</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {gapScores.length} / {ISO_GAP_QUESTIONS.length}
              </span>
              <span className="text-[10px] text-slate-400 block">Klausul master terisi</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-semibold block">Rata-Rata Skor</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {avgGapScore} / 5.0
              </span>
              <span className="text-[10px] text-slate-400 block">Tingkat kematangan</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-semibold block">Prioritas Perbaikan</span>
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {lowScoreGapCount}
              </span>
              <span className="text-[10px] text-rose-600 block">Klausul skor 0 &ndash; 2</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold block">Aksi Data Asesmen</span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => exportGapCsv(qcqa.gaps)}
                  className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-50 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh CSV GAP</span>
                </button>
                {gapScores.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAllGaps}
                    className="flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition"
                    title="Kosongkan seluruh skor & evaluasi klausul ISO 17025"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Semua GAP ({gapScores.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchGap}
                onChange={(e) => setSearchGap(e.target.value)}
                placeholder="Cari klausul (§4.1, §7.7, audit, data...)"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-500">Area:</label>
              <select
                value={selectedGapArea}
                onChange={(e) => setSelectedGapArea(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {gapAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {selectedGapArea !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => handleResetGapArea(selectedGapArea)}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition"
                  title={`Reset semua evaluasi klausul di area ${selectedGapArea}`}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Pilihan Area Ini</span>
                </button>
              )}
            </div>

            {(searchGap || selectedGapArea !== 'Semua') && (
              <button
                type="button"
                onClick={handleResetGapFilters}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                title="Kembalikan pencarian dan area ke Semua"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* GAP Items List */}
          <div className="space-y-3">
            {filteredGapList.map((q) => {
              const x = qcqa.gaps[q.id] || {};
              const curScore = x.score;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-mono font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                        §{q.cl}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {q.area}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {q.q}
                        </h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Bukti Pemenuhan KAN: <b>{q.e}</b>
                        </span>
                      </div>
                    </div>

                    {/* Score Selector (0 - 5 / NA) & Reset Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Skor:</span>
                      <select
                        value={curScore !== undefined ? String(curScore) : ''}
                        onChange={(e) => handleUpdateGap(q.id, 'score', e.target.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition ${
                          curScore === 5 || curScore === 4
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : curScore === 3
                            ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : curScore === 2 || curScore === 1 || curScore === 0
                            ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="">Pilih Skor</option>
                        <option value="0">0 - Belum Diterapkan</option>
                        <option value="1">1 - Ad-hoc / Belum Baku</option>
                        <option value="2">2 - Sebagian Terdokumentasi</option>
                        <option value="3">3 - Diterapkan Konsisten</option>
                        <option value="4">4 - Efektif &amp; Terekam</option>
                        <option value="5">5 - Peningkatan Berkelanjutan</option>
                        <option value="NA">NA - Tidak Berlaku</option>
                      </select>

                      {(curScore !== undefined || x.gap || x.action || x.owner || x.target) && (
                        <button
                          type="button"
                          onClick={() => handleResetGapItem(q.id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition"
                          title="Reset pilihan skor & isian butir klausul ini"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span className="hidden sm:inline">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* GAP Action Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <input
                        type="text"
                        value={x.gap || ''}
                        onChange={(e) => handleUpdateGap(q.id, 'gap', e.target.value)}
                        placeholder="Gap / Risiko klausul..."
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={x.action || ''}
                        onChange={(e) => handleUpdateGap(q.id, 'action', e.target.value)}
                        placeholder="Rencana tindakan perbaikan..."
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={x.owner || ''}
                        onChange={(e) => handleUpdateGap(q.id, 'owner', e.target.value)}
                        placeholder="PIC / Penanggung jawab..."
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={x.target || ''}
                        onChange={(e) => handleUpdateGap(q.id, 'target', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PANDUAN KEPATUHAN & STANDAR ISO/IEC 17025                             */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-4 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Petunjuk Kategori Status Checklist Harian</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
                <b className="text-emerald-800 dark:text-emerald-300 text-sm block mb-1">Status OK</b>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Kontrol mutu berjalan normal, spesifikasi terpenuhi, bukti objektif (rekaman kalibrasi, QC blank/duplikat, log suhu) tersedia dan valid.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/30">
                <b className="text-rose-800 dark:text-rose-300 text-sm block mb-1">Status NC (Non-Conformance)</b>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Terjadi penyimpangan kontrol mutu, outlier, alat overdue, reagen kedaluwarsa, atau sampel rusak. Wajib isi rincian dan eskalasi ke CAPA.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                <b className="text-slate-800 dark:text-slate-200 text-sm block mb-1">Status NA (Not Applicable)</b>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Kegiatan atau instrumen terkait tidak dijalankan pada hari tersebut (misal tidak ada sampling lapangan atau metode modifikasi).
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
              <span>Skala Penilaian GAP Kematangan ISO/IEC 17025</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-rose-600 w-16 shrink-0">Skor 0</span>
                <span><b>Belum ada implementasi</b>: Persyaratan standar sama sekali belum dipenuhi atau belum disadari.</span>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-rose-600 w-16 shrink-0">Skor 1</span>
                <span><b>Ad-hoc / Sporadis</b>: Dijalankan sesekali tetapi belum memiliki prosedur baku atau rekaman formal.</span>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-amber-600 w-16 shrink-0">Skor 2</span>
                <span><b>Sebagian terdokumentasi</b>: SOP telah disusun tetapi pelaksanaannya belum konsisten di semua pengujian.</span>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-blue-600 w-16 shrink-0">Skor 3</span>
                <span><b>Diterapkan konsisten</b>: Prosedur terdokumentasi dan dijalankan secara teratur oleh personel yang diotorisasi.</span>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-emerald-600 w-16 shrink-0">Skor 4</span>
                <span><b>Efektif &amp; terekam</b>: Didukung data audit trail yang tertelusur, kontrol berkala, dan evaluasi kepuasan.</span>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-mono font-bold text-emerald-600 w-16 shrink-0">Skor 5</span>
                <span><b>Peningkatan berkelanjutan</b>: Menjadi budaya mutu dengan tinjauan risiko proaktif dan benchmarking berkala.</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <b className="text-sm font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Kriteria Eskalasi Segera (Immediate Containment)
            </b>
            <p className="leading-relaxed">
              Segera tahan pengujian dan beri notifikasi kepada Manajer Laboratorium jika terjadi: QC blank / duplikat gagal melampaui 3SD, sampel tertukar atau kontaminasi silang, instrumen utama error tanpa kalibrasi ulang, atau laporan analitik diterbitkan tanpa otorisasi penandatangan resmi.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FORM TIKET CAPA / TEMUAN                                           */}
      {/* ========================================================================= */}
      {isCapaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingCapa ? `Edit Tiket CAPA ${editingCapa.id}` : 'Catat Temuan / Tiket CAPA Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Formulir investigasi ketidaksesuaian &amp; tindakan perbaikan ISO 17025
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCapaModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCapa} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Temuan *</label>
                  <input
                    type="date"
                    required
                    value={capaForm.date}
                    onChange={(e) => setCapaForm({ ...capaForm, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Sumber Temuan</label>
                  <select
                    value={capaForm.source}
                    onChange={(e) => setCapaForm({ ...capaForm, source: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {CAPA_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Area / Klausul</label>
                  <input
                    type="text"
                    value={capaForm.area}
                    onChange={(e) => setCapaForm({ ...capaForm, area: e.target.value })}
                    placeholder="Contoh: Peralatan, §7.7 QC Hasil"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">PIC Penanggung Jawab *</label>
                  <input
                    type="text"
                    required
                    value={capaForm.owner}
                    onChange={(e) => setCapaForm({ ...capaForm, owner: e.target.value })}
                    placeholder="Nama analis / staf..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Deskripsi Temuan / Ketidaksesuaian *</label>
                <textarea
                  rows={2}
                  required
                  value={capaForm.description}
                  onChange={(e) => setCapaForm({ ...capaForm, description: e.target.value })}
                  placeholder="Uraikan temuan objektif secara spesifik..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Dampak &amp; Risiko</label>
                  <textarea
                    rows={2}
                    value={capaForm.risk}
                    onChange={(e) => setCapaForm({ ...capaForm, risk: e.target.value })}
                    placeholder="Risiko terhadap validitas hasil uji..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tindakan Segera (Containment)</label>
                  <textarea
                    rows={2}
                    value={capaForm.immediate}
                    onChange={(e) => setCapaForm({ ...capaForm, immediate: e.target.value })}
                    placeholder="Tahan sampel, hentikan alat, dll..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Akar Masalah (Root Cause Analysis)</label>
                  <textarea
                    rows={2}
                    value={capaForm.cause}
                    onChange={(e) => setCapaForm({ ...capaForm, cause: e.target.value })}
                    placeholder="Mengapa hal ini terjadi (metode/man/material/mesin)..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tindakan Korektif Jangka Panjang</label>
                  <textarea
                    rows={2}
                    value={capaForm.corrective}
                    onChange={(e) => setCapaForm({ ...capaForm, corrective: e.target.value })}
                    placeholder="Langkah mencegah keterulangan..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Target Tanggal Selesai</label>
                  <input
                    type="date"
                    value={capaForm.target}
                    onChange={(e) => setCapaForm({ ...capaForm, target: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status Tiket</label>
                  <select
                    value={capaForm.status}
                    onChange={(e) =>
                      setCapaForm({
                        ...capaForm,
                        status: e.target.value as 'Open' | 'In progress' | 'Closed',
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In progress">In progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Bukti Verifikasi Efektivitas</label>
                <textarea
                  rows={2}
                  value={capaForm.verification}
                  onChange={(e) => setCapaForm({ ...capaForm, verification: e.target.value })}
                  placeholder="Hasil uji ulang, log verifikasi, audit tindak lanjut..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetCapaForm}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                  title="Kosongkan seluruh isian formulir"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Form</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCapaModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition active:scale-95"
                  >
                    {editingCapa ? 'Perbarui CAPA' : 'Simpan Tiket CAPA'}
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
export default QcQaView;
