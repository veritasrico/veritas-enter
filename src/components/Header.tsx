import React from 'react';
import {
  Cloud,
  Bell,
  MessageCircle,
  Presentation,
  LogOut,
  Sparkles,
  RefreshCw,
  Monitor,
  Smartphone,
  Share2,
  User,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import { SyncStatus } from '../utils/cloudSync';
import { AppNotification, Role } from '../types';
import { VeritasLogo } from './VeritasLogo';
import { ActiveUser } from './UserAccountModal';

interface HeaderProps {
  user: ActiveUser;
  syncStatus: SyncStatus;
  notifications: AppNotification[];
  viewportMode: 'web' | 'mobile';
  onToggleViewportMode: (mode: 'web' | 'mobile') => void;
  onSyncNow: () => void;
  onOpenNotifications: () => void;
  onOpenWa: () => void;
  onOpenSlide: () => void;
  onOpenAiAnalytics: () => void;
  onOpenUserModal: () => void;
  onOpenShareModal: () => void;
  onOpenExcelExport: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  syncStatus,
  notifications,
  viewportMode,
  onToggleViewportMode,
  onSyncNow,
  onOpenNotifications,
  onOpenWa,
  onOpenSlide,
  onOpenAiAnalytics,
  onOpenUserModal,
  onOpenShareModal,
  onOpenExcelExport,
  onLogout,
}) => {
  const highPriorityCount = notifications.filter((n) => n.urgency === 'high').length;

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'sales':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      case 'lab':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'finance':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Brand & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-slate-200/80 dark:border-slate-800 dark:bg-slate-800 shrink-0">
          <VeritasLogo className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate tracking-wide">
              <span>VERITAS ENTER</span>
            </h1>
            <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 md:inline-block">
              Integrated Enterprise
            </span>
          </div>
          <p className="hidden text-[10px] text-slate-500 dark:text-slate-400 lg:block font-medium">
            Your Gateway to an Integrated Enterprise &bull; Lab, Sales, QC, Supply Chain &amp; People
          </p>
        </div>
      </div>

      {/* Central Viewport Switcher: Web vs Mobile Device */}
      <div className="flex items-center rounded-xl border border-slate-300 bg-slate-100/80 p-0.5 shadow-inner dark:border-slate-700 dark:bg-slate-800 shrink-0 mx-1">
        <button
          onClick={() => onToggleViewportMode('web')}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-bold transition ${
            viewportMode === 'web'
              ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          title="Tampilan Web Desktop Layar Penuh"
        >
          <Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Tampilan Web</span>
          <span className="sm:hidden">Web</span>
        </button>

        <button
          onClick={() => onToggleViewportMode('mobile')}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-bold transition ${
            viewportMode === 'mobile'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          title="Tampilan Mobile Device (Simulator &amp; Live Adjustment)"
        >
          <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Tampilan Mobile</span>
          <span className="sm:hidden">Mobile</span>
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Share Multi-Laptop / Team Button */}
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/80 px-2 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs"
          title="Bagikan Tautan Akses Multi-Laptop &amp; Tim"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden md:inline">Akses Tim</span>
        </button>

        {/* Ekspor Seluruh Data ke Excel Button */}
        <button
          onClick={onOpenExcelExport}
          className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50/90 px-2 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs"
          title="Ekspor Seluruh Data Aplikasi ke File Excel (.xlsx)"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Ekspor Excel</span>
        </button>

        {/* Fast Cloud Sync Button & Status */}
        <button
          onClick={onSyncNow}
          title="Sinkronisasi Awan Sekarang (Otomatis tiap 8-10s)"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-1.5 sm:px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {syncStatus.status === 'syncing' ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
          ) : (
            <Cloud className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span className="hidden xl:inline">Awan: Sinkron</span>
          <span className="hidden sm:inline-block rounded bg-emerald-100 px-1 py-0.2 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
            {syncStatus.latencyMs}ms
          </span>
        </button>

        {/* AI Analytics Shortcut */}
        <button
          onClick={onOpenAiAnalytics}
          className="hidden lg:flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          title="Dashboard Analitik AI Real-Time"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden xl:inline">Analitik AI</span>
        </button>

        {/* WA Service Direct */}
        <button
          onClick={onOpenWa}
          className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          title="Layanan WhatsApp Terintegrasi"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden md:inline">WA Layanan</span>
        </button>

        {/* Slide Rapat */}
        <button
          onClick={onOpenSlide}
          className="hidden xl:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          title="Slide Rapat Eksekutif"
        >
          <Presentation className="h-3.5 w-3.5 text-amber-500" />
          <span>Slide Rapat</span>
        </button>

        {/* Instant Notification Center */}
        <button
          onClick={onOpenNotifications}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Pusat Pengingat &amp; Sinyal Follow-Up"
        >
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {notifications.length > 0 && (
            <span
              className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ${
                highPriorityCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            >
              {notifications.length}
            </span>
          )}
        </button>

        {/* Active User Pill & Role Switcher */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          title="Klik untuk Ganti Akun &amp; Peran Anda di Laptop Ini"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
          <span className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${getRoleBadge(user.role)}`}>
            {user.role}
          </span>
        </button>

        {/* Quick Logout / Reset User */}
        <div className="flex items-center border-l border-slate-200 pl-1 sm:pl-1.5 dark:border-slate-700">
          <button
            onClick={onLogout}
            title="Keluar / Ganti Akun"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:bg-rose-950/40"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
