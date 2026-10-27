import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Check } from 'lucide-react';

export type AdminActionType = 'reset_all_data' | 'clear_logbook' | 'delete_item';

interface AdminConfirmModalProps {
  isOpen: boolean;
  actionType: AdminActionType;
  title: string;
  description: string;
  confirmTextKeyword?: string; // Optional: Require typing "KOSONGKAN" or "HAPUS"
  onClose: () => void;
  onConfirm: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  actionType,
  title,
  description,
  confirmTextKeyword,
  onClose,
  onConfirm,
}) => {
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const requiresTyping = Boolean(confirmTextKeyword);
  const isTypingMatched = requiresTyping
    ? inputVal.trim().toUpperCase() === confirmTextKeyword?.toUpperCase()
    : true;

  const handleConfirm = () => {
    if (!isTypingMatched) return;
    onConfirm();
    setInputVal('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/70 px-5 py-3.5 dark:border-rose-950 dark:bg-rose-950/40">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
              Konfirmasi Tindakan Khusus Administrator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>

          {requiresTyping && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2">
              <label className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                Ketik kata <span className="underline font-mono uppercase font-black">{confirmTextKeyword}</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Ketik ${confirmTextKeyword}...`}
                className="w-full rounded-lg border border-rose-300 bg-white p-2 text-xs font-mono font-bold text-rose-900 focus:border-rose-500 focus:outline-none dark:border-rose-800 dark:bg-slate-800 dark:text-rose-200"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={() => {
              setInputVal('');
              onClose();
            }}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!isTypingMatched}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Eksekusi Tindakan Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
