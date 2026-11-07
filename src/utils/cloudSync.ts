import { AppState } from '../types';
import { supabase } from './supabase';

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'error' | 'offline';
  lastSyncedAt: string;
  latencyMs: number;
  message: string;
}

const STORAGE_KEY = 'veritas_enterprise_state_clean_v1';
const LEGACY_STORAGE_KEYS = [
  'veritas_enterprise_state_v7',
  'veritas_enterprise_state_v6',
  'veritas_enterprise_state_v5',
  'veritas_enterprise_state_v4',
  'veritas_enterprise_state_v3',
  'veritas_enterprise_state_v2',
  'veritas_crm_state_v1',
];

/**
 * Normalize state to ensure all expected array/object keys exist.
 * Prevents crashes when cloud data is missing newly added modules.
 */
export function normalizeState(raw: any): AppState {
  return {
    accounts: Array.isArray(raw.accounts) ? raw.accounts : [],
    deals: Array.isArray(raw.deals) ? raw.deals : [],
    acts: Array.isArray(raw.acts) ? raw.acts : [],
    mkt: Array.isArray(raw.mkt) ? raw.mkt : [],
    quotes: Array.isArray(raw.quotes) ? raw.quotes : [],
    labs: Array.isArray(raw.labs) ? raw.labs : [],
    instr: Array.isArray(raw.instr) ? raw.instr : [],
    insts: Array.isArray(raw.insts) ? raw.insts : [],
    inv: Array.isArray(raw.inv) ? raw.inv : [],
    fins: Array.isArray(raw.fins) ? raw.fins : [],
    cat: Array.isArray(raw.cat) ? raw.cat : [],
    log: Array.isArray(raw.log) ? raw.log : [],
    settings: raw.settings && typeof raw.settings === 'object' && raw.settings.co ? raw.settings : undefined as any,
    qcqa: raw.qcqa || { checks: {}, actions: [], gaps: {} },
    users: Array.isArray(raw.users) ? raw.users : undefined,
    procurements: Array.isArray(raw.procurements) ? raw.procurements : [],
    deliveries: Array.isArray(raw.deliveries) ? raw.deliveries : [],
    competencies: Array.isArray(raw.competencies) ? raw.competencies : [],
    employees: Array.isArray(raw.employees) ? raw.employees : [],
  };
}

export const clearAllLocalData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Error clearing local state:', e);
  }
};

export const loadLocalState = (): AppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: AppState = JSON.parse(raw);

    // Only return null if data is corrupt or missing settings
    if (!parsed || !parsed.settings) {
      return null;
    }

    // If local state still has old dummy accounts or deals, clear and return null to use clean baseline
    if (
      parsed.accounts?.some((a) => a.id === 'acc-freeport' || a.id === 'acc-dewi') ||
      parsed.deals?.some((d) => d.id === 'deal-fp-xrd' || d.id === 'deal-1')
    ) {
      clearAllLocalData();
      return null;
    }

    // Auto-update company profile if using older entity name
    if (parsed.settings?.co && parsed.settings.co.name !== 'PT NUSA VERITAS INSPEKTAMA') {
      parsed.settings.co.name = 'PT NUSA VERITAS INSPEKTAMA';
      parsed.settings.co.signer = 'Ricoh Sutrisno';
      parsed.settings.co.title = 'Laboratory Manager acting as General Manager';
      parsed.settings.co.addr =
        'Head Office:\nBusiness Park Kebun Jeruk Blok F2 No. 10. Jl. Meruya Ilir, Meruya Utara, Kembangan, Jakarta Barat, Jakarta 11620\n\nLaboratory:\nKawasan Sains & Teknologi B.J. Habibie, Gedung 442, Setu, South Tangerang City, Banten 15314';
      parsed.settings.co.phone = '+62 21 293 257 39';
      parsed.settings.co.logo = '/assets/aistudio/Abstract_Blue_Molecular_Network_fe9a48c2.png';
      parsed.settings.waNumber = '628119811562';
      if (parsed.settings.int?.wa) {
        parsed.settings.int.wa.ref = '628119811562';
        parsed.settings.int.wa.note = 'Gateway WhatsApp Business Layanan PT NUSA VERITAS INSPEKTAMA (+62 811 9811 562)';
      }
      saveLocalState(parsed);
    }

    if (parsed.settings?.co && !parsed.settings.co.logo) {
      parsed.settings.co.logo = '/assets/aistudio/Abstract_Blue_Molecular_Network_fe9a48c2.png';
      saveLocalState(parsed);
    }

    return parsed;
  } catch (e) {
    console.error('Error loading local state:', e);
    return null;
  }
};

