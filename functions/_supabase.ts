import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env } from './_shared';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(env: Env): SupabaseClient | null {
  const url = (env as any).SUPABASE_URL || 'https://xirjwumegtyxwcullegn.supabase.co';
  // Prefer secret key (bypasses RLS) for server-side Worker, fall back to anon/publishable
  const key =
    (env as any).SUPABASE_SECRET_KEY ||
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
    const validAccIds = new Set<string>();
    if (Array.isArray(data.accounts)) {
      try {
        if (data.accounts.length > 0) {
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
          const ids = records.map((a: any) => a.id);
          await client.from('accounts').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
          ids.forEach((id: string) => validAccIds.add(id));
        } else {
          await client.from('accounts').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Accounts table sync warning:', e);
      }
    }

    // 3. Also sync relational deals
    const validDealIds = new Set<string>();
    if (Array.isArray(data.deals)) {
      try {
        if (data.deals.length > 0) {
          const records = data.deals.map((d: any) => ({
            id: d.id,
            title: d.title || '',
            acc_id: validAccIds.has(d.accId) ? d.accId : null,
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
          const ids = records.map((d: any) => d.id);
          await client.from('deals').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
          ids.forEach((id: string) => validDealIds.add(id));
        } else {
          await client.from('deals').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Deals table sync warning:', e);
      }
    }

    // 4. Also sync relational lab work orders (supports both TypeScript model and schema.sql)
    const validLabIds = new Set<string>();
    if (Array.isArray(data.labs)) {
      try {
        if (data.labs.length > 0) {
          const records = data.labs.map((l: any) => ({
            id: l.id,
            sid: l.sid || '',
            acc_id: validAccIds.has(l.accId) ? l.accId : null,
            date: l.date || '',
            target_date: l.completionDate || l.targetDate || '',
            service: l.service || '',
            sample_name: l.sampleName || l.service || '',
            masuk: Number(l.masuk) || 1,
            analisa: Number(l.analisa) || 0,
            sisa: typeof l.sisa === 'number' ? l.sisa : ((Number(l.masuk) || 1) - (Number(l.analisa) || 0)),
            status: l.serviceStatus || l.status || 'Antrean',
            analyst: l.analyst || '',
            note: l.note || '',
          }));
          await client.from('lab_work_orders').upsert(records);
          const ids = records.map((l: any) => l.id);
          await client.from('lab_work_orders').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
          ids.forEach((id: string) => validLabIds.add(id));
        } else {
          await client.from('lab_work_orders').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Lab work orders table sync warning:', e);
      }
    }

    // 5. Also sync relational invoices
    if (Array.isArray(data.fins)) {
      try {
        if (data.fins.length > 0) {
          const records = data.fins.map((f: any) => ({
            id: f.id,
            no: f.no || '',
            acc_id: validAccIds.has(f.accId) ? f.accId : null,
            deal_id: validDealIds.has(f.dealId) ? f.dealId : null,
            lab_id: validLabIds.has(f.labId) ? f.labId : null,
            quote_id: null,
            sample_sid: f.sampleSid || null,
            po: f.po || '',
            date: f.date || '',
            due: f.due || '',
            amount: Number(f.amount) || 0,
            paid: Number(f.paid) || 0,
            ppn: Number(f.ppn) || 0,
            perihal: f.perihal || '',
            note: f.note || '',
            sent_at: f.sentAt || '',
            items: f.items || [],
          }));
          await client.from('invoices').upsert(records);
          const ids = records.map((f: any) => f.id);
          await client.from('invoices').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('invoices').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Invoices table sync warning:', e);
      }
    }

    // 6. Also sync relational instruments
    if (Array.isArray(data.insts)) {
      try {
        if (data.insts.length > 0) {
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
          const ids = records.map((i: any) => i.id);
          await client.from('instruments').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        }
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

    // 9. Also sync relational competencies (supports both methodsAuthorized & methods)
    if (Array.isArray(data.competencies) && data.competencies.length > 0) {
      try {
        const records = data.competencies.map((c: any) => ({
          id: c.id,
          employee_name: c.employeeName || '',
          nip_or_id: c.nipOrId || '',
          role: c.role || '',
          department: c.department || '',
          education: c.education || '',
          methods: c.methodsAuthorized || c.methods || [],
          instruments: c.instrumentsAuthorized || c.instruments || [],
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

    // 11. Also sync relational activities
    if (Array.isArray(data.acts)) {
      try {
        if (data.acts.length > 0) {
          const records = data.acts.map((a: any) => ({
            id: a.id,
            acc_id: validAccIds.has(a.accId) ? a.accId : null,
            type: a.type || 'Telepon',
            date: a.date || '',
            status: a.status || 'Terjadwal',
            note: a.note || '',
          }));
          await client.from('activities').upsert(records);
          const ids = records.map((a: any) => a.id);
          await client.from('activities').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('activities').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Activities table sync warning:', e);
      }
    }

    // 12. Also sync relational marketing campaigns
    if (Array.isArray(data.mkt)) {
      try {
        if (data.mkt.length > 0) {
          const records = data.mkt.map((m: any) => ({
            id: m.id,
            date: m.date || '',
            channel: m.channel || 'Digital',
            type: m.type || '',
            name: m.name || '',
            spend: Number(m.spend) || 0,
            reach: Number(m.reach) || 0,
            clicks: Number(m.clicks) || 0,
            leads: Number(m.leads) || 0,
            url: m.url || '',
            status: m.status || 'Aktif',
            note: m.note || '',
          }));
          await client.from('marketing_campaigns').upsert(records);
          const ids = records.map((m: any) => m.id);
          await client.from('marketing_campaigns').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('marketing_campaigns').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Marketing campaigns table sync warning:', e);
      }
    }

    // 13. Also sync relational quotes
    if (Array.isArray(data.quotes)) {
      try {
        if (data.quotes.length > 0) {
          const records = data.quotes.map((q: any) => ({
            id: q.id,
            no: q.no || '',
            acc_id: validAccIds.has(q.accId) ? q.accId : null,
            deal_id: validDealIds.has(q.dealId) ? q.dealId : null,
            perihal: q.perihal || '',
            date: q.date || '',
            valid_until: q.valid || '',
            items: q.items || [],
            total: Number(q.amount) || 0,
            ppn: Number(q.ppn) || 0,
            grand_total: (Number(q.amount) || 0) + (Number(q.ppn) || 0),
            status: q.status || 'Draft',
            sent_at: q.sentAt || '',
          }));
          await client.from('quotes').upsert(records);
          const ids = records.map((q: any) => q.id);
          await client.from('quotes').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('quotes').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Quotes table sync warning:', e);
      }
    }

    // 14. Also sync relational instrument events
    if (Array.isArray(data.instr)) {
      try {
        if (data.instr.length > 0) {
          const records = data.instr.map((ev: any) => ({
            id: ev.id,
            name: ev.name || '',
            type: ev.type || 'Downtime',
            date: ev.date || '',
            hours: Number(ev.hours) || 0,
            note: ev.note || '',
            pic: '',
          }));
          await client.from('instrument_events').upsert(records);
          const ids = records.map((ev: any) => ev.id);
          await client.from('instrument_events').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('instrument_events').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Instrument events table sync warning:', e);
      }
    }

    // 15. Also sync relational service catalog (supports both d/m/p and description/method/price)
    if (Array.isArray(data.cat)) {
      try {
        if (data.cat.length > 0) {
          const records = data.cat.map((c: any) => ({
            id: c.id,
            description: c.description || c.d || c.name || '',
            method: c.method || c.m || '',
            price: Number(c.price || c.p) || 0,
            status: c.status || 'Tersedia',
            closed_reason: c.closedReason || '',
            closed_from: c.closedFrom || '',
            closed_until: c.closedUntil || '',
          }));
          await client.from('service_catalog').upsert(records);
          const ids = records.map((c: any) => c.id);
          await client.from('service_catalog').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('service_catalog').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Service catalog table sync warning:', e);
      }
    }

    // 16. Also sync relational users
    if (Array.isArray(data.users)) {
      try {
        if (data.users.length > 0) {
          const records = data.users.map((u: any) => ({
            id: u.id || `usr-${u.username}`,
            username: u.username || u.name?.toLowerCase().replace(/\s+/g, '_') || '',
            name: u.name || '',
            role: u.role || 'staff',
            department: u.department || '',
            pin: u.pin || '',
            allowed_tabs: u.allowedTabs || [],
            is_active: u.isActive ?? true,
            created_at: u.createdAt || new Date().toISOString(),
            note: u.note || '',
          }));
          await client.from('users').upsert(records);
          const ids = records.map((u: any) => u.id);
          await client.from('users').delete().not('id', 'in', `(${ids.map((id: string) => `"${id}"`).join(',')})`);
        } else {
          await client.from('users').delete().neq('id', '___');
        }
      } catch (e) {
        console.warn('Users table sync warning:', e);
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
    await client.from('instruments').delete().neq('id', '___');
    await client.from('procurements').delete().neq('id', '___');
    await client.from('sample_deliveries').delete().neq('id', '___');
    await client.from('competencies').delete().neq('id', '___');
    await client.from('employees').delete().neq('id', '___');
    await client.from('activities').delete().neq('id', '___');
    await client.from('marketing_campaigns').delete().neq('id', '___');
    await client.from('quotes').delete().neq('id', '___');
    await client.from('instrument_events').delete().neq('id', '___');
    await client.from('service_catalog').delete().neq('id', '___');
    await client.from('users').delete().neq('id', '___');
    return true;
  } catch (err) {
    console.warn('Supabase reset error:', err);
    return false;
  }
}
