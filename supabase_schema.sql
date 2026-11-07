-- ==============================================================================
-- VERITAS ENTERPRISE - SUPABASE POSTGRESQL INITIALIZATION SCHEMA
-- Run this script in your Supabase Dashboard: SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. App State Cache / Synchronizer Table
CREATE TABLE IF NOT EXISTS public.app_state (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CRM Accounts (Clients & Institutions)
CREATE TABLE IF NOT EXISTS public.accounts (
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
  referral_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CRM Deals & Sales Pipeline
CREATE TABLE IF NOT EXISTS public.deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  acc_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
  value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'Lead',
  owner TEXT,
  close_date TEXT,
  probability NUMERIC DEFAULT 0,
  service_status TEXT DEFAULT 'Normal',
  service_closed_note TEXT,
  closed_from TEXT,
  closed_until TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Customer Activities & Interactions
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  acc_id TEXT REFERENCES public.accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Terjadwal',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  channel TEXT NOT NULL,
  type TEXT,
  name TEXT NOT NULL,
  spend NUMERIC DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  url TEXT,
  status TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Price Quotations (Surat Penawaran Harga)
CREATE TABLE IF NOT EXISTS public.quotes (
  id TEXT PRIMARY KEY,
  no TEXT NOT NULL,
  acc_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
  deal_id TEXT,
  perihal TEXT,
  date TEXT,
  valid_until TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total NUMERIC DEFAULT 0,
  ppn NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  terms TEXT,
  status TEXT,
  sent_at TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Laboratory Work Orders (Sampel & Pengujian Lab)
CREATE TABLE IF NOT EXISTS public.lab_work_orders (
  id TEXT PRIMARY KEY,
  sid TEXT NOT NULL,
  acc_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Master Laboratory Instruments
CREATE TABLE IF NOT EXISTS public.instruments (
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
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Instrument Maintenance & Downtime Events
CREATE TABLE IF NOT EXISTS public.instrument_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  hours NUMERIC DEFAULT 0,
  note TEXT,
  pic TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Financial Invoices & Billing
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  no TEXT NOT NULL,
  acc_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
  deal_id TEXT,
  lab_id TEXT,
  quote_id TEXT,
  sample_sid TEXT,
  po TEXT,
  date TEXT,
  due TEXT,
  amount NUMERIC DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  ppn NUMERIC DEFAULT 0,
  perihal TEXT,
  note TEXT,
  sent_at TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Testing Services Catalog
CREATE TABLE IF NOT EXISTS public.service_catalog (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  method TEXT,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Tersedia',
  closed_reason TEXT,
  closed_from TEXT,
  closed_until TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. System Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  ts BIGINT NOT NULL,
  user_name TEXT,
  role TEXT,
  action TEXT,
  mod TEXT,
  ref TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Procurement Records
CREATE TABLE IF NOT EXISTS public.procurements (
  id TEXT PRIMARY KEY,
  po_number TEXT,
  item_description TEXT NOT NULL,
  category TEXT,
  supplier TEXT,
  qty NUMERIC DEFAULT 1,
  unit TEXT,
  est_cost NUMERIC DEFAULT 0,
  requested_by TEXT,
  req_date TEXT,
  target_date TEXT,
  status TEXT DEFAULT 'Diajukan',
  urgency TEXT DEFAULT 'Biasa',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Sample Deliveries & Logistics
CREATE TABLE IF NOT EXISTS public.sample_deliveries (
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
  seal_intact BOOLEAN DEFAULT true,
  notes TEXT,
  proof_url TEXT,
  proof_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Analyst Competency Matrix
CREATE TABLE IF NOT EXISTS public.competencies (
  id TEXT PRIMARY KEY,
  employee_name TEXT NOT NULL,
  nip_or_id TEXT,
  role TEXT,
  department TEXT,
  education TEXT,
  methods JSONB DEFAULT '[]'::jsonb,
  instruments JSONB DEFAULT '[]'::jsonb,
  k3_certified BOOLEAN DEFAULT false,
  bnsp_certified BOOLEAN DEFAULT false,
  last_evaluated TEXT,
  next_evaluation TEXT,
  status TEXT DEFAULT 'Terkualifikasi Penuh',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Employee Records
CREATE TABLE IF NOT EXISTS public.employees (
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
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. User Accounts
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  pin TEXT,
  allowed_tabs JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TEXT,
  note TEXT
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
-- ==============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow full access to all users" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "Allow full access to all users" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;

-- ==============================================================================
-- INITIAL BASELINE INSTRUMENTS & ADMIN USER
-- ==============================================================================

INSERT INTO public.users (id, username, name, role, department, pin, allowed_tabs, is_active, created_at, note)
VALUES (
  'usr-admin',
  'admin',
  'Ricoh Sutrisno',
  'admin',
  'Manajemen Eksekutif & Teknis Laboratorium',
  '1234',
  '["dash", "slide_export", "ai_analytics", "cal", "accounts", "deals", "quote", "acts", "mkt", "labdash", "lab", "instr", "qcqa", "fin", "monthly_report", "procurement", "inv", "sample_logistics", "competency", "employees", "users", "log", "set"]'::jsonb,
  true,
  '2026-01-01',
  'Administrator Utama PT NUSA VERITAS INSPEKTAMA'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.instruments (id, name, brand, pic, target, ops, int_days, last_cal, pm_int_days, pm_last, note)
VALUES 
  ('inst-1', 'SEM', 'JEOL JSM-IT200', 'Analis SEM', 20, 8, 365, '', 180, '', 'Scanning Electron Microscope & EDS'),
  ('inst-2', 'XRD', 'BRUKER D8 Advance', 'Analis XRD', 20, 8, 365, '', 180, '', 'X-Ray Diffraction'),
  ('inst-3', 'ICP-OES', 'Thermo Scientific iCAP PRO', 'Analis Kimia', 15, 8, 365, '', 180, '', 'Inductively Coupled Plasma Optical Emission'),
  ('inst-4', 'FTIR', 'Shimadzu IRTracer-100', 'Analis Spektroskopi', 15, 8, 365, '', 180, '', 'Fourier Transform Infrared'),
  ('inst-5', 'HPLC', 'Agilent 1260 Infinity II', 'Analis Kromatografi', 10, 8, 365, '', 180, '', 'High Performance Liquid Chromatography'),
  ('inst-6', 'GC-MS', 'Thermo TRACE 1310 / ISQ', 'Analis GC-MS', 8, 8, 365, '', 180, '', 'Gas Chromatography - Mass Spectrometry'),
  ('inst-7', 'XRF', 'BRUKER S2 PUMA', 'Analis XRF', 15, 8, 365, '', 180, '', 'X-Ray Fluorescence'),
  ('inst-8', 'UV-Vis', 'HORIBA Duetta', 'Analis Spektroskopi', 12, 8, 365, '', 180, '', 'UV-Vis Spectrophotometer')
ON CONFLICT (id) DO NOTHING;
