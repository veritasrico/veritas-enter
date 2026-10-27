import React from 'react';
import { X, Bell, PhoneCall, AlertTriangle, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onActionClick: (notification: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  notifications,
  onClose,
  onActionClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Notifikasi Instan &amp; Pengingat
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {notifications.length} pengingat aktif otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Semua tugas &amp; sinyal terkendali
              </p>
              <p className="text-xs text-slate-400">
                Tidak ada pengingat mendesak atau keterlambatan saat ini.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-xl border p-3.5 transition ${
                  notif.urgency === 'high'
                    ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                    : notif.type === 'referral'
                    ? 'border-purple-200 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/20'
                    : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notif.urgency === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      notif.urgency === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {notif.urgency === 'high' ? 'Prioritas' : 'Normal'}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400">
                    Jatuh tempo: {notif.date}
                  </span>
                  {notif.actionLabel && (
                    <button
                      onClick={() => onActionClick(notif)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      {notif.actionType === 'wa' ? (
                        <MessageCircle className="h-3 w-3" />
                      ) : (
                        <PhoneCall className="h-3 w-3" />
                      )}
                      <span>{notif.actionLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 text-center">
            Pengingat otomatis dievaluasi secara dinamis dari jadwal aktivitas, kalibrasi, invoice, dan sinyal referral.
          </p>
        </div>
      </div>
    </div>
  );
};
