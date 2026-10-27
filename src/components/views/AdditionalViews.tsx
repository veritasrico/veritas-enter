import React, { useState } from 'react';
import { Plus, Search, Megaphone, ShieldAlert, Package, BookOpen, Settings, Cloud, Download, Upload, Trash2, History, AlertTriangle, CheckCircle2, Clock, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { Activity, AppState, CompanyProfile, InstrumentEvent, InventoryItem, MarketingCampaign, ServiceCatalog } from '../../types';
import { ACTIVITIES, idr, today, uid } from '../../utils/seedData';

// 1. ACTIVITIES VIEW
export const ActivitiesView: React.FC<{
  acts: Activity[];
  accounts: AppState['accounts'];
  onSaveActivity: (act: Activity) => void;
  onDeleteActivity: (id: string) => void;
}> = ({ acts, accounts, onSaveActivity, onDeleteActivity }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<Activity>>({
    accId: accounts[0]?.id || '',
    type: 'Follow-up',
    date: today(),
    status: 'Terjadwal',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveActivity({
      id: form.id || uid(),
      accId: form.accId || accounts[0]?.id || '',
      type: (form.type as any) || 'Follow-up',
      date: form.date || today(),
      status: (form.status as any) || 'Terjadwal',
      note: form.note || '',
    });
    setIsOpen(false);
  };

  const filtered = acts.filter((a) => {
    const q = search.toLowerCase();
    const acc = accounts.find((x) => x.id === a.accId);
    return a.note.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || (acc?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aktivitas Sales &amp; Follow-Up</h2>
        </div>
        <button onClick={() => { setForm({ id: uid(), accId: accounts[0]?.id || '', type: 'Follow-up', date: today(), status: 'Terjadwal', note: '' }); setIsOpen(true); }} className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
          + Tambah Aktivitas
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari aktivitas, tipe, atau customer..." className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Jenis</th>
              <th className="py-3 px-4">Perusahaan / Customer</th>
              <th className="py-3 px-4">Catatan</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((a) => {
              const client = accounts.find((x) => x.id === a.accId);
              return (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono">{a.date}</td>
                  <td className="py-3 px-4"><span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">{a.type}</span></td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{client?.name || '-'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{a.note}</td>
                  <td className="py-3 px-4 text-center"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">{a.status}</span></td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setForm({ ...a }); setIsOpen(true); }} className="rounded border border-slate-300 px-2 py-1 text-[11px] mr-1">Edit</button>
                    <button onClick={() => onDeleteActivity(a.id)} className="rounded border border-slate-300 px-2 py-1 text-[11px] text-rose-600">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Aktivitas Sales</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold">Customer</label>
                <select value={form.accId} onChange={(e) => setForm({ ...form, accId: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800">
                  {accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name} ({acc.pic})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Jenis</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800">
                    {ACTIVITIES.map((act) => (<option key={act} value={act}>{act}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Tanggal</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Catatan</label>
                <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded border px-3 py-1.5 text-xs">Batal</button>
                <button type="submit" className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. MARKETING VIEW
const MARKETING_CHANNELS = [
  'LinkedIn',
  'Instagram',
  'TikTok',
  'YouTube',
  'Meta (Facebook / Ads)',
  'Website & SEO',
  'Event Exhibition & Expo',
  'Webinar & Workshop Teknis',
  'Seminar Ilmiah & Konferensi',
  'Referral Partner',
];

export const MarketingView: React.FC<{
  mkt: MarketingCampaign[];
  onSaveMkt: (m: MarketingCampaign) => void;
  onDeleteMkt: (id: string) => void;
  onOpenImportExcel?: () => void;
  isAdmin?: boolean;
}> = ({ mkt, onSaveMkt, onDeleteMkt, onOpenImportExcel, isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<MarketingCampaign>>({
    date: today(),
    channel: 'Instagram',
    type: 'Post organik / Iklan',
    name: '',
    spend: 0,
    reach: 1000,
    clicks: 50,
    leads: 2,
    url: '',
    note: '',
  });

  const totalSpend = mkt.reduce((s, x) => s + (Number(x.spend) || 0), 0);
  const totalLeads = mkt.reduce((s, x) => s + (Number(x.leads) || 0), 0);
  const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMkt({
      id: form.id || uid(),
      date: form.date || today(),
      channel: form.channel || 'Instagram',
      type: form.type || 'Post organik / Iklan',
      name: form.name || 'Kampanye Baru',
      spend: Number(form.spend) || 0,
      reach: Number(form.reach) || 0,
      clicks: Number(form.clicks) || 0,
      leads: Number(form.leads) || 0,
      url: form.url || '',
      note: form.note || '',
    });
    setIsOpen(false);
  };

  const getChannelBadge = (ch: string) => {
    const c = ch.toLowerCase();
    if (c.includes('instagram')) return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300';
    if (c.includes('linkedin')) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
    if (c.includes('tiktok')) return 'bg-slate-900 text-cyan-300 border-slate-700 dark:bg-slate-800 dark:text-cyan-300';
    if (c.includes('youtube')) return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300';
    if (c.includes('event') || c.includes('exhibition') || c.includes('expo')) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
    if (c.includes('webinar') || c.includes('seminar')) return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-600" />
            <span>Digital Marketing &amp; Perolehan Lead</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenImportExcel && (
            <button
              onClick={onOpenImportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs transition"
            >
              <Upload className="h-3.5 w-3.5 text-emerald-600" />
              <span>Impor Excel</span>
            </button>
          )}
          <button
            onClick={() => {
              setForm({
                id: uid(),
                date: today(),
                channel: 'Instagram',
                type: 'Post organik / Iklan',
                name: '',
                spend: 0,
                reach: 2500,
                clicks: 120,
                leads: 5,
                url: '',
                note: '',
              });
              setIsOpen(true);
            }}
            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            + Aktivitas Marketing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-400">Total Biaya Marketing</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{idr(totalSpend)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-400">Total Lead Masuk</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{totalLeads} Lead</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-400">Rata-rata Cost Per Lead (CPL)</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{idr(avgCpl)}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Kanal Platform</th>
              <th className="py-3 px-4">Nama Kampanye / Konten</th>
              <th className="py-3 px-4">Link Publikasi</th>
              <th className="py-3 px-4 text-right">Biaya (Rp)</th>
              <th className="py-3 px-4 text-center">Reach</th>
              <th className="py-3 px-4 text-center">Klik</th>
              <th className="py-3 px-4 text-center font-bold">Lead</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {mkt.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Belum ada aktivitas marketing. Klik tombol Tambah atau Impor Excel di atas.
                </td>
              </tr>
            ) : (
              mkt.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono">{m.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${getChannelBadge(m.channel)}`}>
                      {m.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                    {m.note && <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{m.note}</div>}
                  </td>
                  <td className="py-3 px-4 max-w-[180px]">
                    {m.url ? (
                      <a
                        href={m.url.startsWith('http') ? m.url : `https://${m.url}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px] truncate max-w-full"
                        title={m.url}
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{m.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{idr(m.spend)}</td>
                  <td className="py-3 px-4 text-center font-mono">{m.reach.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-center font-mono">{m.clicks}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.leads}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => { setForm({ ...m }); setIsOpen(true); }}
                        className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus aktivitas marketing "${m.name}"?`)) {
                              onDeleteMkt(m.id);
                            }
                          }}
                          className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                          title="Hapus Data (Khusus Akun Admin)"
                        >
                          Hapus
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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Aktivitas Digital Marketing</h3>
            <p className="text-xs text-slate-500 mt-0.5">Input performa posting sosial media, webinar, exhibition, dan perolehan lead</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold">Nama Kampanye / Judul Konten *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Reels Edukasi Analisis XRF Nikel Laterit"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Kanal Platform</label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    {MARKETING_CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Tanggal</label>
                  <input
                    type="date"
                    value={form.date || today()}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Link Publikasi / URL Konten</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/p/... atau https://linkedin.com/..."
                  value={form.url || ''}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-[10px] text-slate-400">Tautan langsung ke postingan, materi exhibition, atau artikel</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Biaya Iklan / Event (Rp)</label>
                  <input
                    type="number"
                    value={form.spend || 0}
                    onChange={(e) => setForm({ ...form, spend: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Lead Didapat</label>
                  <input
                    type="number"
                    value={form.leads || 0}
                    onChange={(e) => setForm({ ...form, leads: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Reach (Jangkauan)</label>
                  <input
                    type="number"
                    value={form.reach || 0}
                    onChange={(e) => setForm({ ...form, reach: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Klik / Interaksi</label>
                  <input
                    type="number"
                    value={form.clicks || 0}
                    onChange={(e) => setForm({ ...form, clicks: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan respon audiens, feedback peserta, atau segmen industri yang tertarik..."
                  value={form.note || ''}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded border px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">Batal</button>
                <button type="submit" className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. INSTRUMENTS EVENT & DOWNTIME
const DOWNTIME_REASONS = [
  'Kalibrasi Rutin (ISO 17025)',
  'Preventive Maintenance (PM) Berkala',
  'Penggantian Spare Part & Konsumabel',
  'Troubleshooting Gangguan Kelistrikan / Optik',
  'Kebocoran Gas Carrier / Argon / N2 UHP',
  'Kontaminasi Detektor / Ion Source Cleaning',
  'Verifikasi Ulang QC Blank / Drift Sensitivitas',
  'Pelatihan & Kualifikasi Analis Baru',
  'Kerusakan Sistem Pendingin / Chiller / Pompa Vakum',
  'Gangguan Suplai Listrik PLN / Stabilizer / UPS',
  'Kendala Software / Firmware / Komunikasi Data',
  'Investigasi Kendala Khusus / Lainnya',
];

export const InstrumentsView: React.FC<{
  events: InstrumentEvent[];
  insts: AppState['insts'];
  onSaveEvent: (ev: InstrumentEvent) => void;
  onDeleteEvent: (id: string) => void;
  isAdmin?: boolean;
}> = ({ events, insts, onSaveEvent, onDeleteEvent, isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<InstrumentEvent>>({
    name: insts[0]?.name || 'SEM',
    type: 'Downtime',
    cat: DOWNTIME_REASONS[2],
    date: today(),
    hours: 4,
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEvent({
      id: form.id || uid(),
      name: form.name || 'SEM',
      type: (form.type as any) || 'Downtime',
      cat: form.cat || DOWNTIME_REASONS[0],
      date: form.date || today(),
      hours: Number(form.hours) || 0,
      note: form.note || '',
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-600" />
            <span>Kejadian Downtime &amp; Pemeliharaan Instrumen</span>
          </h2>
        </div>
        <button
          onClick={() => {
            setForm({
              id: uid(),
              name: insts[0]?.name || 'SEM',
              type: 'Downtime',
              cat: DOWNTIME_REASONS[3],
              date: today(),
              hours: 4,
              note: '',
            });
            setIsOpen(true);
          }}
          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          + Catat Kejadian / Downtime
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4">Instrumen</th>
              <th className="py-3 px-4">Jenis Kejadian</th>
              <th className="py-3 px-4">Alasan / Kategori Downtime</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4 text-center">Durasi Downtime</th>
              <th className="py-3 px-4">Catatan Tindakan / Investigasi</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Tidak ada catatan kejadian downtime atau pemeliharaan.
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{ev.name}</td>
                  <td className="py-3 px-4">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      ev.type === 'Downtime' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' :
                      ev.type === 'Kalibrasi' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px]">
                      {ev.cat || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{ev.date}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                    {ev.hours > 0 ? `${ev.hours} Jam` : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{ev.note || '-'}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => { setForm({ ...ev }); setIsOpen(true); }}
                        className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus catatan kejadian ${ev.name} (${ev.type})?`)) {
                              onDeleteEvent(ev.id);
                            }
                          }}
                          className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                          title="Hapus Kejadian (Khusus Akun Admin)"
                        >
                          Hapus
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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Catat Kejadian &amp; Downtime Instrumen</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dokumentasi penyebab gangguan teknis untuk continuous improvement ISO 17025</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold">Instrumen Pengujian</label>
                <select value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                  {insts.map((i) => (<option key={i.id} value={i.name}>{i.name} ({i.brand})</option>))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Jenis Kejadian</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                    <option value="Downtime">Downtime Operasional</option>
                    <option value="Kalibrasi">Kalibrasi Akreditasi</option>
                    <option value="PM">Preventive Maintenance (PM)</option>
                    <option value="Troubleshooting">Troubleshooting / Perbaikan</option>
                    <option value="Verifikasi QC">Verifikasi QC &amp; Blank</option>
                    <option value="Pelatihan Analis">Pelatihan Analis Baru</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Durasi Downtime (Jam)</label>
                  <input type="number" value={form.hours || 0} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} className="mt-1 w-full rounded border border-slate-300 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Penyebab / Kategori Gangguan</label>
                <select
                  value={form.cat}
                  onChange={(e) => setForm({ ...form, cat: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {DOWNTIME_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">Tanggal Kejadian</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              </div>

              <div>
                <label className="text-xs font-semibold">Keterangan / Tindakan Perbaikan</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsikan gejala awal, tindakan perbaikan, spare part yang diganti, dan hasil verifikasi QC..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded border px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">Batal</button>
                <button type="submit" className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. INVENTORY VIEW
export const InventoryView: React.FC<{
  inv: InventoryItem[];
  insts: AppState['insts'];
  onSaveInv: (item: InventoryItem) => void;
  onDeleteInv: (id: string) => void;
}> = ({ inv, insts, onSaveInv, onDeleteInv }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<InventoryItem>>({
    name: '',
    inst: 'SEM',
    unit: 'pcs',
    stock: 5,
    min: 2,
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInv({
      id: form.id || uid(),
      name: form.name || 'Item Baru',
      inst: form.inst || 'Umum',
      unit: form.unit || 'pcs',
      stock: Number(form.stock) || 0,
      min: Number(form.min) || 0,
      note: form.note || '',
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <span>Inventori Reagen &amp; Consumables</span>
          </h2>
        </div>
        <button onClick={() => { setForm({ id: uid(), name: '', inst: 'SEM', unit: 'pcs', stock: 5, min: 2, note: '' }); setIsOpen(true); }} className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
          + Tambah Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4">Nama Item Consumable</th>
              <th className="py-3 px-4">Untuk Instrumen</th>
              <th className="py-3 px-4">Satuan</th>
              <th className="py-3 px-4 text-center">Stok Saat Ini</th>
              <th className="py-3 px-4 text-center">Batas Minimum</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Catatan Part</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {inv.map((item) => {
              const isLow = (Number(item.stock) || 0) <= (Number(item.min) || 0);
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-3 px-4">{item.inst || 'Umum'}</td>
                  <td className="py-3 px-4 text-slate-600">{item.unit}</td>
                  <td className="py-3 px-4 text-center font-bold font-mono">{item.stock}</td>
                  <td className="py-3 px-4 text-center font-mono">{item.min}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isLow ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isLow ? 'Stok Kritis' : 'Aman'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{item.note || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setForm({ ...item }); setIsOpen(true); }} className="rounded border border-slate-300 px-2 py-1 text-[11px] mr-1">Edit</button>
                    <button onClick={() => onDeleteInv(item.id)} className="rounded border border-slate-300 px-2 py-1 text-[11px] text-rose-600">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Inventori Item</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold">Nama Item</label>
                <input type="text" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Instrumen</label>
                  <select value={form.inst} onChange={(e) => setForm({ ...form, inst: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800">
                    <option value="Umum">Umum (Semua)</option>
                    {insts.map((i) => (<option key={i.id} value={i.name}>{i.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Satuan</label>
                  <input type="text" value={form.unit || 'pcs'} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Stok Saat Ini</label>
                  <input type="number" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Batas Minimum</label>
                  <input type="number" value={form.min || 0} onChange={(e) => setForm({ ...form, min: Number(e.target.value) })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Catatan / No. Part</label>
                <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded border px-3 py-1.5 text-xs">Batal</button>
                <button type="submit" className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. CATALOG VIEW
export const CatalogView: React.FC<{
  cat: ServiceCatalog[];
  onSaveCat: (item: ServiceCatalog) => void;
  onDeleteCat: (id: string) => void;
}> = ({ cat, onSaveCat, onDeleteCat }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<ServiceCatalog>>({
    d: '',
    m: 'XRD',
    p: 650000,
    status: 'Tersedia',
    closedReason: '',
    closedFrom: today(),
    closedUntil: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCat({
      id: form.id || uid(),
      d: form.d || '',
      m: form.m || '',
      p: Number(form.p) || 0,
      status: form.status || 'Tersedia',
      closedReason: form.status !== 'Tersedia' ? (form.closedReason || '') : undefined,
      closedFrom: form.status !== 'Tersedia' ? (form.closedFrom || today()) : undefined,
      closedUntil: form.status !== 'Tersedia' ? (form.closedUntil || '') : undefined,
    });
    setIsOpen(false);
  };

  const toggleServiceStatus = (item: ServiceCatalog) => {
    const isCurrentlyClosed = item.status === 'Ditutup Sementara' || item.status === 'Maintenance';
    if (isCurrentlyClosed) {
      onSaveCat({
        ...item,
        status: 'Tersedia',
        closedReason: undefined,
        closedFrom: undefined,
        closedUntil: undefined,
      });
    } else {
      const reason = window.prompt(
        `Masukkan catatan keterangan mengapa layanan "${item.d}" sedang ditutup:`,
        'Pemeliharaan & kalibrasi berkala instrumen (layanan ditutup sementara)'
      );
      if (reason !== null) {
        onSaveCat({
          ...item,
          status: 'Ditutup Sementara',
          closedReason: reason.trim() || 'Layanan sedang ditutup sementara.',
          closedFrom: today(),
          closedUntil: '',
        });
      }
    }
  };

  const filtered = cat.filter((c) =>
    c.d.toLowerCase().includes(search.toLowerCase()) ||
    c.m.toLowerCase().includes(search.toLowerCase()) ||
    (c.closedReason || '').toLowerCase().includes(search.toLowerCase())
  );

  const closedCount = cat.filter((c) => c.status === 'Ditutup Sementara' || c.status === 'Maintenance').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span>Katalog Layanan &amp; Status Operasional</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {closedCount > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{closedCount} Layanan Ditutup</span>
            </span>
          )}
          <button
            onClick={() => {
              setForm({
                id: uid(),
                d: '',
                m: 'XRD',
                p: 650000,
                status: 'Tersedia',
                closedReason: '',
                closedFrom: today(),
                closedUntil: '',
              });
              setIsOpen(true);
            }}
            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            + Tambah Layanan
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama layanan, metode (SEM, XRD, FTIR), status penutupan, atau catatan keterangan..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4">Deskripsi Layanan Pengujian</th>
              <th className="py-3 px-4">Metode Uji</th>
              <th className="py-3 px-4">Status &amp; Keterangan Penutupan</th>
              <th className="py-3 px-4 text-right">Harga Satuan (Rp)</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Belum ada item layanan.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isClosed = item.status === 'Ditutup Sementara' || item.status === 'Maintenance';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.d}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        {item.m || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isClosed ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{item.status || 'Ditutup Sementara'}</span>
                          </span>
                          {item.closedReason && (
                            <p className="text-[11px] text-rose-700 dark:text-rose-400 italic">
                              Catatan: {item.closedReason}
                            </p>
                          )}
                          {(item.closedFrom || item.closedUntil) && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Periode: {item.closedFrom || 'Sekarang'} {item.closedUntil ? `s/d ${item.closedUntil}` : ''}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Tersedia</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {idr(item.p)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleServiceStatus(item)}
                          className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                            isClosed
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                          title={isClosed ? 'Buka kembali layanan ini' : 'Tutup sementara layanan ini'}
                        >
                          {isClosed ? 'Buka Kembali' : 'Tutup Layanan'}
                        </button>
                        <button
                          onClick={() => {
                            setForm({
                              ...item,
                              status: item.status || 'Tersedia',
                              closedReason: item.closedReason || '',
                              closedFrom: item.closedFrom || today(),
                              closedUntil: item.closedUntil || '',
                            });
                            setIsOpen(true);
                          }}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] hover:bg-slate-50 dark:border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteCat(item.id)}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:border-slate-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {form.id ? 'Edit Item Layanan & Status' : 'Tambah Layanan Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi Layanan Pengujian
                </label>
                <input
                  type="text"
                  required
                  value={form.d || ''}
                  onChange={(e) => setForm({ ...form, d: e.target.value })}
                  placeholder="Contoh: Jasa analisa: Difraksi Sinar-X (XRD)"
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Metode Uji / Kode
                  </label>
                  <input
                    type="text"
                    value={form.m || ''}
                    onChange={(e) => setForm({ ...form, m: e.target.value })}
                    placeholder="Contoh: XRD, SEM, ICP-OES"
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={form.p || 0}
                    onChange={(e) => setForm({ ...form, p: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Status Layanan: Tersedia vs Ditutup Sementara vs Maintenance */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Status Operasional Layanan</span>
                  </label>
                  <select
                    value={form.status || 'Tersedia'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition ${
                      form.status === 'Ditutup Sementara'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        : form.status === 'Maintenance'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <option value="Tersedia">Tersedia (Buka)</option>
                    <option value="Ditutup Sementara">Ditutup Sementara</option>
                    <option value="Maintenance">Maintenance / Perawatan</option>
                  </select>
                </div>

                {form.status !== 'Tersedia' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                        Catatan Keterangan Layanan Ditutup:
                      </label>
                      <textarea
                        rows={2}
                        value={form.closedReason || ''}
                        onChange={(e) => setForm({ ...form, closedReason: e.target.value })}
                        placeholder="Contoh: Tabung sinar-X sedang penggantian & kalibrasi tahunan KAN, atau permintaan customer ditunda"
                        className="mt-1 w-full rounded border border-rose-200 p-2 text-xs dark:bg-slate-900 dark:border-rose-900/60"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Tanggal Mulai Penutupan:
                        </label>
                        <input
                          type="date"
                          value={form.closedFrom || today()}
                          onChange={(e) => setForm({ ...form, closedFrom: e.target.value })}
                          className="mt-1 w-full rounded border border-slate-300 p-1.5 text-xs dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Estimasi Selesai / Buka Kembali:
                        </label>
                        <input
                          type="date"
                          value={form.closedUntil || ''}
                          onChange={(e) => setForm({ ...form, closedUntil: e.target.value })}
                          className="mt-1 w-full rounded border border-slate-300 p-1.5 text-xs dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      *Status penutupan layanan ini akan otomatis dimasukkan dan ditampilkan dalam Kalender Terpadu &amp; peringatan work order.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsView: React.FC<{
  settings: AppState['settings'];
  onSaveSettings: (s: AppState['settings']) => void;
  onSyncNow: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportExcel?: () => void;
  onResetAllData?: () => void;
  onClearLogs?: () => void;
  isAdmin?: boolean;
}> = ({ settings, onSaveSettings, onSyncNow, onExportJson, onImportJson, onExportExcel, onResetAllData, onClearLogs, isAdmin = true }) => {
  const [co, setCo] = useState<CompanyProfile>(settings.co);
  const [waNumber, setWaNumber] = useState(settings.waNumber || '628119811562');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      co,
      waNumber,
    });
    alert('Pengaturan perusahaan & integrasi berhasil disimpan.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-600" />
          <span>Pengaturan Perusahaan, Sinkronisasi Awan &amp; Integrasi</span>
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Status Sinkronisasi Awan &amp; Cadangan Database</h3>
        <div className="flex flex-wrap items-center gap-3">
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs"
              title="Ekspor seluruh data terintegrasi ke workbook Excel multi-sheet"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
          )}
          <button onClick={onSyncNow} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
            <Cloud className="h-3.5 w-3.5" />
            <span>Sinkronkan Sekarang ke Awan</span>
          </button>
          <button onClick={onExportJson} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" />
            <span>Unduh Backup JSON</span>
          </button>
          <label className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            <span>Pulihkan dari JSON</span>
            <input type="file" accept=".json" onChange={onImportJson} hidden />
          </label>
        </div>
      </div>

      {/* Admin Maintenance Box: Kosongkan Semua Data & Hapus History Log Book */}
      {isAdmin && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                Kontrol Pemeliharaan &amp; Data Sistem (Khusus Admin)
              </h3>
            </div>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
              Akses Admin Aktif
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Fitur khusus administrator untuk membersihkan data contoh / dummy agar sistem siap digunakan untuk operasional riil (0 data), atau menghapus riwayat audit trail Log Book.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {onResetAllData && (
              <button
                type="button"
                onClick={onResetAllData}
                className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-600 hover:text-white dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-700 transition active:scale-95"
                title="Hapus semua data kontak, deal, lab, invoice, dan agenda agar sistem siap pakai dari nol"
              >
                <Trash2 className="h-4 w-4" />
                <span>Kosongkan Semua Data</span>
              </button>
            )}
            {onClearLogs && (
              <button
                type="button"
                onClick={onClearLogs}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-700 shadow-2xs hover:bg-amber-600 hover:text-white dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-700 transition active:scale-95"
                title="Bersihkan riwayat aktivitas Log Book"
              >
                <History className="h-4 w-4" />
                <span>Hapus History Log Book</span>
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profil Kop Surat, Identitas &amp; Penandatangan PDF</h3>
            <p className="text-[11px] text-slate-400">Identitas resmi PT NUSA VERITAS INSPEKTAMA dan kop surat penawaran / invoice</p>
          </div>
        </div>

        {/* Official Brand Logo Banner */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="h-12 w-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/Abstract_Blue_Molecular_Network_fe9a48c2.png"
              alt="Logo Resmi PT Nusa Veritas Inspektama"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Icon Jaringan Molekular Resmi
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Aktif &amp; Resolusi Tinggi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tampil presisi di Bilah Navigasi, Sidebar, Papan Kontrol, Favicon Browser, serta Dokumen Eksekutif.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold">Nama Perusahaan</label>
            <input type="text" value={co.name} onChange={(e) => setCo({ ...co, name: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold">Telepon Kantor</label>
            <input type="text" value={co.phone} onChange={(e) => setCo({ ...co, phone: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold">Email Layanan</label>
            <input type="email" value={co.email} onChange={(e) => setCo({ ...co, email: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold">Nomor WhatsApp Gateway Layanan</label>
            <input type="text" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="628..." className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold">Alamat Kantor Pusat &amp; Laboratorium</label>
          <textarea rows={4} value={co.addr} onChange={(e) => setCo({ ...co, addr: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold">Nama Penandatangan Resmi</label>
            <input type="text" value={co.signer} onChange={(e) => setCo({ ...co, signer: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold">Jabatan</label>
            <input type="text" value={co.title} onChange={(e) => setCo({ ...co, title: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold">Rekening Bank untuk Invoice</label>
          <textarea rows={2} value={co.bank} onChange={(e) => setCo({ ...co, bank: e.target.value })} className="mt-1 w-full rounded border p-2 text-xs dark:bg-slate-800" />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
