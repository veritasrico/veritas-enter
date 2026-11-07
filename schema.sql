-- Veritas Enterprise SQL Database Schema (Cloudflare D1 / SQLite)

-- 1. App State Cache / Synchronizer
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  synced_at TEXT NOT NULL
);

-- 2. CRM Accounts (Clients & Institutions)
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

-- 3. CRM Deals & Sales Pipeline
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
  closed_until TEXT,
  FOREIGN KEY (acc_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- 4. Customer Activities & Interactions
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  acc_id TEXT,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Terjadwal',
  note TEXT,
  FOREIGN KEY (acc_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 5. Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  channel TEXT NOT NULL,
  type TEXT,
  name TEXT NOT NULL,
  spend REAL DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  url TEXT,
  status TEXT,
  note TEXT
);

-- 6. Price Quotations (Surat Penawaran Harga)
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  no TEXT NOT NULL,
  acc_id TEXT,
  deal_id TEXT,
  perihal TEXT,
  date TEXT,
  valid_until TEXT,
  items TEXT,
  total REAL DEFAULT 0,
  ppn REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  grand_total REAL DEFAULT 0,
  terms TEXT,
  status TEXT,
  sent_at TEXT,
  FOREIGN KEY (acc_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- 7. Laboratory Work Orders (Sampel & Pengujian Lab)
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
  note TEXT,
  FOREIGN KEY (acc_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- 8. Master Instruments
CREATE TABLE IF NOT EXISTS instruments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  pic TEXT,
  target INTEGER DEFAULT 10,
  ops INTEGER DEFAULT 8,
  int_days INTEGER DEFAULT 365,
  last_cal TEXT,
  pm_int_days INTEGER DEFAULT 180,
  pm_last TEXT,
  note TEXT
);

-- 9. Instrument Maintenance & Downtime Events
CREATE TABLE IF NOT EXISTS instrument_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  hours REAL DEFAULT 0,
  note TEXT,
  pic TEXT
);

-- 10. Financial Invoices & Billing
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
  items TEXT,
  FOREIGN KEY (acc_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- 11. Testing Services Catalog
CREATE TABLE IF NOT EXISTS service_catalog (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  method TEXT,
  price REAL DEFAULT 0,
  status TEXT DEFAULT 'Tersedia',
  closed_reason TEXT,
  closed_from TEXT,
  closed_until TEXT
);

-- 12. System Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  user TEXT,
  role TEXT,
  action TEXT,
  mod TEXT,
  ref TEXT,
  note TEXT
);

-- 13. Procurement Records
CREATE TABLE IF NOT EXISTS procurements (
  id TEXT PRIMARY KEY,
  po_number TEXT,
  item_description TEXT NOT NULL,
  category TEXT,
  supplier TEXT,
  qty REAL DEFAULT 1,
  unit TEXT,
  est_cost REAL DEFAULT 0,
  requested_by TEXT,
  req_date TEXT,
  target_date TEXT,
  status TEXT DEFAULT 'Diajukan',
  urgency TEXT DEFAULT 'Biasa',
  notes TEXT
);

-- 14. Sample Deliveries & Logistics
CREATE TABLE IF NOT EXISTS sample_deliveries (
  id TEXT PRIMARY KEY,
  tracking_no TEXT,
  type TEXT NOT NULL,
  courier TEXT,
  origin TEXT,
  destination TEXT,
  temp_condition TEXT,
  received_date TEXT,
  status TEXT DEFAULT 'Diterima di Lab',
  receiver TEXT,
  seal_intact INTEGER DEFAULT 1,
  notes TEXT,
  proof_url TEXT,
  proof_filename TEXT
);

-- 15. Competency Matrix Records
CREATE TABLE IF NOT EXISTS competencies (
  id TEXT PRIMARY KEY,
  employee_name TEXT NOT NULL,
  nip_or_id TEXT,
  role TEXT,
  department TEXT,
  education TEXT,
  methods TEXT,
  instruments TEXT,
  k3_certified INTEGER DEFAULT 0,
  bnsp_certified INTEGER DEFAULT 0,
  last_evaluated TEXT,
  next_evaluation TEXT,
  status TEXT DEFAULT 'Terkualifikasi Penuh',
  notes TEXT
);

-- 16. Employee Records
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nip TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  join_date TEXT,
  status TEXT DEFAULT 'Aktif',
  emergency_contact TEXT,
  notes TEXT
);

-- 17. User Accounts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  pin TEXT,
  allowed_tabs TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  note TEXT
);

-- 18. CAPA & ISO Actions
CREATE TABLE IF NOT EXISTS capa_actions (
  id TEXT PRIMARY KEY,
  date TEXT,
  source TEXT,
  area TEXT,
  owner TEXT,
  description TEXT,
  risk TEXT,
  immediate TEXT,
  cause TEXT,
  corrective TEXT,
  target TEXT,
  status TEXT DEFAULT 'Open',
  verification TEXT
);

-- 19. App Settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
