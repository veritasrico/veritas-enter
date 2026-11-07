import { getSqlAppState, setSqlAppState, clearSqlAppState } from './_sql';
import { fetchFromSupabase, saveToSupabase, resetSupabase } from './_supabase';

export interface Env {
  DB?: D1Database;
  VERITAS_KV?: KVNamespace;
  KV?: KVNamespace;
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
}

export const INITIAL_SEED_DATA = {
  accounts: [],
  deals: [],
  acts: [],
  mkt: [],
  quotes: [],
  labs: [],
  instr: [],
  insts: [
    {
      id: "inst-1",
      name: "SEM",
      brand: "JEOL JSM-IT200",
      pic: "Analis SEM",
      target: 20,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "Scanning Electron Microscope & EDS"
    },
    {
      id: "inst-2",
      name: "XRD",
      brand: "BRUKER D8 Advance",
      pic: "Analis XRD",
      target: 20,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "X-Ray Diffraction"
    },
    {
      id: "inst-3",
      name: "ICP-OES",
      brand: "Thermo Scientific iCAP PRO",
      pic: "Analis Kimia",
      target: 15,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "Inductively Coupled Plasma Optical Emission"
    },
    {
      id: "inst-4",
      name: "FTIR",
      brand: "Shimadzu IRTracer-100",
      pic: "Analis Spektroskopi",
      target: 15,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "Fourier Transform Infrared"
    },
    {
      id: "inst-5",
      name: "HPLC",
      brand: "Agilent 1260 Infinity II",
      pic: "Analis Kromatografi",
      target: 10,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "High Performance Liquid Chromatography"
    },
    {
      id: "inst-6",
      name: "GC-MS",
      brand: "Thermo TRACE 1310 / ISQ",
      pic: "Analis GC-MS",
      target: 8,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "Gas Chromatography - Mass Spectrometry"
    },
    {
      id: "inst-7",
      name: "XRF",
      brand: "BRUKER S2 PUMA",
      pic: "Analis XRF",
      target: 15,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "X-Ray Fluorescence"
    },
    {
      id: "inst-8",
      name: "UV-Vis",
      brand: "HORIBA Duetta",
      pic: "Analis Spektroskopi",
      target: 12,
      ops: 8,
      int: 365,
      last: "",
      pmInt: 180,
      pmLast: "",
      note: "UV-Vis Spectrophotometer"
    }
  ],
  inv: [],
  fins: [],
  cat: [
    { id: 'cat-1', d: 'Jasa analisa: Difraksi Sinar-X (XRD)', m: 'XRD', p: 650000 },
    { id: 'cat-2', d: 'Jasa analisa: Scanning Electron Microscopy (SEM)', m: 'SEM', p: 600000 },
    { id: 'cat-3', d: 'Karakteristik lanjut: Fitur EDS Elemental Analysis', m: 'EDS', p: 200000 },
    { id: 'cat-4', d: 'Jasa analisa: ICP-OES Trace Elements', m: 'ICP-OES', p: 450000 },
    { id: 'cat-5', d: 'Jasa analisa: FTIR Spectroscopy', m: 'FTIR', p: 300000 },
    { id: 'cat-6', d: 'Jasa analisa: HPLC Kromatografi Cair', m: 'HPLC', p: 550000 },
    { id: 'cat-7', d: 'Jasa analisa: GC-MS Gas Chromatography', m: 'GC-MS', p: 750000 },
    { id: 'cat-8', d: 'Jasa analisa: X-Ray Fluorescence (XRF)', m: 'XRF', p: 350000 },
    { id: 'cat-9', d: 'Jasa analisa: UV-Vis Spectrophotometer', m: 'UV-Vis', p: 150000 },
    { id: 'cat-10', d: 'Jasa Interpretasi & Analisis Rietveld XRD', m: 'XRD', p: 1000000 }
  ],
  log: [],
  qcqa: {
    checks: {},
    actions: [],
    gaps: {}
  },
  users: [
    {
      id: 'usr-admin',
      username: 'admin',
      name: 'Ricoh Sutrisno',
      role: 'admin',
      department: 'Manajemen Eksekutif & Teknis Laboratorium',
      pin: '1234',
      allowedTabs: [
        'dash', 'slide_export', 'ai_analytics', 'cal',
        'accounts', 'deals', 'quote', 'acts',
        'mkt',
        'labdash', 'lab', 'instr',
        'qcqa',
        'fin', 'monthly_report',
        'procurement', 'inv', 'sample_logistics',
        'competency', 'employees', 'users', 'log', 'set'
      ],
      isActive: true,
      createdAt: '2026-01-01',
      note: 'Administrator Utama & Penanggung Jawab Teknis Lab'
    }
  ],
  procurements: [],
  deliveries: [],
  competencies: [],
  employees: [],
  settings: {
    co: {
      name: "PT NUSA VERITAS INSPEKTAMA",
      addr: "Head Office:\nBusiness Park Kebun Jeruk Blok F2 No. 10. Jl. Meruya Ilir, Meruya Utara, Kembangan, Jakarta Barat, Jakarta 11620\n\nLaboratory:\nKawasan Sains & Teknologi B.J. Habibie, Gedung 442, Setu, South Tangerang City, Banten 15314",
      phone: "+62 21 293 257 39",
      email: "layanan@veritaslab.co.id",
      bank: "Bank Mandiri KCP Jakarta\nNo. Rek: 133-00-987654-1\na.n. PT NUSA VERITAS INSPEKTAMA",
      terms: "1. Pembayaran tempo 30 hari kalender setelah invoice diterima.\n2. Laporan hasil uji (Certificate of Analysis) diterbitkan setelah pelunasan invoice.\n3. Sampel sisa uji disimpan maksimal 14 hari kerja sebelum dimusnahkan.",
      ppn: 11,
      signer: "Ricoh Sutrisno",
      title: "Laboratory Manager acting as General Manager",
      logo: "/assets/aistudio/Abstract_Blue_Molecular_Network_fe9a48c2.png",
      tpl: "modern",
      accent: "#0f6e56",
      intro: "Bersama surat ini kami sampaikan rincian penawaran harga pengujian laboratorium terakreditasi untuk kebutuhan perusahaan/institusi Anda:",
      outro: "Besar harapan kami dapat mendukung keandalan riset serta standar industri Anda. Untuk koordinasi pengiriman sampel dan teknis pengujian, silakan hubungi tim kami.",
      invIntro: "Bersama ini kami sampaikan tagihan resmi atas jasa analisa laboratorium yang telah diselesaikan dengan rincian berikut:",
      invTerms: "Pembayaran wajib mencantumkan Nomor Invoice pada berita transfer. Bukti transfer dikirimkan via WhatsApp layanan kami.",
      invOutro: "Terima kasih atas kepercayaan Anda bermitra dengan PT NUSA VERITAS INSPEKTAMA."
    },
    int: {
      wa: {
        on: true,
        ref: "628119811562",
        note: "Gateway WhatsApp Business Layanan PT NUSA VERITAS INSPEKTAMA (+62 811 9811 562)"
      },
      gcal: {
        on: true,
        ref: "calendar@veritaslab.co.id",
        note: "Sinkronisasi jadwal follow-up"
      },
      api: {
        on: true,
        ref: "/api/reports/monthly",
        note: "Endpoint integrasi laporan bulanan aktif"
      }
    },
    waNumber: "628119811562",
    autoReminders: true,
    cloudSyncIntervalSec: 30
  }
};

