import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env } from './_shared';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(env: Env): SupabaseClient | null {
  const url = (env as any).SUPABASE_URL || 'https://xirjwumegtyxwcullegn.supabase.co';
  const key =
    (env as any).SUPABASE_SECRET_KEY ||
    (env as any).SUPABASE_ANON_KEY ||
    (env as any).SUPABASE_PUBLISHABLE_KEY ||
    'sb_secret_x37t_gHAS6SXUcUFRjPySw_1NWNVv_Y';

  if (!url || !key) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

export async function fetchFromSupabase(env: Env): Promise<{ data: any; syncedAt: string } | null> {
  const client = getSupabase(env);
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('app_state')
      .select('data, synced_at')
      .eq('key', 'current')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    if (data && data.data) {
      return {
        data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data,
        syncedAt: data.synced_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('Supabase fetch exception:', err);
  }
  return null;
}

export async function saveToSupabase(env: Env, data: any, syncedAt: string): Promise<boolean> {
  const client = getSupabase(env);
  if (!client) return false;

  try {
    // 1. Save full state snapshot to app_state table
    const { error } = await client
      .from('app_state')
      .upsert({
        key: 'current',
        data,
        synced_at: syncedAt,
      });

    if (error) {
      console.warn('Supabase upsert error:', error.message);
    }

    // 2. Also sync relational accounts
    if (Array.isArray(data.accounts) && data.accounts.length > 0) {
      const records = data.accounts.map((a: any) => ({
        id: a.id,
        name: a.name || '',
        pic: a.pic || '',
        industry: a.industry || '',
        email: a.email || '',
        phone: a.phone || '',
        source: a.source || '',
        addr: a.addr || '',
        notes: a.notes || '',
        last_contact_date: a.lastContactDate || '',
        referral_status: a.referralStatus || '',
      }));
      await client.from('accounts').upsert(records);
    }

    // 3. Also sync relational deals
    if (Array.isArray(data.deals) && data.deals.length > 0) {
      const records = data.deals.map((d: any) => ({
        id: d.id,
        title: d.title || '',
        acc_id: d.accId || null,
        value: Number(d.value) || 0,
        stage: d.stage || 'Lead',
        owner: d.owner || '',
        close_date: d.close || '',
        probability: Number(d.probability) || 0,
        service_status: d.serviceStatus || 'Normal',
        service_closed_note: d.serviceClosedNote || '',
        closed_from: d.closedFrom || '',
        closed_until: d.closedUntil || '',
      }));
      await client.from('deals').upsert(records);
    }

    return true;
  } catch (err) {
    console.warn('Supabase save exception:', err);
    return false;
  }
}

export async function resetSupabase(env: Env): Promise<boolean> {
  const client = getSupabase(env);
  if (!client) return false;

  try {
    await client.from('app_state').delete().eq('key', 'current');
    await client.from('accounts').delete().neq('id', '___');
    await client.from('deals').delete().neq('id', '___');
    await client.from('lab_work_orders').delete().neq('id', '___');
    await client.from('invoices').delete().neq('id', '___');
    return true;
  } catch (err) {
    console.warn('Supabase reset error:', err);
    return false;
  }
}