export const saveLocalState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving local state:', e);
  }
};

export async function syncToCloud(state: AppState): Promise<{ success: boolean; latencyMs: number; syncedAt: string; error?: string }> {
  const start = performance.now();
  saveLocalState(state);

  let workerSuccess = false;

  // 1. First attempt: Server API endpoint /api/sync
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: state,
        clientTimestamp: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      // Check if the Worker actually confirmed Supabase write
      if (data.supabaseOk !== false) {
        workerSuccess = true;
        const latencyMs = Math.round(performance.now() - start);
        return {
          success: true,
          latencyMs: Math.max(12, latencyMs),
          syncedAt: data.syncedAt || new Date().toISOString(),
        };
      }
      // Worker responded but Supabase save failed – fall through to direct
    }
  } catch (apiErr) {
    // Fall through to direct Supabase client
  }

  // 2. Second attempt: Direct Supabase client (always try if worker didn't confirm Supabase)
  if (!workerSuccess) {
    try {
      const now = new Date().toISOString();
      const { error: supaErr } = await supabase
        .from('app_state')
        .upsert({
          key: 'current',
          data: state,
          synced_at: now,
        });

      if (!supaErr) {
        const latencyMs = Math.round(performance.now() - start);
        return {
          success: true,
          latencyMs: Math.max(15, latencyMs),
          syncedAt: now,
        };
      }
      console.warn('Direct Supabase upsert error:', supaErr.message);
    } catch (supaEx) {
      console.warn('Direct Supabase sync fallback error:', supaEx);
    }
  }

  return {
    success: false,
    latencyMs: Math.round(performance.now() - start),
    syncedAt: new Date().toISOString(),
    error: 'Koneksi basis data terputus',
  };
}

export async function fetchFromCloud(): Promise<{ hasData: boolean; data: AppState | null; syncedAt: string; source?: string }> {
  // 1. First attempt: Server API endpoint /api/sync
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const json: any = await res.json();
      if (json.hasData && json.data) {
        const normalized = normalizeState(json.data);
        // Only accept cloud data if settings are valid (not seed/corrupted)
        if (normalized.settings && normalized.settings.co) {
          return {
            hasData: true,
            data: normalized,
            syncedAt: json.syncedAt || new Date().toISOString(),
            source: 'worker',
          };
        }
      }
    }
  } catch (apiErr) {
    console.warn('Worker /api/sync fetch error:', apiErr);
  }

  // 2. Second attempt: Direct Supabase client
  try {
    const { data: supaRow, error: supaErr } = await supabase
      .from('app_state')
      .select('data, synced_at')
      .eq('key', 'current')
      .maybeSingle();

    if (!supaErr && supaRow && supaRow.data) {
      const parsed = typeof supaRow.data === 'string' ? JSON.parse(supaRow.data) : supaRow.data;
      const normalized = normalizeState(parsed);
      if (normalized.settings && normalized.settings.co) {
        saveLocalState(normalized);
        return {
          hasData: true,
          data: normalized,
          syncedAt: supaRow.synced_at || new Date().toISOString(),
          source: 'supabase-direct',
        };
      }
    }
  } catch (supaEx) {
    console.warn('Direct Supabase fetch fallback error:', supaEx);
  }

  // 3. Fallback to localStorage (mark source so callers know it's stale)
  const local = loadLocalState();
  return {
    hasData: !!local,
    data: local,
    syncedAt: new Date().toISOString(),
    source: 'local-fallback',
  };
}
