import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Check,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Briefcase,
  FlaskConical,
  Calculator,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { ManagedUserAccount, Role, TabKey } from '../../types';
import { ALL_SYSTEM_TABS, uid } from '../../utils/seedData';

interface UserManagementViewProps {
  users: ManagedUserAccount[];
  currentUser: { u: string; role: Role; name: string };
  onSaveUser: (user: ManagedUserAccount) => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ROLE_TEMPLATES: Record<Role, { label: string; tabs: TabKey[] }> = {
  admin: {
    label: 'Akses Penuh (Administrator)',
    tabs: [
      'dash', 'ai_analytics', 'cal', 'accounts', 'deals', 'acts', 'mkt', 'quote', 'cat',
      'labdash', 'lab', 'qcqa', 'insts', 'instr', 'inv', 'fin', 'monthly_report', 'slide_export', 'log', 'set', 'users'
    ],
  },
  sales: {
    label: 'Divisi Sales & Komersial',
    tabs: ['dash', 'cal', 'accounts', 'deals', 'acts', 'mkt', 'quote', 'cat'],
  },
  lab: {
    label: 'Analis Laboratorium',
    tabs: ['dash', 'cal', 'labdash', 'lab', 'qcqa', 'insts', 'instr', 'inv'],
  },
  finance: {
    label: 'Finance & Faktur',
    tabs: ['dash', 'cal', 'quote', 'fin', 'monthly_report'],
  },
  marketing: {
    label: 'Digital Marketing & Kampanye',
    tabs: ['dash', 'cal', 'accounts', 'deals', 'mkt', 'quote', 'cat'],
  },
};

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<Role>('sales');
  const [formDept, setFormDept] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formAllowedTabs, setFormAllowedTabs] = useState<TabKey[]>(ROLE_TEMPLATES.sales.tabs);

  const openAddModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormName('');
    setFormRole('sales');
    setFormDept('Divisi Komersial');
    setFormPin('');
    setFormNote('');
    setFormAllowedTabs([...ROLE_TEMPLATES.sales.tabs]);
    setIsModalOpen(true);
  };

  const openEditModal = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormRole(user.role);
    setFormDept(user.department || '');
    setFormPin(user.pin || '');
    setFormNote(user.note || '');
    setFormAllowedTabs([...user.allowedTabs]);
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (role: Role) => {
    setFormRole(role);
    setFormAllowedTabs([...ROLE_TEMPLATES[role].tabs]);
  };

  const toggleTabPermission = (tabKey: TabKey) => {
    setFormAllowedTabs((prev) =>
      prev.includes(tabKey) ? prev.filter((t) => t !== tabKey) : [...prev, tabKey]
    );
  };

  const handleSelectAllTabs = () => {
    setFormAllowedTabs(ALL_SYSTEM_TABS.map((t) => t.key));
  };

  const handleClearAllTabs = () => {
    setFormAllowedTabs(['dash']); // Selalu pertahankan dashboard overview
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formName.trim()) {
      alert('Mohon isi Username dan Nama Lengkap.');
      return;
    }

    const cleanUsername = formUsername.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    const userToSave: ManagedUserAccount = {
      id: editingUser ? editingUser.id : `usr-${uid()}`,
      username: cleanUsername,
      name: formName.trim(),
      role: formRole,
      department: formDept.trim() || 'Operasional Veritas',
      pin: formPin.trim() || undefined,
      allowedTabs: formAllowedTabs.length > 0 ? formAllowedTabs : ['dash'],
      isActive: editingUser ? editingUser.isActive : true,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString().slice(0, 10),
      note: formNote.trim() || undefined,
    };

    onSaveUser(userToSave);
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Group tabs by section for modal rendering
  const tabGroups = Array.from(new Set(ALL_SYSTEM_TABS.map((t) => t.group)));

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Manajemen Akun Pengguna &amp; Pembatasan Hak Akses
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              Role-Based Access Control (RBAC)
            </span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Tambah Akun Pengguna</span>
        </button>
      </div>


      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, username, atau divisi..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Peran ({users.length})</option>
            <option value="admin">Administrator</option>
            <option value="sales">Sales &amp; Komersial</option>
            <option value="lab">Analis Lab</option>
            <option value="finance">Finance</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="py-3.5 px-4">Pengguna / Nama</th>
                <th className="py-3.5 px-4">Peran (Role)</th>
                <th className="py-3.5 px-4">Divisi / Unit Kerja</th>
                <th className="py-3.5 px-4 text-center">Proteksi PIN</th>
                <th className="py-3.5 px-4 text-center">Modul Diizinkan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada akun pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser.u === u.username;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {u.name}
                              </span>
                              {isCurrent && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                  Aktif di Laptop Ini
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-slate-400">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {u.department}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {u.pin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Lock className="h-3 w-3 text-amber-500" />
                            <span>Terkunci PIN</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Bebas PIN</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {u.allowedTabs.length === ALL_SYSTEM_TABS.length
                            ? 'Semua Modul (Penuh)'
                            : `${u.allowedTabs.length} Modul Terpilih`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onToggleStatus(u.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer transition hover:opacity-80"
                          title="Klik untuk mengubah status aktif"
                        >
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-500">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Nonaktif</span>
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
                            title="Edit Akun &amp; Pembatasan Hak Akses"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {u.username !== 'ricoh' && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Apakah Anda yakin ingin menghapus akun pengguna "${u.name}" (@${u.username})?`
                                  )
                                ) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingUser ? 'Edit Akun & Pembatasan Hak Akses' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tentukan modul yang dapat dibuka dan sandi/PIN akses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="overflow-y-auto p-6 space-y-5">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username (Huruf kecil tanpa spasi) *
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="misal: budi_lab"
                    required
                    disabled={editingUser?.username === 'ricoh'}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lengkap Petugas *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="misal: Budi Santoso, S.Si."
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Peran Utama (Role)
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const newRole = e.target.value as Role;
                      setFormRole(newRole);
                      handleApplyTemplate(newRole);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                  >
                    <option value="admin">Administrator (Admin)</option>
                    <option value="sales">Sales &amp; Komersial</option>
                    <option value="lab">Analis Laboratorium</option>
                    <option value="finance">Finance &amp; Faktur</option>
                    <option value="marketing">Digital Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Divisi / Unit Kerja
                  </label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="misal: Analis XRD / Marketing"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    PIN Keamanan (Opsional)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="Contoh: 1234 (4-6 digit)"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Template Buttons */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Pilih Cepat Template Hak Akses:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllTabs}
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      Pilih Semua Modul
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllTabs}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Hanya Dashboard
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ROLE_TEMPLATES) as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleApplyTemplate(r)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                        formRole === r
                          ? 'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ROLE_TEMPLATES[r].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Checkboxes Matrix */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Matriks Izin Modul yang Dapat Diakses Pengguna Ini ({formAllowedTabs.length} Modul Terpilih):
                </label>

                <div className="space-y-4">
                  {tabGroups.map((group) => {
                    const groupTabs = ALL_SYSTEM_TABS.filter((t) => t.group === group);
                    return (
                      <div
                        key={group}
                        className="rounded-xl border border-slate-200 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          {group}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {groupTabs.map((tab) => {
                            const isChecked = formAllowedTabs.includes(tab.key);
                            return (
                              <label
                                key={tab.key}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                                  isChecked
                                    ? 'border-emerald-500 bg-emerald-50/60 text-slate-900 font-semibold dark:bg-emerald-950/30 dark:text-white dark:border-emerald-600'
                                    : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTabPermission(tab.key)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="truncate">{tab.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  {editingUser ? 'Simpan Perubahan Hak Akses' : 'Buat Akun Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
