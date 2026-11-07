import { Env, INITIAL_SEED_DATA } from './_shared';

export interface SqlDatabase {
  exec(sql: string): Promise<any>;
  prepare(sql: string): any;
  batch?(statements: any[]): Promise<any[]>;
}

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  synced_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pic TEXT,
  industry TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  addr TEXT,
  notes TEXT,
  last_contact_date TEXT,
  referral_status TEXT
);
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  acc_id TEXT,
  value REAL DEFAULT 0,
  stage TEXT DEFAULT 'Lead',
  owner TEXT,
  close_date TEXT,
  probability REAL DEFAULT 0,
  service_status TEXT DEFAULT 'Normal',
  service_closed_note TEXT,
  closed_from TEXT,
  closed_until TEXT
);
CREATE TABLE IF NOT EXISTS lab_work_orders (
  id TEXT PRIMARY KEY,
  sid TEXT NOT NULL,
  acc_id TEXT,
  date TEXT,
  target_date TEXT,
  service TEXT,
  sample_name TEXT,
  masuk INTEGER DEFAULT 1,
  analisa INTEGER DEFAULT 0,
  sisa INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Antrean',
  analyst TEXT,
  note TEXT
);
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  no TEXT NOT NULL,
  acc_id TEXT,
  deal_id TEXT,
  lab_id TEXT,
  quote_id TEXT,
  sample_sid TEXT,
  po TEXT,
  date TEXT,
  due TEXT,
  amount REAL DEFAULT 0,
  paid REAL DEFAULT 0,
  ppn REAL DEFAULT 0,
  perihal TEXT,
  note TEXT,
  sent_at TEXT,
  items TEXT
);
`;

let schemaInitialized = false;

export async function ensureSqlSchema(db: D1Database): Promise<void> {
  if (schemaInitialized) return;
  try {
    await db.exec(INIT_SQL);
    schemaInitialized = true;
  } catch (err) {
    console.warn('SQL schema init warning:', err);
  }
}

export async function getSqlAppState(env: Env): Promise<{ data: any; syncedAt: string }> {
  const db = (env as any).DB as D1Database | undefined;
  if (db) {
    try {
      await ensureSqlSchema(db);
      const row: any = await db.prepare('SELECT data, synced_at FROM app_state WHERE key = ?').bind('current').first();
      if (row && row.data) {
        return {
          data: JSON.parse(row.data),
          syncedAt: row.synced_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Error reading from SQL database:', err);
    }
  }

  // Fallback to KV or initial seed
  const kv = env.VERITAS_KV || env.KV;
  if (kv) {
    try {
      const stored: any = await kv.get('cloud_database', 'json');
      if (stored && stored.data) {
        return {
          data: stored.data,
          syncedAt: stored.syncedAt || new Date().toISOString(),
        };
      }
    } catch (e) {}
  }

  return {
    data: INITIAL_SEED_DATA,
    syncedAt: new Date().toISOString(),
  };
}

export async function setSqlAppState(env: Env, data: any, syncedAt: string): Promise<void> {
  const db = (env as any).DB as D1Database | undefined;
  if (db) {
    try {
      await ensureSqlSchema(db);
      const dataStr = JSON.stringify(data);
      await db
        .prepare('INSERT INTO app_state (key, data, synced_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, synced_at = excluded.synced_at')
        .bind('current', dataStr, syncedAt)
        .run();

      // Optionally sync relational tables for SQL querying
      if (Array.isArray(data.accounts)) {
        for (const a of data.accounts) {
          await db
            .prepare('INSERT INTO accounts (id, name, pic, industry, email, phone, source, addr, notes, last_contact_date, referral_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, pic=excluded.pic, email=excluded.email, phone=excluded.phone, notes=excluded.notes')
            .bind(a.id, a.name || '', a.pic || '', a.industry || '', a.email || '', a.phone || '', a.source || '', a.addr || '', a.notes || '', a.lastContactDate || '', a.referralStatus || '')
            .run()
            .catch(() => {});
        }
      }

      if (Array.isArray(data.deals)) {
        for (const d of data.deals) {
          await db
            .prepare('INSERT INTO deals (id, title, acc_id, value, stage, owner, close_date, probability, service_status, service_closed_note, closed_from, closed_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, value=excluded.value, stage=excluded.stage, owner=excluded.owner, close_date=excluded.close_date')
            .bind(d.id, d.title || '', d.accId || '', Number(d.value) || 0, d.stage || 'Lead', d.owner || '', d.close || '', Number(d.probability) || 0, d.serviceStatus || 'Normal', d.serviceClosedNote || '', d.closedFrom || '', d.closedUntil || '')
            .run()
            .catch(() => {});
        }
      }

      if (Array.isArray(data.labs)) {
        for (const l of data.labs) {
          await db
            .prepare('INSERT INTO lab_work_orders (id, sid, acc_id, date, target_date, service, sample_name, masuk, analisa, sisa, status, analyst, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET sid=excluded.sid, service=excluded.service, masuk=excluded.masuk, analisa=excluded.analisa, sisa=excluded.sisa, status=excluded.status, note=excluded.note')
            .bind(l.id, l.sid || '', l.accId || '', l.date || '', l.targetDate || '', l.service || '', l.sampleName || '', Number(l.masuk) || 1, Number(l.analisa) || 0, Number(l.sisa) || 0, l.status || 'Antrean', l.analyst || '', l.note || '')
            .run()
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Error writing to SQL database:', err);
    }
  }

  // Also maintain KV copy if bound
  const kv = env.VERITAS_KV || env.KV;
  if (kv) {
    await kv.put('cloud_database', JSON.stringify({ data, syncedAt })).catch(() => {});
  }
}

export async function clearSqlAppState(env: Env): Promise<void> {
  const db = (env as any).DB as D1Database | undefined;
  if (db) {
    try {
      await ensureSqlSchema(db);
      await db.prepare('DELETE FROM app_state').run();
      await db.prepare('DELETE FROM accounts').run().catch(() => {});
      await db.prepare('DELETE FROM deals').run().catch(() => {});
      await db.prepare('DELETE FROM lab_work_orders').run().catch(() => {});
      await db.prepare('DELETE FROM invoices').run().catch(() => {});
    } catch (err) {
      console.warn('Error clearing SQL database:', err);
    }
  }

  const kv = env.VERITAS_KV || env.KV;
  if (kv) {
    await kv.delete('cloud_database').catch(() => {});
  }
}
