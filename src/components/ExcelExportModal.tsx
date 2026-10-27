import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Database,
  Calendar,
} from 'lucide-react';
import { AppState } from '../types';
import { exportAllDataToExcel, ExcelExportOptions } from '../utils/excelExport';

interface ExcelExportModalProps {
  isOpen: boolean;
  state: AppState;
  onClose: () => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ isOpen, state, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [successFile, setSuccessFile] = useState<string | null>(null);

  const [options, setOptions] = useState<ExcelExportOptions>({
    includeDeals: true,
    includeLabs: true,
    includeQcQa: true,
    includeAccounts: true,
    includeFinance: true,
    includeQuotes: true,
    includeInstruments: true,
    includeInventory: true,
    includeActivities: true,
    includeMarketing: true,
    includeCatalog: true,
    includeLogs: true,
    includeUsers: true,
  });

  if (!isOpen) return null;

  const sheetItems = [
    { key: 'includeDeals', title: 'Papan Deal & Pipeline', count: state.deals.length, desc: 'Tahapan prospek, nilai IDR, status layanan, PIC' },
    { key: 'includeLabs', title: 'Work Order & Sampel Lab', count: state.labs.length, desc: 'Sample ID (SID), pengujian XRD/XRF/SEM, analis, status' },
    { key: 'includeQcQa', title: 'CAPA & Evaluasi QC/QA ISO 17025', count: state.qcqa?.actions?.length || 0, desc: 'Tindakan koreksi, analisis akar masalah, verifikasi' },
    { key: 'includeAccounts', title: 'Kontak & Pelanggan', count: state.accounts.length, desc: 'Nama customer, instansi/perusahaan, nomor WA, referral' },
    { key: 'includeFinance', title: 'Keuangan & Faktur Tagihan', count: state.fins.length, desc: 'Nomor invoice, PPN 11%, jatuh tempo, status lunas' },
    { key: 'includeQuotes', title: 'Penawaran Harga', count: state.quotes.length, desc: 'Surat penawaran resmi, total harga, masa berlaku' },
    { key: 'includeInstruments', title: 'Master Instrumen & Kalibrasi', count: state.insts.length, desc: 'Target jam operasional, interval kalibrasi, preventive' },
    { key: 'includeInventory', title: 'Inventori & Reagen', count: state.inv.length, desc: 'Stok bahan kimia, lokasi penyimpanan, status ketersediaan' },
    { key: 'includeActivities', title: 'Aktivitas Sales & Follow-Up', count: state.acts.length, desc: 'Meeting klien, kunjungan lapangan, log komunikasi' },
    { key: 'includeMarketing', title: 'Digital Marketing Campaign', count: state.mkt.length, desc: 'Biaya iklan, jangkauan reach, klik, lead dihasilkan' },
    { key: 'includeCatalog', title: 'Katalog Layanan Laboratorium', count: state.cat.length, desc: 'Daftar pengujian, standar uji, estimasi hari kerja' },
    { key: 'includeLogs', title: 'Audit Trail Log Book', count: state.log.length, desc: 'Jejak rekam riwayat setiap aksi staf dan waktu sistem' },
    { key: 'includeUsers', title: 'Akun Pengguna & Hak Akses', count: (state.users || []).length, desc: 'Daftar staf tim, peran RBAC, dan modul yang diizinkan' },
  ];

  const toggleOption = (key: keyof ExcelExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (select: boolean) => {
    const updated: any = {};
    sheetItems.forEach((item) => {
      updated[item.key] = select;
    });
    setOptions(updated);
  };

  const handleExport = () => {
    setDownloading(true);
    try {
      const generatedName = exportAllDataToExcel(state, options);
      setSuccessFile(generatedName);
      setTimeout(() => {
        setDownloading(false);
      }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor file Excel. Silakan coba lagi.');
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ekspor Seluruh Data ke Excel (.xlsx)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data terintegrasi dari seluruh laptop dalam satu workbook multi-sheet terstruktur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Quick Notice */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-start gap-2.5">
              <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold mb-0.5">
                  Format Kompatibel Microsoft Excel, Google Sheets, &amp; LibreOffice
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                  File yang diunduh berformat asli <code>.xlsx</code> dengan lembar kerja (sheets) terpisah untuk setiap divisi: Sales &amp; CRM, Laboratorium, QC/QA ISO 17025, Keuangan, Master Instrumen, hingga Audit Trail Log Book.
                </p>
              </div>
            </div>
          </div>

          {/* Sheet Selector Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" />
              Pilih Lembar Kerja (Sheets) yang Ingin Diekspor:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                Pilih Semua
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-[11px] font-bold text-slate-500 hover:underline"
              >
                Kosongkan
              </button>
            </div>
          </div>

          {/* Grid of Sheet Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
            {sheetItems.map((item) => {
              const isChecked = !!(options as any)[item.key];
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => toggleOption(item.key as keyof ExcelExportOptions)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition select-none ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs ring-1 ring-emerald-500/50'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                    {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                        {item.count} baris
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {successFile && (
            <div className="rounded-xl bg-emerald-100/80 p-3 text-xs text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>File <strong>{successFile}</strong> berhasil dibuat dan diunduh ke laptop Anda!</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Termasuk Ringkasan Eksekutif &amp; KPI Resmi PT Nusa Veritas Inspektama
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{downloading ? 'Menghasilkan File...' : 'Unduh File Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
