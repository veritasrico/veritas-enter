import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Check,
  Users,
  Sparkles,
  Briefcase,
  FlaskConical,
  Calculator,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { ManagedUserAccount, Role, TabKey } from '../types';

export interface ActiveUser {
  u: string;
  role: Role;
  name: string;
  department?: string;
  allowedTabs?: TabKey[];
}

interface UserAccountModalProps {
  isOpen: boolean;
  currentUser: ActiveUser;
  managedUsers?: ManagedUserAccount[];
  onSelectUser: (user: ActiveUser) => void;
  onOpenManageUsers?: () => void;
  onClose: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  currentUser,
  managedUsers = [],
  onSelectUser,
  onOpenManageUsers,
  onClose,
}) => {
  const [pinPromptUser, setPinPromptUser] = useState<ManagedUserAccount | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handlePickUser = (u: ManagedUserAccount) => {
    if (u.pin) {
      setPinPromptUser(u);
      setEnteredPin('');
      setPinError('');
    } else {
      applyUser(u);
    }
  };

  const applyUser = (u: ManagedUserAccount) => {
    onSelectUser({
      u: u.username,
      role: u.role,
      name: u.name,
      department: u.department,
      allowedTabs: u.allowedTabs,
    });
    setPinPromptUser(null);
    onClose();
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptUser) return;
    if (enteredPin === pinPromptUser.pin) {
      applyUser(pinPromptUser);
    } else {
      setPinError('PIN salah. Silakan coba lagi.');
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">ADMIN</span>;
      case 'sales':
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">SALES</span>;
      case 'lab':
        return <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">LAB</span>;
      case 'finance':
        return <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">FINANCE</span>;
      default:
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{role.toUpperCase()}</span>;
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-rose-600" />;
      case 'sales':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'lab':
        return <FlaskConical className="h-4 w-4 text-emerald-600" />;
      case 'finance':
        return <Calculator className="h-4 w-4 text-amber-600" />;
      default:
        return <User className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ganti Akun &amp; Hak Akses di Laptop Ini
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih profil kerja Anda. Navigasi &amp; data akan menyesuaikan izin peran Anda.
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

        {/* Current Active User Banner */}
        <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
                {getRoleBadge(currentUser.role)}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentUser.department || 'Pengguna Aktif di Laptop ini'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
            Aktif Sekarang
          </span>
        </div>

        {/* PIN Verification Sub-screen */}
        {pinPromptUser ? (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 mb-1">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Verifikasi PIN Keamanan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akun <strong>{pinPromptUser.name}</strong> (@{pinPromptUser.username}) diproteksi oleh PIN.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4 max-w-xs mx-auto">
              <div>
                <input
                  type="password"
                  autoFocus
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="Masukkan 4-6 Digit PIN"
                  className="w-full text-center text-lg tracking-widest font-mono rounded-xl border border-slate-300 py-2.5 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
                {pinError && (
                  <p className="text-[11px] text-rose-500 font-semibold text-center mt-1.5">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPinPromptUser(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Buka Kunci &amp; Masuk
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Pilih Akun Staf (Daftar Akun Terdaftar):
              </label>
              <div className="grid grid-cols-1 gap-2">
                {managedUsers.map((u) => {
                  const isSelected = currentUser.u === u.username;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handlePickUser(u)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          {getRoleIcon(u.role)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {u.name}
                            </span>
                            {getRoleBadge(u.role)}
                            {u.pin && (
                              <span className="flex items-center gap-0.5 text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                                <Lock className="h-2.5 w-2.5 text-amber-500" />
                                PIN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {u.department}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {u.allowedTabs.length} Modul Terbuka
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Pilih</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Link to Admin User Management */}
            {currentUser.role === 'admin' && onOpenManageUsers && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onClose();
                    onOpenManageUsers();
                  }}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 hover:bg-emerald-50 text-xs font-bold transition"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Buka Panel Admin: Tambah / Atur Izin Akses Akun
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Identitas dan izin modul disimpan lokal di browser laptop ini.</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
