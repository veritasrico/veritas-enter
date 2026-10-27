export type Role = 'admin' | 'sales' | 'marketing' | 'lab' | 'finance';

export type TabKey =
  | 'dash'
  | 'ai_analytics'
  | 'cal'
  | 'accounts'
  | 'deals'
  | 'acts'
  | 'mkt'
  | 'quote'
  | 'cat'
  | 'labdash'
  | 'lab'
  | 'qcqa'
  | 'instr'
  | 'insts'
  | 'inv'
  | 'fin'
  | 'monthly_report'
  | 'slide_export'
  | 'log'
  | 'set'
  | 'users'
  | 'procurement'
  | 'sample_logistics'
  | 'competency'
  | 'employees';

export interface ManagedUserAccount {
  id: string;
  username: string;
  name: string;
  role: Role;
  department: string;
  pin?: string;
  allowedTabs: TabKey[];
  isActive: boolean;
  createdAt: string;
  note?: string;
}

export interface UserAccount {
  u: string;
  role: Role;
  salt: string;
  hash: string;
}

export interface Account {
  id: string;
  name: string;        // Customer / Nama
  pic: string;         // Institusi / Perusahaan
  industry: string;    // Segmen / Bidang
  email: string;       // Email
  phone: string;       // No. telp
  source: string;      // Sumber lead (Referral, Website, etc)
  addr?: string;       // Alamat
  notes?: string;      // Catatan
  lastContactDate?: string;
  referralStatus?: 'New' | 'FollowedUp' | 'Qualified' | 'Closed';
}

export interface Deal {
  id: string;
  title: string;
  accId: string;
  value: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negosiasi' | 'Won' | 'Lost';
  owner: string;
  close: string;
  probability?: number;
  serviceStatus?: 'Normal' | 'Layanan Ditutup' | 'Ditunda';
  serviceClosedNote?: string;
  closedFrom?: string;
  closedUntil?: string;
}

export interface Activity {
  id: string;
  accId: string;
  type: 'Telepon' | 'Email' | 'Meeting' | 'Kunjungan' | 'Penawaran' | 'Follow-up';
  date: string;
  status: 'Terjadwal' | 'Dalam proses' | 'Selesai';
  note: string;
}

export interface MarketingCampaign {
  id: string;
  date: string;
  channel: string;
  type: string;
  name: string;
  spend: number;
  reach: number;
  clicks: number;
  leads: number;
  url?: string;       // Link Publikasi / URL Konten
  status?: string;
  note?: string;
}

export interface QuoteItem {
  d: string;
  m?: string;
  q: number;
  p: number;
  status?: 'Tersedia' | 'Ditutup Sementara';
  closedNote?: string;
}

export interface Quote {
  id: string;
  no: string;
  accId: string;
  dealId?: string;
  labId?: string;
  date: string;
  valid: string;
  amount: number;
  ppn?: number;
  status: 'Draft' | 'Terkirim' | 'Disetujui' | 'Ditolak';
  perihal?: string;
  lampiran?: string;
  recipientName?: string;
  recipientTitle?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  note?: string;
  sentAt?: string;
  items?: QuoteItem[];
}

export interface LabWorkOrder {
  id: string;
  sid: string;          // ID Sample
  accId: string;        // Customer
  quoteId?: string;
  dealId?: string;
  service: string;      // Layanan / Nama Instrumen
  cust: 'Internal' | 'Eksternal';
  analyst: string;
  date: string;         // Tanggal Terima Sampel
  completionDate?: string; // Tanggal Penyelesaian Pengujian
  targetTatDays?: number;  // Target SLA (hari), default 5
  actualTatDays?: number;  // Realisasi TAT (hari)
  masuk: number;
  analisa: number;
  down: string;
  jam: number;
  note?: string;
  completedLogged?: boolean;
  serviceStatus?: 'Normal' | 'Layanan Ditutup' | 'Ditunda' | 'Selesai';
  serviceClosedNote?: string; // Catatan keterangan layanan ditutup
  closedFrom?: string;
  closedUntil?: string;
}

export interface InstrumentEvent {
  id: string;
  name: string;
  type: 'Downtime' | 'Kalibrasi' | 'PM' | 'Troubleshooting' | 'Verifikasi QC' | 'Pelatihan Analis';
  cat?: string;         // Kategori / Alasan gangguan detail
  reasonCategory?: string;
  date: string;
  hours: number;
  next?: string;
  note?: string;
}

export interface MasterInstrument {
  id: string;
  name: string;
  brand: string;
  pic?: string;
  target: number;
  ops: number;
  int: number;
  last?: string;
  next?: string;
  pmInt: number;
  pmLast?: string;
  pmNext?: string;
  note?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  inst?: string;
  unit: string;
  stock: number;
  min: number;
  exp?: string;
  note?: string;
}

export interface Invoice {
  id: string;
  no: string;
  accId: string;
  dealId?: string;
  labId?: string;
  quoteId?: string;
  sampleSid?: string;
  po?: string;
  date: string;
  due: string;
  amount: number;
  paid: number;
  ppn?: number;
  perihal?: string;
  note?: string;
  sentAt?: string;
  items?: QuoteItem[];
}

export interface ServiceCatalog {
  id: string;
  d: string;
  m: string;
  p: number;
  status?: 'Tersedia' | 'Ditutup Sementara' | 'Maintenance';
  closedReason?: string; // Catatan alasan layanan ditutup
  closedFrom?: string;   // Tanggal mulai penutupan (YYYY-MM-DD)
  closedUntil?: string;  // Estimasi tanggal selesai penutupan / buka kembali (YYYY-MM-DD)
}

