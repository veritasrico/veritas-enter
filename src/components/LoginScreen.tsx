import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Briefcase,
  FlaskConical,
  Calculator,
  Megaphone,
  Award,
  User,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ManagedUserAccount, Role, TabKey } from '../types';
import { VeritasLogo } from './VeritasLogo';
import { SyncStatus } from '../utils/cloudSync';
import { ActiveUser } from './UserAccountModal';

interface LoginScreenProps {
  users: ManagedUserAccount[];
  syncStatus: SyncStatus;
  onLogin: (user: ActiveUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  syncStatus,
  onLogin,
}) => {
  const [selectedUser, setSelectedUser] = useState<ManagedUserAccount | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeUsers = (users || []).filter((u) => u.isActive !== false);
  const filteredUsers = activeUsers.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.department && u.department.toLowerCase().includes(term)) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const handleSelectAccount = (u: ManagedUserAccount) => {
    if (u.pin && u.pin.trim() !== '') {
      setSelectedUser(u);
      setEnteredPin('');
      setPinError('');
      setShowPin(false);
    } else {
      onLogin({
        u: u.username,
        name: u.name,
        role: u.role,
        department: u.department,
        allowedTabs: u.allowedTabs,
      });
    }
  };

  const handleVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // If user has a PIN in database, must match
    if (selectedUser.pin && selectedUser.pin.trim() !== '') {
      if (enteredPin !== selectedUser.pin.trim()) {
        setPinError('PIN keamanan tidak sesuai. Silakan hubungi Administrator jika Anda lupa PIN.');
        return;
      }
    }

    // Success: Login user
    onLogin({
      u: selectedUser.username,
      name: selectedUser.name,
      role: selectedUser.role,
      department: selectedUser.department,
      allowedTabs: selectedUser.allowedTabs,
    });
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            ADMIN
          </span>
        );
      case 'finance':
        return (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            FINANCE
          </span>
        );
      case 'sales':
        return (
          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            SALES
          </span>
        );
      case 'marketing':
        return (
          <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            MARKETING
          </span>
        );
      case 'lab':
        return (
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            LAB ANALYST
          </span>
        );
      case 'mutu':
        return (
          <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            MUTU &amp; ISO
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {String(role).toUpperCase()}
          </span>
        );
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'finance':
        return <Calculator className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'sales':
        return <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'marketing':
        return <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'lab':
        return <FlaskConical className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'mutu':
        return <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-slate-700/80 shrink-0">
              <VeritasLogo className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-wider">VERITAS ENTER</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Enterprise Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">PT NUSA VERITAS INSPEKTAMA</p>
            </div>
          </div>

          {/* Database Live Connectivity Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
            <Cloud className={`h-3.5 w-3.5 ${syncStatus.status === 'error' ? 'text-rose-500' : 'text-emerald-400'}`} />
            <span className="text-slate-300 text-[11px] font-medium hidden sm:inline">Supabase Database:</span>
            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Terkoneksi ({syncStatus.latencyMs}ms)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {selectedUser ? (
            /* ============================================================== */
            /* VIEW 2: PIN VERIFICATION (TAMPILAN VERIFIKASI PIN)             */
            /* ============================================================== */
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fadeIn">
              {/* Selected User Header */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-base font-extrabold text-white shrink-0 shadow-md">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white truncate">{selectedUser.name}</h3>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    @{selectedUser.username} &bull; {selectedUser.department || 'Personel'}
                  </p>
                </div>
              </div>

              {/* Security Icon & Instructions */}
              <div className="text-center mb-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 shadow-inner">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-bold text-white">Verifikasi PIN Keamanan</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Akun <strong className="text-white">{selectedUser.name}</strong> (@{selectedUser.username}) diproteksi oleh PIN tersimpan di basis data Supabase.
                </p>
              </div>

              {/* PIN Form */}
              <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      autoFocus
                      value={enteredPin}
                      onChange={(e) => {
                        setEnteredPin(e.target.value);
                        setPinError('');
                      }}
                      placeholder="Masukkan 4-6 Digit PIN"
                      className="w-full rounded-2xl border-2 border-emerald-500/50 bg-slate-950 px-4 py-3.5 text-center font-mono text-xl tracking-[0.3em] text-white placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
                      title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {pinError && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 animate-shake">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setEnteredPin('');
                      setPinError('');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-[1.5] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition ring-1 ring-emerald-500"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Buka Kunci &amp; Masuk</span>
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
                Data hak akses dan modul akan otomatis disesuaikan dengan peran profil Anda.
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* VIEW 1: SELECT ACCOUNT (TAMPILAN PILIH AKUN DARI DATABASE)      */
            /* ============================================================== */
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 shadow-inner">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-white tracking-wide">Pilih Akun Kerja</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Pilih profil kerja Anda untuk masuk ke sistem. Navigasi dan akses modul disesuaikan dengan peran Anda.
                </p>
              </div>

              {/* Search User Input if > 4 users */}
              {activeUsers.length > 4 && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama, role, atau divisi..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Users List from Database */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredUsers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Tidak ada akun pengguna yang cocok.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const hasPin = !!(u.pin && u.pin.trim() !== '');
                    return (
                      <button
                        key={u.id || u.username}
                        type="button"
                        onClick={() => handleSelectAccount(u)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/50 transition group text-left shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0 border border-slate-700/60">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                                {u.name}
                              </span>
                              {getRoleBadge(u.role)}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              @{u.username} &bull; {u.department || 'Personel'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          {hasPin ? (
                            <span
                              className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-1 text-[10px] font-medium text-slate-400 group-hover:border-emerald-500/40 group-hover:text-emerald-300 border border-slate-700/50"
                              title="Akun ini diproteksi oleh PIN keamanan"
                            >
                              <Lock className="h-3 w-3 text-amber-400" />
                              <span className="hidden sm:inline">PIN</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                              Buka Langsung
                            </span>
                          )}
                          <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Database info banner */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Database Supabase Aktif
                </span>
                <span className="text-slate-500">{activeUsers.length} Akun Terdaftar</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-center text-xs text-slate-500">
        <p>
          VERITAS ENTER &bull; Integrated Lab, CRM, QC/QA ISO 17025 &amp; ERP &bull; PT NUSA VERITAS INSPEKTAMA
        </p>
      </footer>
    </div>
  );
};