let inMemoryDb: any = null;
let inMemoryTimestamp = new Date().toISOString();

export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function getDatabase(env: Env): Promise<{ data: any; syncedAt: string }> {
  // 1. Prioritize Supabase PostgreSQL Database
  try {
    const supa = await fetchFromSupabase(env);
    if (supa && supa.data) {
      return supa;
    }
  } catch (err) {
    console.warn('Supabase get error:', err);
  }

  // 2. Try Cloudflare D1 SQL Database
  if (env.DB) {
    return await getSqlAppState(env);
  }

  // 3. Try KV Storage
  const kv = env.VERITAS_KV || env.KV;
  if (kv) {
    try {
      const stored = await kv.get('cloud_database', 'json');
      if (stored && typeof stored === 'object') {
        const item = stored as { data: any; syncedAt: string };
        return {
          data: item.data || item,
          syncedAt: item.syncedAt || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('KV read error:', e);
    }
  }

  // 4. Fallback to in-memory cache
  if (inMemoryDb) {
    return { data: inMemoryDb, syncedAt: inMemoryTimestamp };
  }

  return { data: INITIAL_SEED_DATA, syncedAt: inMemoryTimestamp };
}

export async function setDatabase(env: Env, data: any, syncedAt: string): Promise<boolean> {
  let supabaseOk = false;

  // 1. Write to Supabase PostgreSQL Database
  try {
    supabaseOk = await saveToSupabase(env, data, syncedAt);
  } catch (err) {
    console.warn('Supabase save error:', err);
  }

  // 2. Write to Cloudflare D1 SQL Database
  if (env.DB) {
    await setSqlAppState(env, data, syncedAt);
  }

  // 3. Write to KV if present
  const kv = env.VERITAS_KV || env.KV;
  if (kv) {
    try {
      await kv.put('cloud_database', JSON.stringify({ data, syncedAt }));
    } catch (e) {
      console.warn('KV write error:', e);
    }
  }

  inMemoryDb = data;
  inMemoryTimestamp = syncedAt;

  return supabaseOk;
}

export async function clearDatabase(env: Env): Promise<void> {
  try {
    await resetSupabase(env);
  } catch (err) {
    console.warn('Supabase reset error:', err);
  }

  if (env.DB) {
    await clearSqlAppState(env);
  }

  const kv = env.VERITAS_KV || env.KV;
  if (kv) {
    try {
      await kv.delete('cloud_database');
    } catch (e) {
      console.warn('KV delete error:', e);
    }
  }

  inMemoryDb = null;
  inMemoryTimestamp = new Date().toISOString();
}