export interface LogEntry {
  id: string;
  ts: number;
  user: string;
  role: string;
  action: 'Tambah' | 'Ubah' | 'Hapus' | 'Selesai Proses' | 'Impor' | 'Masuk' | 'Keluar';
  mod: string;
  ref: string;
  ch?: [string, string, string][];
  note: string;
}

export interface CompanyProfile {
  name: string;
  addr: string;
  phone: string;
  email: string;
  bank: string;
  terms: string;
  ppn: number;
  signer: string;
  title: string;
  logo?: string;
  logoT?: string;
  logoW?: number;
  logoH?: number;
  sig?: string;
  sigT?: string;
  sigW?: number;
  sigH?: number;
  sigX?: number;
  sigGap?: number;
  sigSize?: number;
  tpl?: 'modern' | 'klasik';
  accent?: string;
  intro?: string;
  outro?: string;
  invIntro?: string;
  invOutro?: string;
  invTerms?: string;
}

export interface AppSettings {
  co: CompanyProfile;
  int: Record<string, { on: boolean; ref: string; note: string }>;
  waNumber?: string;
  autoReminders?: boolean;
  cloudSyncIntervalSec?: number;
}

export interface DailyCheckRecord {
  status?: 'OK' | 'NC' | 'NA';
  finding?: string;
  action?: string;
  owner?: string;
  target?: string;
  verification?: string;
}

export interface CapaAction {
  id: string;
  date: string;
  source: string;
  area: string;
  owner: string;
  description: string;
  risk?: string;
  immediate?: string;
  cause?: string;
  corrective?: string;
  target?: string;
  status: 'Open' | 'In progress' | 'Closed';
  verification?: string;
}

export interface IsoGapItem {
  id: number;
  cl: string;
  area: string;
  q: string;
  e: string;
  score?: number | 'NA';
  gap?: string;
  action?: string;
  owner?: string;
  target?: string;
}

export interface QcQaState {
  checks: Record<string, Record<number, DailyCheckRecord>>;
  actions: CapaAction[];
  gaps: Record<number, { score?: number | 'NA'; gap?: string; action?: string; owner?: string; target?: string }>;
}

export interface ProcurementRecord {
  id: string;
  poNumber: string;
  itemDescription: string;
  category: 'Reagen & Kimia' | 'Gas Murni & Kalibrasi' | 'Suku Cadang Instrumen' | 'APD & Keselamatan' | 'Glassware & Konsumabel';
  supplier: string;
  qty: number;
  unit: string;
  estCost: number;
  requestedBy: string;
  reqDate: string;
  targetDate: string;
  status: 'Diajukan' | 'Disetujui' | 'Dipesan' | 'Tiba di Lab' | 'Ditolak';
  urgency: 'Biasa' | 'Mendesak' | 'Kritis';
  notes?: string;
}

export interface SampleDeliveryRecord {
  id: string;
  trackingNo: string;
  type: 'Sampel Masuk' | 'Sampel Keluar' | 'Reagen Masuk';
  courier: string;
  origin: string;
  destination: string;
  tempCondition: 'Ambient (20-25°C)' | 'Cold Chain (2-8°C)' | 'Frozen (-20°C)';
  receivedDate: string;
  status: 'Dalam Perjalanan' | 'Diterima di Lab' | 'Diinspeksi & OK' | 'Ditolak/Rusak';
  receiver: string;
  sealIntact: boolean;
  notes?: string;
  proofOfReceiptUrl?: string; // Foto bukti terima fisik sampel di lab
  proofFileName?: string;
}

export interface CompetencyRecord {
  id: string;
  employeeName: string;
  nipOrId: string;
  role: string;
  department: string;
  education: string;
  methodsAuthorized: string[];
  instrumentsAuthorized: string[];
  k3Certified: boolean;
  bnspCertified: boolean;
  certification?: string;   // Label sertifikasi yang disederhanakan
  certifications?: string[];
  lastEvaluated: string;
  nextEvaluation: string;
  status: 'Terkualifikasi Penuh' | 'Dalam Pengawasan (Trainee)' | 'Perlu Re-Evaluasi';
  notes?: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  nip: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'Aktif' | 'Cuti' | 'Resigned';
  emergencyContact?: string;
  notes?: string;
}

export interface AppState {
  accounts: Account[];
  deals: Deal[];
  acts: Activity[];
  mkt: MarketingCampaign[];
  quotes: Quote[];
  labs: LabWorkOrder[];
  instr: InstrumentEvent[];
  insts: MasterInstrument[];
  inv: InventoryItem[];
  fins: Invoice[];
  cat: ServiceCatalog[];
  log: LogEntry[];
  settings: AppSettings;
  qcqa?: QcQaState;
  users?: ManagedUserAccount[];
  procurements?: ProcurementRecord[];
  deliveries?: SampleDeliveryRecord[];
  competencies?: CompetencyRecord[];
  employees?: EmployeeRecord[];
}

export interface AppNotification {
  id: string;
  type: 'referral' | 'calibration' | 'pm' | 'invoice' | 'lab' | 'reminder';
  title: string;
  message: string;
  date: string;
  urgency: 'high' | 'medium' | 'low';
  relatedId?: string;
  actionLabel?: string;
  actionUrl?: string;
  actionType?: 'wa' | 'view_acc' | 'view_lab' | 'view_fin';
}

export interface AiAnalyticsResult {
  summary: string;
  healthScore: number;
  salesVelocity: string;
  projectedRevenue: string;
  referralInsight: string;
  sampleEfficiency: string;
  keyOpportunities: string[];
  riskAlerts: string[];
  actionPlan: { action: string; priority: 'High' | 'Medium'; owner: string }[];
}
