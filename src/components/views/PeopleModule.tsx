import React, { useState } from 'react';
import {
  Award,
  Users,
  Contact,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  Download,
  Upload,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  FileCheck,
} from 'lucide-react';
import { CompetencyRecord, EmployeeRecord, Role } from '../../types';
import { uid, today } from '../../utils/seedData';
import * as XLSX from 'xlsx';

interface PeopleModuleProps {
  competencies: CompetencyRecord[];
  employees: EmployeeRecord[];
  activeSubTab?: 'competency' | 'employees';
  userRole: Role;
  onSaveCompetency: (comp: CompetencyRecord) => void;
  onDeleteCompetency: (id: string) => void;
  onSaveEmployee: (emp: EmployeeRecord) => void;
  onDeleteEmployee: (id: string) => void;
  onOpenExcelImport: (moduleKey: 'competency' | 'employees') => void;
}

export const PeopleModule: React.FC<PeopleModuleProps> = ({
  competencies,
  employees,
  activeSubTab = 'competency',
  userRole,
  onSaveCompetency,
  onDeleteCompetency,
  onSaveEmployee,
  onDeleteEmployee,
  onOpenExcelImport,
}) => {
  const [subTab, setSubTab] = useState<'competency' | 'employees'>(activeSubTab);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Competency form
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compForm, setCompForm] = useState<Partial<CompetencyRecord>>({
    employeeName: '',
    nipOrId: '',
    role: 'Analis Spektroskopi',
    department: 'Laboratorium Kimia Anorganik',
    education: 'S1 Kimia',
    methodsAuthorized: [],
    instrumentsAuthorized: [],
    k3Certified: true,
    bnspCertified: false,
    lastEvaluated: today(),
    nextEvaluation: today(),
    status: 'Terkualifikasi Penuh',
    notes: '',
  });

  const [methodsText, setMethodsText] = useState('');
  const [instrumentsText, setInstrumentsText] = useState('');

  // Employee form
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empForm, setEmpForm] = useState<Partial<EmployeeRecord>>({
    name: '',
    nip: `NV-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`,
    email: '',
    phone: '',
    department: 'Laboratorium',
    position: 'Analis Pengujian',
    joinDate: today(),
    status: 'Aktif',
    emergencyContact: '',
    notes: '',
  });

  const isAdmin = userRole === 'admin';

  // Statistics
  const totalQualified = competencies.filter((c) => c.status === 'Terkualifikasi Penuh').length;
  const inTraining = competencies.filter((c) => c.status === 'Dalam Pengawasan (Trainee)').length;
  const k3Count = competencies.filter((c) => c.k3Certified).length;
  const bnspCount = competencies.filter((c) => c.bnspCertified).length;

  // Filtered lists
  const filteredCompetencies = competencies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.employeeName.toLowerCase().includes(q) ||
      c.nipOrId.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.methodsAuthorized.some((m) => m.toLowerCase().includes(q)) ||
      c.instrumentsAuthorized.some((i) => i.toLowerCase().includes(q));

    const matchDept = filterDept === 'Semua' || c.department.includes(filterDept);
    const matchStatus = filterStatus === 'Semua' || c.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.name.toLowerCase().includes(q) ||
      e.nip.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q);

    const matchDept = filterDept === 'Semua' || e.department.includes(filterDept);
    const matchStatus = filterStatus === 'Semua' || e.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  // Export current table to Excel
  const handleExportTable = () => {
    if (subTab === 'competency') {
      const data = competencies.map((c, idx) => ({
        No: idx + 1,
        'Nama Analis / Personel': c.employeeName,
        'NIP / ID': c.nipOrId,
        'Jabatan / Peran': c.role,
        Departemen: c.department,
        Pendidikan: c.education,
        'Metode Uji Diotorisasi (SNI/ASTM/APHA)': c.methodsAuthorized.join('; '),
        'Instrumen Diotorisasi': c.instrumentsAuthorized.join('; '),
        'Sertifikasi K3 Kimia': c.k3Certified ? 'YA' : 'TIDAK',
        'Sertifikasi Kompetensi BNSP': c.bnspCertified ? 'YA' : 'TIDAK',
        'Evaluasi Terakhir': c.lastEvaluated,
        'Jadwal Evaluasi Berikutnya': c.nextEvaluation,
        'Status Kualifikasi (ISO 17025)': c.status,
        Catatan: c.notes || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Matriks Kompetensi 6.2');
      XLSX.writeFile(wb, `Matriks_Kompetensi_ISO17025_${today()}.xlsx`);
    } else {
      const data = employees.map((e, idx) => ({
        No: idx + 1,
        'Nama Lengkap': e.name,
        NIP: e.nip,
        Email: e.email,
        'No. Telepon / WA': e.phone,
        Departemen: e.department,
        Jabatan: e.position,
        'Tanggal Bergabung': e.joinDate,
        Status: e.status,
        'Kontak Darurat': e.emergencyContact || '',
        Catatan: e.notes || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Direktori Karyawan');
      XLSX.writeFile(wb, `Direktori_Karyawan_Veritas_${today()}.xlsx`);
    }
  };

  const handleOpenEditComp = (c: CompetencyRecord) => {
    setCompForm({ ...c });
    setMethodsText(c.methodsAuthorized.join('\n'));
    setInstrumentsText(c.instrumentsAuthorized.join('\n'));
    setIsCompModalOpen(true);
  };

  const handleSaveComp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.employeeName) {
      alert('Mohon isi nama analis/personel.');
      return;
    }
    const methods = methodsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const instruments = instrumentsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const record: CompetencyRecord = {
      id: compForm.id || uid(),
      employeeName: compForm.employeeName,
      nipOrId: compForm.nipOrId || `NV-${today().replace(/-/g, '')}`,
      role: compForm.role || 'Analis Lab',
      department: compForm.department || 'Laboratorium',
      education: compForm.education || 'S1 Kimia',
      methodsAuthorized: methods.length > 0 ? methods : ['SNI 6989.59:2008 Logam Terlarut'],
      instrumentsAuthorized: instruments.length > 0 ? instruments : ['ICP-OES Avio 500'],
      k3Certified: Boolean(compForm.k3Certified),
      bnspCertified: Boolean(compForm.bnspCertified),
      lastEvaluated: compForm.lastEvaluated || today(),
      nextEvaluation: compForm.nextEvaluation || today(),
      status: compForm.status as any,
      notes: compForm.notes || '',
    };
    onSaveCompetency(record);
    setIsCompModalOpen(false);
  };

  const handleSaveEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.nip) {
      alert('Mohon isi nama dan NIP karyawan.');
      return;
    }
    const record: EmployeeRecord = {
      id: empForm.id || uid(),
      name: empForm.name,
      nip: empForm.nip,
      email: empForm.email || '',
      phone: empForm.phone || '',
      department: empForm.department || 'Laboratorium',
      position: empForm.position || 'Staf',
      joinDate: empForm.joinDate || today(),
      status: empForm.status as any,
      emergencyContact: empForm.emergencyContact || '',
      notes: empForm.notes || '',
    };
    onSaveEmployee(record);
    setIsEmpModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
              KELOMPOK 8
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <span>People, Manpower &amp; Kompetensi ISO/IEC 17025</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pemenuhan klausul 6.2 ISO/IEC 17025 (Personel): kualifikasi analis, otorisasi alat &amp; metode uji, sertifikasi K3/BNSP, evaluasi berkala, dan direktori tim.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenExcelImport(subTab === 'competency' ? 'competency' : 'employees')}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 transition shadow-2xs"
            title="Sinkronisasi data melalui impor file Excel (.xlsx / .csv)"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-600" />
            <span>Impor Excel</span>
          </button>

          <button
            onClick={handleExportTable}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-2xs"
            title="Unduh data tabel ke file Excel"
          >
            <Download className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Ekspor Excel</span>
          </button>

          {subTab === 'competency' ? (
            <button
              onClick={() => {
                setCompForm({
                  employeeName: '',
                  nipOrId: `NV-${new Date().getFullYear()}-${String(competencies.length + 1).padStart(3, '0')}`,
                  role: 'Analis Spektroskopi ICP-OES',
                  department: 'Laboratorium Kimia Anorganik',
                  education: 'S1 Kimia',
                  methodsAuthorized: ['SNI 6989.59:2008 Logam Terlarut'],
                  instrumentsAuthorized: ['ICP-OES Avio 500'],
                  k3Certified: true,
                  bnspCertified: false,
                  lastEvaluated: today(),
                  nextEvaluation: today(),
                  status: 'Terkualifikasi Penuh',
                  notes: '',
                });
                setMethodsText('SNI 6989.59:2008 Logam Terlarut\nAPHA 3120 B ICP-OES');
                setInstrumentsText('ICP-OES Avio 500\nAAS PinAAcle 900T');
                setIsCompModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Kualifikasi Analis</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEmpForm({
                  name: '',
                  nip: `NV-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`,
                  email: '',
                  phone: '',
                  department: 'Laboratorium',
                  position: 'Analis Pengujian',
                  joinDate: today(),
                  status: 'Aktif',
                  emergencyContact: '',
                  notes: '',
                });
                setIsEmpModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Karyawan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setSubTab('competency');
            setFilterDept('Semua');
            setFilterStatus('Semua');
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            subTab === 'competency'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Matriks Kompetensi Analis (ISO 17025:2017 Klausul 6.2)</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {competencies.length}
          </span>
        </button>

        <button
          onClick={() => {
            setSubTab('employees');
            setFilterDept('Semua');
            setFilterStatus('Semua');
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            subTab === 'employees'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Contact className="h-4 w-4" />
          <span>Direktori Staf &amp; Personel Organisasi</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {employees.length}
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-medium text-slate-400">Total Personel Terdata</span>
          <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{employees.length} Orang</div>
          <span className="text-[10px] text-slate-500">Staf lab, komersial &amp; QA</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Terkualifikasi Penuh</span>
          <div className="mt-1 text-lg font-black text-emerald-800 dark:text-emerald-300">{totalQualified} Analis</div>
          <span className="text-[10px] text-emerald-600">Otorisasi mandiri pengujian</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Dalam Pengawasan (Trainee)</span>
          <div className="mt-1 text-lg font-black text-amber-800 dark:text-amber-300">{inTraining} Orang</div>
          <span className="text-[10px] text-amber-600">Program verifikasi metode</span>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 shadow-2xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">Sertifikasi</span>
          <div className="mt-1 text-lg font-black text-indigo-800 dark:text-indigo-300">
            {k3Count + bnspCount} Personel
          </div>
          <span className="text-[10px] text-indigo-600">K3 &amp; BNSP Terkualifikasi</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              subTab === 'competency'
                ? 'Cari nama analis, NIP, metode uji (SNI/ASTM), instrumen...'
                : 'Cari nama karyawan, NIP, email, jabatan, departemen...'
            }
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Departemen:</label>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Departemen</option>
            <option value="Laboratorium">Laboratorium (Anorganik/Organik/Preparasi)</option>
            <option value="Mutu">Sistem Manajemen Mutu &amp; QA/QC</option>
            <option value="Komersial">Komersial &amp; CRM</option>
            <option value="Keuangan">Keuangan &amp; Penagihan</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Status</option>
            {subTab === 'competency' ? (
              <>
                <option value="Terkualifikasi Penuh">Terkualifikasi Penuh</option>
                <option value="Dalam Pengawasan (Trainee)">Dalam Pengawasan (Trainee)</option>
                <option value="Perlu Re-Evaluasi">Perlu Re-Evaluasi</option>
              </>
            ) : (
              <>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Resigned">Resigned</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Table: Matriks Kompetensi Analis */}
      {subTab === 'competency' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3.5">Nama Personel &amp; NIP</th>
                <th className="py-3 px-3.5">Peran / Jabatan Lab</th>
                <th className="py-3 px-3.5">Pendidikan</th>
                <th className="py-3 px-3.5">Otorisasi Alat &amp; Metode Uji</th>
                <th className="py-3 px-3.5 text-center">Sertifikasi</th>
                <th className="py-3 px-3.5 text-center">Jadwal Evaluasi</th>
                <th className="py-3 px-3.5 text-center">Status Klausul 6.2</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCompetencies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada catatan kompetensi personel yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredCompetencies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.nipOrId}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{c.role}</div>
                      <div className="text-[10px] text-slate-400">{c.department}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      {c.education}
                    </td>
                    <td className="py-3 px-3.5 max-w-sm">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {c.instrumentsAuthorized.map((inst, i) => (
                            <span
                              key={i}
                              className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9.5px] font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            >
                              {inst}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.methodsAuthorized.map((m, i) => (
                            <span
                              key={i}
                              className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="inline-flex flex-col gap-1 items-center">
                        {c.k3Certified && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            K3 Kimia
                          </span>
                        )}
                        {c.bnspCertified && (
                          <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            BNSP
                          </span>
                        )}
                        {!c.k3Certified && !c.bnspCertified && (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-[10px] whitespace-nowrap">
                      <div>Terakhir: {c.lastEvaluated}</div>
                      <div className="text-slate-400">Next: {c.nextEvaluation}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.status === 'Terkualifikasi Penuh'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'Dalam Pengawasan (Trainee)'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditComp(c)}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                          title="Edit Kompetensi"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data kompetensi ${c.employeeName}?`)) {
                                onDeleteCompetency(c.id);
                              }
                            }}
                            className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                            title="Hapus Kompetensi (Khusus Admin)"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Table: Direktori Staf & Karyawan */}
      {subTab === 'employees' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3.5">Nama &amp; NIP</th>
                <th className="py-3 px-3.5">Departemen</th>
                <th className="py-3 px-3.5">Jabatan / Posisi</th>
                <th className="py-3 px-3.5">Kontak (Email &amp; Telepon)</th>
                <th className="py-3 px-3.5 text-center">Tanggal Masuk</th>
                <th className="py-3 px-3.5">Kontak Darurat</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data karyawan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{e.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{e.nip}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                      {e.department}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {e.position}
                    </td>
                    <td className="py-3 px-3.5 text-[11px]">
                      <div className="text-slate-700 dark:text-slate-300">{e.email || '-'}</div>
                      <div className="text-slate-500 font-mono text-[10px]">{e.phone || '-'}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-[11px] whitespace-nowrap">
                      {e.joinDate}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      {e.emergencyContact || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          e.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEmpForm({ ...e });
                            setIsEmpModalOpen(true);
                          }}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                          title="Edit Karyawan"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data karyawan ${e.name}?`)) {
                                onDeleteEmployee(e.id);
                              }
                            }}
                            className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                            title="Hapus Karyawan (Khusus Admin)"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Competency Form Modal */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              <span>{compForm.id ? 'Edit Kualifikasi Analis (Klausul 6.2)' : 'Tambah Kualifikasi Analis Baru'}</span>
            </h3>

            <form onSubmit={handleSaveComp} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Nama Lengkap Analis</label>
                  <input
                    type="text"
                    required
                    value={compForm.employeeName || ''}
                    onChange={(e) => setCompForm({ ...compForm, employeeName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">NIP / ID Karyawan</label>
                  <input
                    type="text"
                    required
                    value={compForm.nipOrId || ''}
                    onChange={(e) => setCompForm({ ...compForm, nipOrId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Peran / Jabatan Teknis</label>
                  <input
                    type="text"
                    required
                    value={compForm.role || ''}
                    onChange={(e) => setCompForm({ ...compForm, role: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Departemen Lab</label>
                  <input
                    type="text"
                    value={compForm.department || ''}
                    onChange={(e) => setCompForm({ ...compForm, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Pendidikan / Latar Belakang Keahlian</label>
                <input
                  type="text"
                  placeholder="Contoh: S1 Kimia Murni / D3 Analis Kimia"
                  value={compForm.education || ''}
                  onChange={(e) => setCompForm({ ...compForm, education: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Instrumen yang Diotorisasi (Satu per baris)</label>
                <textarea
                  rows={2}
                  value={instrumentsText}
                  onChange={(e) => setInstrumentsText(e.target.value)}
                  placeholder="ICP-OES Avio 500&#10;AAS PinAAcle 900T&#10;GC-MS 8890"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Metode Uji yang Diotorisasi (Satu per baris)</label>
                <textarea
                  rows={3}
                  value={methodsText}
                  onChange={(e) => setMethodsText(e.target.value)}
                  placeholder="SNI 6989.59:2008 Logam Terlarut&#10;APHA 3120 B Spektroskopi Emisi Plasma&#10;ASTM D4052 Densitas"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="k3Check"
                    checked={Boolean(compForm.k3Certified)}
                    onChange={(e) => setCompForm({ ...compForm, k3Certified: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="k3Check" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sertifikasi K3 Kimia / Lab
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="bnspCheck"
                    checked={Boolean(compForm.bnspCertified)}
                    onChange={(e) => setCompForm({ ...compForm, bnspCertified: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="bnspCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sertifikasi Kompetensi BNSP
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold">Evaluasi Terakhir</label>
                  <input
                    type="date"
                    value={compForm.lastEvaluated || ''}
                    onChange={(e) => setCompForm({ ...compForm, lastEvaluated: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Jadwal Evaluasi</label>
                  <input
                    type="date"
                    value={compForm.nextEvaluation || ''}
                    onChange={(e) => setCompForm({ ...compForm, nextEvaluation: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Status ISO 17025</label>
                  <select
                    value={compForm.status}
                    onChange={(e) => setCompForm({ ...compForm, status: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Terkualifikasi Penuh">Terkualifikasi Penuh</option>
                    <option value="Dalam Pengawasan (Trainee)">Dalam Pengawasan (Trainee)</option>
                    <option value="Perlu Re-Evaluasi">Perlu Re-Evaluasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Catatan Kompetensi / Hasil Uji Profisiensi</label>
                <textarea
                  rows={2}
                  value={compForm.notes || ''}
                  onChange={(e) => setCompForm({ ...compForm, notes: e.target.value })}
                  placeholder="Hasil uji banding, sertifikat pelatihan vendor..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCompModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  Simpan Matriks Kompetensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Contact className="h-4 w-4 text-indigo-600" />
              <span>{empForm.id ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</span>
            </h3>

            <form onSubmit={handleSaveEmp} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={empForm.name || ''}
                    onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">NIP Karyawan</label>
                  <input
                    type="text"
                    required
                    value={empForm.nip || ''}
                    onChange={(e) => setEmpForm({ ...empForm, nip: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Departemen</label>
                  <input
                    type="text"
                    required
                    value={empForm.department || ''}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Jabatan / Posisi</label>
                  <input
                    type="text"
                    required
                    value={empForm.position || ''}
                    onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Email Kantor</label>
                  <input
                    type="email"
                    value={empForm.email || ''}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={empForm.phone || ''}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="+62 8..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Tanggal Bergabung</label>
                  <input
                    type="date"
                    value={empForm.joinDate || ''}
                    onChange={(e) => setEmpForm({ ...empForm, joinDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Status Karyawan</label>
                  <select
                    value={empForm.status}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Kontak Darurat (Nama &amp; Hubungan)</label>
                <input
                  type="text"
                  placeholder="+62 8... (Nama & Hubungan)"
                  value={empForm.emergencyContact || ''}
                  onChange={(e) => setEmpForm({ ...empForm, emergencyContact: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={empForm.notes || ''}
                  onChange={(e) => setEmpForm({ ...empForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
