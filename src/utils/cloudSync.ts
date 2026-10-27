import { AppState } from '../types';

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
  try {
    saveLocalState(state);
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: state,
        clientTimestamp: new Date().toISOString(),
      }),
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Gagal menyinkronkan data`);
    }

    const data = await res.json();
    return {
      success: true,
      latencyMs: Math.max(12, latencyMs),
      syncedAt: data.syncedAt || new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Math.round(performance.now() - start),
      syncedAt: new Date().toISOString(),
      error: err?.message || 'Koneksi awan terputus',
    };
  }
}

export async function fetchFromCloud(): Promise<{ hasData: boolean; data: AppState | null; syncedAt: string }> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) throw new Error('Gagal mengambil data awan');
    const json = await res.json();
    return {
      hasData: !!json.hasData && !!json.data,
      data: json.data,
      syncedAt: json.syncedAt,
    };
  } catch (err) {
    console.warn('Fallback to local storage:', err);
    const local = loadLocalState();
    return {
      hasData: !!local,
      data: local,
      syncedAt: new Date().toISOString(),
    };
  }
}
