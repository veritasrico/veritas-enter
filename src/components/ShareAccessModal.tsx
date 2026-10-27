import React, { useState } from 'react';
import { X, Copy, Check, Globe, Laptop, Users, RefreshCw, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Standalone app URL that does not require AI Studio developer login
  const liveAppUrl = window.location.origin.includes('run.app')
    ? window.location.origin
    : 'https://ais-pre-ivxcxhtp73bzeesqonyeiu-560806638605.asia-southeast1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(liveAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Akses Terpadu Multi-Laptop &amp; Tim
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cara menggunakan aplikasi bersama di seluruh laptop dengan data tersinkronisasi
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

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Important Notice */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-start gap-2.5">
              <Laptop className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold mb-1">
                  Perbedaan Link Editor vs Link Aplikasi Terbuka (Public Standalone)
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                  Link <code>aistudio.google.com/apps/...</code> adalah halaman konsol kerja developer. Untuk digunakan oleh staf lain di laptop berbeda tanpa meminta izin login akun Google pemilik, gunakan <strong>Link Langsung (Standalone App)</strong> di bawah ini:
                </p>
              </div>
            </div>
          </div>

          {/* URL Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Link Aplikasi untuk Dibuka di Laptop Tim (Salin &amp; Kirim via WA/Email)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 select-all truncate dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {liveAppUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>
            </div>
          </div>

          {/* How It Works & Steps */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Langkah Penggunaan di Setiap Laptop:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    1
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Buka Link</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Buka link di browser (Google Chrome, Edge, Safari) pada laptop masing-masing pengguna.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Pilih Peran</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Klik profil pengguna di pojok kanan atas, lalu pilih peran (Sales, Lab, QC/QA, atau Finance).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    3
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Sinkron Dinamis</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Aplikasi otomatis menyinkronkan data tiap 8-10 detik. Semua perubahan langsung terintegrasi!
                </p>
              </div>
            </div>
          </div>

          {/* Sync Engine Features */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Fitur Integrasi Real-Time Multi-Pengguna:
            </h4>
            <ul className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Persistent Database:</strong> Data disimpan di cloud disk server (<code>cloud_db_store.json</code>), tidak akan hilang saat reload atau restart browser.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Otomatis Polling:</strong> Setiap input deal, perubahan status lab order, audit checklist QC/QA, atau catatan baru akan otomatis muncul di laptop tim lain.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Log Jejak Audit:</strong> Setiap aksi mencatat nama dan peran staf yang menginput di modul Log Book otomatis.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
          <a
            href={liveAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>Buka di Tab Baru</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
