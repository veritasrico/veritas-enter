import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env } from './_shared';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(env: Env): SupabaseClient | null {
  const url = (env as any).SUPABASE_URL || 'https://xirjwumegtyxwcullegn.supabase.co';
  // Prefer anon/publishable key – the old secret key is unregistered and causes silent failures
  const key =
    (env as any).SUPABASE_ANON_KEY ||
    (env as any).SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_t0nyWbcf-v2kYZOlbq5ZCQ_FEdICTHf';

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
      try {
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
      } catch (e) {
        console.warn('Deals table sync warning:', e);
      }
    }

    // 4. Also sync relational lab work orders
    if (Array.isArray(data.labs) && data.labs.length > 0) {
      try {
        const records = data.labs.map((l: any) => ({
          id: l.id,
          sid: l.sid || '',
          acc_id: l.accId || null,
          date: l.date || '',
          target_date: l.targetDate || '',
          service: l.service || '',
          sample_name: l.sampleName || '',
          masuk: Number(l.masuk) || 1,
          analisa: Number(l.analisa) || 0,
          sisa: Number(l.sisa) || 0,
          status: l.status || 'Antrean',
          analyst: l.analyst || '',
          note: l.note || '',
        }));
        await client.from('lab_work_orders').upsert(records);
      } catch (e) {
        console.warn('Lab work orders table sync warning:', e);
      }
    }

    // 5. Also sync relational invoices
    if (Array.isArray(data.fins) && data.fins.length > 0) {
      try {
        const records = data.fins.map((f: any) => ({
          id: f.id,
          no: f.no || '',
          acc_id: f.accId || null,
          deal_id: f.dealId || null,
          lab_id: f.labId || null,
          date: f.date || '',
          due: f.due || '',
          amount: Number(f.amount) || 0,
          paid: Number(f.paid) || 0,
          ppn: Number(f.ppn) || 0,
          perihal: f.perihal || '',
          note: f.note || '',
        }));
        await client.from('invoices').upsert(records);
      } catch (e) {
        console.warn('Invoices table sync warning:', e);
      }
    }

    // 6. Also sync relational instruments
    if (Array.isArray(data.insts) && data.insts.length > 0) {
      try {
        const records = data.insts.map((i: any) => ({
          id: i.id,
          name: i.name || '',
          brand: i.brand || '',
          pic: i.pic || '',
          target: Number(i.target) || 10,
          ops: Number(i.ops) || 8,
          int_days: Number(i.int) || 365,
          last_cal: i.last || '',
          pm_int_days: Number(i.pmInt) || 180,
          pm_last: i.pmLast || '',
          note: i.note || '',
        }));
        await client.from('instruments').upsert(records);
      } catch (e) {
        console.warn('Instruments table sync warning:', e);
      }
    }

    // 7. Also sync relational procurements
    if (Array.isArray(data.procurements) && data.procurements.length > 0) {
      try {
        const records = data.procurements.map((p: any) => ({
          id: p.id,
          po_number: p.poNumber || '',
          item_description: p.itemDescription || '',
          category: p.category || '',
          supplier: p.supplier || '',
          qty: Number(p.qty) || 1,
          unit: p.unit || '',
          est_cost: Number(p.estCost) || 0,
          requested_by: p.requestedBy || '',
          req_date: p.reqDate || '',
          target_date: p.targetDate || '',
          status: p.status || 'Diajukan',
          urgency: p.urgency || 'Biasa',
          notes: p.notes || '',
        }));
        await client.from('procurements').upsert(records);
      } catch (e) {
        console.warn('Procurements table sync warning:', e);
      }
    }

    // 8. Also sync relational sample deliveries
    if (Array.isArray(data.deliveries) && data.deliveries.length > 0) {
      try {
        const records = data.deliveries.map((d: any) => ({
          id: d.id,
          tracking_no: d.trackingNo || '',
          type: d.type || '',
          courier: d.courier || '',
          origin: d.origin || '',
          destination: d.destination || '',
          temp_condition: d.tempCondition || '',
          received_date: d.receivedDate || '',
          status: d.status || 'Diterima di Lab',
          receiver: d.receiver || '',
          seal_intact: d.sealIntact ?? true,
          notes: d.notes || '',
        }));
        await client.from('sample_deliveries').upsert(records);
      } catch (e) {
        console.warn('Deliveries table sync warning:', e);
      }
    }

    // 9. Also sync relational competencies
    if (Array.isArray(data.competencies) && data.competencies.length > 0) {
      try {
        const records = data.competencies.map((c: any) => ({
          id: c.id,
          employee_name: c.employeeName || '',
          nip_or_id: c.nipOrId || '',
          role: c.role || '',
          department: c.department || '',
          education: c.education || '',
          methods: c.methods || [],
          instruments: c.instruments || [],
          k3_certified: c.k3Certified ?? false,
          bnsp_certified: c.bnspCertified ?? false,
          last_evaluated: c.lastEvaluated || '',
          next_evaluation: c.nextEvaluation || '',
          status: c.status || 'Terkualifikasi Penuh',
          notes: c.notes || '',
        }));
        await client.from('competencies').upsert(records);
      } catch (e) {
        console.warn('Competencies table sync warning:', e);
      }
    }

    // 10. Also sync relational employees
    if (Array.isArray(data.employees) && data.employees.length > 0) {
      try {
        const records = data.employees.map((em: any) => ({
          id: em.id,
          name: em.name || '',
          nip: em.nip || '',
          email: em.email || '',
          phone: em.phone || '',
          department: em.department || '',
          position: em.position || '',
          join_date: em.joinDate || '',
          status: em.status || 'Aktif',
          emergency_contact: em.emergencyContact || '',
          notes: em.notes || '',
        }));
        await client.from('employees').upsert(records);
      } catch (e) {
        console.warn('Employees table sync warning:', e);
      }
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
