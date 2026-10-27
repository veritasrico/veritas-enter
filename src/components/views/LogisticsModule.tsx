import React, { useState, useRef } from 'react';
import {
  ShoppingCart,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  FileSpreadsheet,
  Download,
  Upload,
  ShieldCheck,
  Thermometer,
  MapPin,
  Building,
  Calendar,
  Camera,
  Image as ImageIcon,
  Eye,
  X,
} from 'lucide-react';
import { ProcurementRecord, SampleDeliveryRecord, Role } from '../../types';
import { idr, uid, today } from '../../utils/seedData';
import * as XLSX from 'xlsx';

interface LogisticsModuleProps {
  procurements: ProcurementRecord[];
  deliveries: SampleDeliveryRecord[];
  activeSubTab?: 'procurement' | 'sample_logistics';
  userRole: Role;
  onSaveProcurement: (po: ProcurementRecord) => void;
  onDeleteProcurement: (id: string) => void;
  onSaveDelivery: (item: SampleDeliveryRecord) => void;
  onDeleteDelivery: (id: string) => void;
  onOpenExcelImport: (moduleKey: 'procurement' | 'deliveries') => void;
}

export const LogisticsModule: React.FC<LogisticsModuleProps> = ({
  procurements,
  deliveries,
  activeSubTab = 'procurement',
  userRole,
  onSaveProcurement,
  onDeleteProcurement,
  onSaveDelivery,
  onDeleteDelivery,
  onOpenExcelImport,
}) => {
  const [subTab, setSubTab] = useState<'procurement' | 'sample_logistics'>(activeSubTab);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // PO Form state
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState<Partial<ProcurementRecord>>({
    poNumber: `PO-${new Date().getFullYear()}-${String(procurements.length + 1).padStart(3, '0')}`,
    itemDescription: '',
    category: 'Reagen & Kimia',
    supplier: '',
    qty: 1,
    unit: 'Botol',
    estCost: 0,
    requestedBy: '',
    reqDate: today(),
    targetDate: today(),
    status: 'Diajukan',
    urgency: 'Biasa',
    notes: '',
  });

  // Delivery Form state
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [proofViewerModal, setProofViewerModal] = useState<{ isOpen: boolean; url: string; trackingNo: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [delForm, setDelForm] = useState<Partial<SampleDeliveryRecord>>({
    trackingNo: `TRK-EXP-${String(Math.floor(1000 + Math.random() * 9000))}`,
    type: 'Sampel Masuk',
    courier: 'JNE Express Cargo',
    origin: '',
    destination: 'Lab B.J. Habibie Gedung 442 (PT Veritas)',
    tempCondition: 'Ambient (20-25°C)',
    receivedDate: today(),
    status: 'Diterima di Lab',
    receiver: '',
    sealIntact: true,
    notes: '',
    proofOfReceiptUrl: '',
    proofFileName: '',
  });

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDelForm((prev) => ({
        ...prev,
        proofOfReceiptUrl: reader.result as string,
        proofFileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = userRole === 'admin';

  // Statistics
  const totalPoSpend = procurements.reduce((sum, p) => sum + (p.estCost || 0), 0);
  const pendingApproval = procurements.filter((p) => p.status === 'Diajukan').length;
  const inTransitOrders = procurements.filter((p) => p.status === 'Dipesan').length;
  const deliveredOrders = procurements.filter((p) => p.status === 'Tiba di Lab').length;

  // Filtered lists
  const filteredProcurements = procurements.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.poNumber.toLowerCase().includes(q) ||
      p.itemDescription.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q) ||
      p.requestedBy.toLowerCase().includes(q);

    const matchCategory = filterCategory === 'Semua' || p.category === filterCategory;
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const filteredDeliveries = deliveries.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.trackingNo.toLowerCase().includes(q) ||
      d.origin.toLowerCase().includes(q) ||
      d.destination.toLowerCase().includes(q) ||
      d.courier.toLowerCase().includes(q) ||
      d.receiver.toLowerCase().includes(q) ||
      (d.notes || '').toLowerCase().includes(q);

    const matchStatus = filterStatus === 'Semua' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Export current table to Excel
  const handleExportTable = () => {
    if (subTab === 'procurement') {
      const data = procurements.map((p, idx) => ({
        No: idx + 1,
        'No. PO': p.poNumber,
        'Deskripsi Item / Reagen': p.itemDescription,
        Kategori: p.category,
        Vendor: p.supplier,
        Jumlah: p.qty,
        Satuan: p.unit,
        'Estimasi Biaya (Rp)': p.estCost,
        Pemohon: p.requestedBy,
        'Tanggal Diajukan': p.reqDate,
        'Target Tiba': p.targetDate,
        Status: p.status,
        Urgensi: p.urgency,
        Catatan: p.notes || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pengadaan & PO');
      XLSX.writeFile(wb, `Pengadaan_PO_Veritas_${today()}.xlsx`);
    } else {
      const data = deliveries.map((d, idx) => ({
        No: idx + 1,
        'No. Resi / Tracking': d.trackingNo,
        Tipe: d.type,
        Ekspedisi: d.courier,
        'Asal Pengiriman': d.origin,
        Tujuan: d.destination,
        'Kondisi Suhu': d.tempCondition,
        'Tanggal Terima': d.receivedDate,
        Penerima: d.receiver,
        'Segel Utuh': d.sealIntact ? 'YA' : 'TIDAK',
        Status: d.status,
        Keterangan: d.notes || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Logistik Sampel');
      XLSX.writeFile(wb, `Logistik_Sampel_Veritas_${today()}.xlsx`);
    }
  };

  const handleSavePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.itemDescription || !poForm.supplier) {
      alert('Mohon isi deskripsi item dan supplier.');
      return;
    }
    const record: ProcurementRecord = {
      id: poForm.id || uid(),
      poNumber: poForm.poNumber || `PO-${today()}`,
      itemDescription: poForm.itemDescription,
      category: poForm.category as any,
      supplier: poForm.supplier,
      qty: Number(poForm.qty) || 1,
      unit: poForm.unit || 'Unit',
      estCost: Number(poForm.estCost) || 0,
      requestedBy: poForm.requestedBy || 'Analis Lab',
      reqDate: poForm.reqDate || today(),
      targetDate: poForm.targetDate || today(),
      status: poForm.status as any,
      urgency: poForm.urgency as any,
      notes: poForm.notes || '',
    };
    onSaveProcurement(record);
    setIsPoModalOpen(false);
  };

  const handleSaveDel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delForm.trackingNo || !delForm.origin) {
      alert('Mohon isi nomor resi dan asal pengiriman.');
      return;
    }
    const record: SampleDeliveryRecord = {
      id: delForm.id || uid(),
      trackingNo: delForm.trackingNo,
      type: delForm.type as any,
      courier: delForm.courier || 'Kurir Ekspedisi',
      origin: delForm.origin,
      destination: delForm.destination || 'Lab PT Veritas',
      tempCondition: delForm.tempCondition as any,
      receivedDate: delForm.receivedDate || today(),
      status: delForm.status as any,
      receiver: delForm.receiver || 'Staf Penerima',
      sealIntact: Boolean(delForm.sealIntact),
      notes: delForm.notes || '',
      proofOfReceiptUrl: delForm.proofOfReceiptUrl || undefined,
      proofFileName: delForm.proofFileName || undefined,
    };
    onSaveDelivery(record);
    setIsDelModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            <span>Logistik &amp; Supply Chain Management</span>
          </h2>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenExcelImport(subTab === 'procurement' ? 'procurement' : 'deliveries')}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-2xs"
            title="Sinkronisasi data melalui impor file Excel (.xlsx / .csv)"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-600" />
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

          {subTab === 'procurement' ? (
            <button
              onClick={() => {
                setPoForm({
                  poNumber: `PO-${new Date().getFullYear()}-${String(procurements.length + 1).padStart(3, '0')}`,
                  itemDescription: '',
                  category: 'Reagen & Kimia',
                  supplier: '',
                  qty: 1,
                  unit: 'Botol',
                  estCost: 0,
                  requestedBy: '',
                  reqDate: today(),
                  targetDate: today(),
                  status: 'Diajukan',
                  urgency: 'Biasa',
                  notes: '',
                });
                setIsPoModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Buat PO Pengadaan</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setDelForm({
                  trackingNo: `TRK-EXP-${String(Math.floor(1000 + Math.random() * 9000))}`,
                  type: 'Sampel Masuk',
                  courier: 'JNE Express Cargo',
                  origin: '',
                  destination: 'Lab B.J. Habibie Gedung 442 (PT Veritas)',
                  tempCondition: 'Ambient (20-25°C)',
                  receivedDate: today(),
                  status: 'Diterima di Lab',
                  receiver: '',
                  sealIntact: true,
                  notes: '',
                });
                setIsDelModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Catat Resi Logistik</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setSubTab('procurement');
            setFilterCategory('Semua');
            setFilterStatus('Semua');
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            subTab === 'procurement'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Pengadaan &amp; Purchase Order (PO)</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {procurements.length}
          </span>
        </button>

        <button
          onClick={() => {
            setSubTab('sample_logistics');
            setFilterCategory('Semua');
            setFilterStatus('Semua');
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            subTab === 'sample_logistics'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Logistik Sampel &amp; Cold Chain</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {deliveries.length}
          </span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {subTab === 'procurement' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-400">Total Komitmen Pengadaan</span>
            <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{idr(totalPoSpend)}</div>
            <span className="text-[10px] text-slate-500">Nilai total PO aktif</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Menunggu Approval</span>
            <div className="mt-1 text-lg font-black text-amber-800 dark:text-amber-300">{pendingApproval} PO</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Perlu persetujuan teknis</span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-2xs dark:border-blue-900/40 dark:bg-blue-950/20">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Dalam Pengiriman</span>
            <div className="mt-1 text-lg font-black text-blue-800 dark:text-blue-300">{inTransitOrders} PO</div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Dipesan ke supplier</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Tiba di Laboratorium</span>
            <div className="mt-1 text-lg font-black text-emerald-800 dark:text-emerald-300">{deliveredOrders} PO</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Barang diterima &amp; terverifikasi</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-400">Total Pengiriman Terdata</span>
            <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{deliveries.length} Resi</div>
            <span className="text-[10px] text-slate-500">Inbound &amp; outbound sampel</span>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 shadow-2xs dark:border-teal-900/40 dark:bg-teal-950/20">
            <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">Rantai Dingin (Cold Chain)</span>
            <div className="mt-1 text-lg font-black text-teal-800 dark:text-teal-300">
              {deliveries.filter((d) => d.tempCondition.includes('Cold') || d.tempCondition.includes('Frozen')).length} Sampel
            </div>
            <span className="text-[10px] text-teal-600">Kontrol suhu 2-8°C / -20°C</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Segel Integritas Utuh</span>
            <div className="mt-1 text-lg font-black text-emerald-800 dark:text-emerald-300">
              {deliveries.filter((d) => d.sealIntact).length} / {deliveries.length}
            </div>
            <span className="text-[10px] text-emerald-600">Sesuai syarat ISO 17025</span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-2xs dark:border-blue-900/40 dark:bg-blue-950/20">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Dalam Perjalanan Kurir</span>
            <div className="mt-1 text-lg font-black text-blue-800 dark:text-blue-300">
              {deliveries.filter((d) => d.status === 'Dalam Perjalanan').length} Resi
            </div>
            <span className="text-[10px] text-blue-600">Menuju lab / retur klien</span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              subTab === 'procurement'
                ? 'Cari No. PO, nama item/reagen, supplier, atau pemohon...'
                : 'Cari no. resi, asal pengirim, kurir, penerima...'
            }
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {subTab === 'procurement' && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Kategori:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Reagen & Kimia">Reagen &amp; Kimia</option>
              <option value="Gas Murni & Kalibrasi">Gas Murni &amp; Kalibrasi</option>
              <option value="Suku Cadang Instrumen">Suku Cadang Instrumen</option>
              <option value="APD & Keselamatan">APD &amp; Keselamatan</option>
              <option value="Glassware & Konsumabel">Glassware &amp; Konsumabel</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Status</option>
            {subTab === 'procurement' ? (
              <>
                <option value="Diajukan">Diajukan</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Dipesan">Dipesan</option>
                <option value="Tiba di Lab">Tiba di Lab</option>
                <option value="Ditolak">Ditolak</option>
              </>
            ) : (
              <>
                <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                <option value="Diterima di Lab">Diterima di Lab</option>
                <option value="Diinspeksi & OK">Diinspeksi &amp; OK</option>
                <option value="Ditolak/Rusak">Ditolak/Rusak</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Table: PO Pengadaan */}
      {subTab === 'procurement' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3.5">No. PO</th>
                <th className="py-3 px-3.5">Deskripsi Item / Reagen</th>
                <th className="py-3 px-3.5">Kategori</th>
                <th className="py-3 px-3.5">Vendor / Supplier</th>
                <th className="py-3 px-3.5 text-center">Qty</th>
                <th className="py-3 px-3.5 text-right">Estimasi Biaya</th>
                <th className="py-3 px-3.5">Pemohon</th>
                <th className="py-3 px-3.5 text-center">Target Tiba</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProcurements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada data pengadaan PO yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredProcurements.map((p) => {
                  const getStatusBadge = (st: string) => {
                    switch (st) {
                      case 'Tiba di Lab':
                        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                      case 'Dipesan':
                        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                      case 'Disetujui':
                        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
                      case 'Diajukan':
                        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                      default:
                        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                    }
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.poNumber}
                        {p.urgency === 'Kritis' && (
                          <span className="ml-1.5 inline-block rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-700">
                            KRITIS
                          </span>
                        )}
                        {p.urgency === 'Mendesak' && (
                          <span className="ml-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                            MENDESAK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-white max-w-xs">
                        <div>{p.itemDescription}</div>
                        {p.notes && <div className="text-[10px] text-slate-400 truncate">{p.notes}</div>}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {p.supplier}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono">
                        {p.qty} {p.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {idr(p.estCost)}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                        {p.requestedBy}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono text-[11px] whitespace-nowrap">
                        {p.targetDate}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setPoForm({ ...p });
                              setIsPoModalOpen(true);
                            }}
                            className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                            title="Edit PO"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus PO ${p.poNumber} (${p.itemDescription})?`)) {
                                  onDeleteProcurement(p.id);
                                }
                              }}
                              className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                              title="Hapus PO (Khusus Admin)"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Table: Logistik Sampel & Cold Chain */}
      {subTab === 'sample_logistics' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3.5">No. Tracking / Resi</th>
                <th className="py-3 px-3.5">Tipe Logistik</th>
                <th className="py-3 px-3.5">Ekspedisi / Kurir</th>
                <th className="py-3 px-3.5">Asal Pengiriman</th>
                <th className="py-3 px-3.5">Kondisi Suhu</th>
                <th className="py-3 px-3.5 text-center">Segel Integritas</th>
                <th className="py-3 px-3.5">Penerima &amp; Tanggal</th>
                <th className="py-3 px-3.5 text-center">Bukti Terima Lab</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada data logistik pengiriman sampel yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {d.trackingNo}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {d.courier}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs text-slate-600 dark:text-slate-400 text-[11px]">
                      <div>{d.origin}</div>
                      <div className="text-[10px] text-slate-400">Tujuan: {d.destination}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          d.tempCondition.includes('Cold')
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : d.tempCondition.includes('Frozen')
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Thermometer className="h-3 w-3" />
                        <span>{d.tempCondition}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {d.sealIntact ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Segel Utuh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <AlertTriangle className="h-3 w-3" /> Rusak / Terbuka
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-[11px] whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div>{d.receiver || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.receivedDate}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {d.proofOfReceiptUrl ? (
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <img
                            src={d.proofOfReceiptUrl}
                            alt="Bukti Terima"
                            onClick={() => setProofViewerModal({ isOpen: true, url: d.proofOfReceiptUrl!, trackingNo: d.trackingNo })}
                            className="h-7 w-7 rounded-md object-cover border border-emerald-300 shadow-2xs cursor-pointer hover:scale-110 transition"
                            title="Klik untuk perbesar foto"
                          />
                          <button
                            type="button"
                            onClick={() => setProofViewerModal({ isOpen: true, url: d.proofOfReceiptUrl!, trackingNo: d.trackingNo })}
                            className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                          >
                            Foto OK
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setDelForm({ ...d });
                            setIsDelModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        >
                          <Camera className="h-2.5 w-2.5" />
                          <span>+ Upload</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setDelForm({ ...d });
                            setIsDelModalOpen(true);
                          }}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                          title="Edit Resi"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus resi ${d.trackingNo}?`)) {
                                onDeleteDelivery(d.id);
                              }
                            }}
                            className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                            title="Hapus Resi (Khusus Admin)"
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

      {/* PO Form Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <span>{poForm.id ? 'Edit Purchase Order' : 'Buat Purchase Order Baru'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Pengadaan reagen kimia, standar kalibrasi, gas UHP, dan suku cadang lab</p>

            <form onSubmit={handleSavePo} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Nomor PO</label>
                  <input
                    type="text"
                    required
                    value={poForm.poNumber || ''}
                    onChange={(e) => setPoForm({ ...poForm, poNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Kategori Item</label>
                  <select
                    value={poForm.category}
                    onChange={(e) => setPoForm({ ...poForm, category: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Reagen & Kimia">Reagen &amp; Kimia</option>
                    <option value="Gas Murni & Kalibrasi">Gas Murni &amp; Kalibrasi</option>
                    <option value="Suku Cadang Instrumen">Suku Cadang Instrumen</option>
                    <option value="APD & Keselamatan">APD &amp; Keselamatan</option>
                    <option value="Glassware & Konsumabel">Glassware &amp; Konsumabel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Deskripsi Item / Spesifikasi Teknis</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Asam Nitrat HNO3 65% TraceMetal Grade Merck (2.5L)"
                  value={poForm.itemDescription || ''}
                  onChange={(e) => setPoForm({ ...poForm, itemDescription: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold">Supplier / Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="PT Merck / Samator..."
                    value={poForm.supplier || ''}
                    onChange={(e) => setPoForm({ ...poForm, supplier: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Jumlah (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    value={poForm.qty || 1}
                    onChange={(e) => setPoForm({ ...poForm, qty: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Satuan</label>
                  <input
                    type="text"
                    value={poForm.unit || 'Botol'}
                    onChange={(e) => setPoForm({ ...poForm, unit: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    value={poForm.estCost || 0}
                    onChange={(e) => setPoForm({ ...poForm, estCost: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Pemohon (PIC Lab)</label>
                  <input
                    type="text"
                    value={poForm.requestedBy || ''}
                    onChange={(e) => setPoForm({ ...poForm, requestedBy: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold">Target Tiba</label>
                  <input
                    type="date"
                    value={poForm.targetDate || ''}
                    onChange={(e) => setPoForm({ ...poForm, targetDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Tingkat Urgensi</label>
                  <select
                    value={poForm.urgency}
                    onChange={(e) => setPoForm({ ...poForm, urgency: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Mendesak">Mendesak</option>
                    <option value="Kritis">Kritis</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Status PO</label>
                  <select
                    value={poForm.status}
                    onChange={(e) => setPoForm({ ...poForm, status: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Diajukan">Diajukan</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Dipesan">Dipesan</option>
                    <option value="Tiba di Lab">Tiba di Lab</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Catatan / Justifikasi Teknis</label>
                <textarea
                  rows={2}
                  value={poForm.notes || ''}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  placeholder="Kebutuhan audit KAN, persiapan uji batch baru, dll."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Simpan Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Form Modal */}
      {isDelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>{delForm.id ? 'Edit Logistik Pengiriman' : 'Catat Resi Logistik Baru'}</span>
            </h3>

            <form onSubmit={handleSaveDel} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">No. Resi / AWB</label>
                  <input
                    type="text"
                    required
                    value={delForm.trackingNo || ''}
                    onChange={(e) => setDelForm({ ...delForm, trackingNo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Tipe Logistik</label>
                  <select
                    value={delForm.type}
                    onChange={(e) => setDelForm({ ...delForm, type: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Sampel Masuk">Sampel Masuk</option>
                    <option value="Sampel Keluar">Sampel Keluar</option>
                    <option value="Reagen Masuk">Reagen Masuk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Ekspedisi / Kurir</label>
                  <input
                    type="text"
                    required
                    value={delForm.courier || ''}
                    onChange={(e) => setDelForm({ ...delForm, courier: e.target.value })}
                    placeholder="JNE / DHL Cold Chain / Internal..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Kondisi Suhu Transportasi</label>
                  <select
                    value={delForm.tempCondition}
                    onChange={(e) => setDelForm({ ...delForm, tempCondition: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Ambient (20-25°C)">Ambient (20-25°C)</option>
                    <option value="Cold Chain (2-8°C)">Cold Chain (2-8°C)</option>
                    <option value="Frozen (-20°C)">Frozen (-20°C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Asal Pengiriman</label>
                  <input
                    type="text"
                    required
                    value={delForm.origin || ''}
                    onChange={(e) => setDelForm({ ...delForm, origin: e.target.value })}
                    placeholder="Site Tambang / Klien / Pabrik..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Tujuan Pengiriman</label>
                  <input
                    type="text"
                    required
                    value={delForm.destination || ''}
                    onChange={(e) => setDelForm({ ...delForm, destination: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold">Tanggal Diterima</label>
                  <input
                    type="date"
                    value={delForm.receivedDate || ''}
                    onChange={(e) => setDelForm({ ...delForm, receivedDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Penerima di Lab</label>
                  <input
                    type="text"
                    value={delForm.receiver || ''}
                    onChange={(e) => setDelForm({ ...delForm, receiver: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Status Pengiriman</label>
                  <select
                    value={delForm.status}
                    onChange={(e) => setDelForm({ ...delForm, status: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                    <option value="Diterima di Lab">Diterima di Lab</option>
                    <option value="Diinspeksi & OK">Diinspeksi &amp; OK</option>
                    <option value="Ditolak/Rusak">Ditolak/Rusak</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sealCheck"
                  checked={Boolean(delForm.sealIntact)}
                  onChange={(e) => setDelForm({ ...delForm, sealIntact: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="sealCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Segel Integritas Kemasan Utuh &amp; Tidak Bocor (ISO 17025)
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold">Rincian Muatan / Catatan Inspeksi</label>
                <textarea
                  rows={2}
                  value={delForm.notes || ''}
                  onChange={(e) => setDelForm({ ...delForm, notes: e.target.value })}
                  placeholder="Jumlah botol/kantong, kondisi es pendingin, surat pengantar..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Upload Bukti Terima Saat Diterima Petugas di Lab */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    <span>Upload Bukti Terima Fisik Sampel di Lab</span>
                  </label>
                  {delForm.proofOfReceiptUrl && (
                    <button
                      type="button"
                      onClick={() => setDelForm({ ...delForm, proofOfReceiptUrl: '', proofFileName: '' })}
                      className="text-[10px] text-rose-600 hover:underline font-semibold"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Ambil foto surat jalan ekspedisi / kondisi fisik kemasan sampel saat diserahterimakan kurir ke petugas laboratorium.
                </p>

                {delForm.proofOfReceiptUrl ? (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={delForm.proofOfReceiptUrl}
                      alt="Preview Bukti"
                      className="h-16 w-20 rounded-lg object-cover border border-emerald-300 shadow-sm"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">Foto Bukti Siap Disimpan</span>
                      <span className="text-[10px] text-slate-400">{delForm.proofFileName || 'bukti_terima.jpg'}</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 block text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Ganti Foto Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-900 transition"
                  >
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Klik untuk Upload Bukti Foto Terima
                    </span>
                    <span className="text-[10px] text-slate-400">Format JPG, PNG, atau kamera HP (Maks. 5MB)</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProofFileChange}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDelModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Simpan Data Logistik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Viewer Bukti Terima */}
      {proofViewerModal && proofViewerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-2xl w-full rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bukti Terima Resi: {proofViewerModal.trackingNo}
                </h3>
              </div>
              <button
                onClick={() => setProofViewerModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex justify-center bg-slate-950 rounded-xl overflow-hidden max-h-[70vh]">
              <img
                src={proofViewerModal.url}
                alt={`Bukti Terima ${proofViewerModal.trackingNo}`}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setProofViewerModal(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
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
