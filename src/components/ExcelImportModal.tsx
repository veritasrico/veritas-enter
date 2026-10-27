import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { uid, today } from '../utils/seedData';

export type ImportableModule =
  | 'accounts'
  | 'deals'
  | 'quotes'
  | 'labs'
  | 'fins'
  | 'mkt'
  | 'marketing'
  | 'procurement'
  | 'procurements'
  | 'deliveries'
  | 'competency'
  | 'competencies'
  | 'employees'
  | 'inv';

interface ExcelImportModalProps {
  isOpen: boolean;
  targetModule: ImportableModule;
  onClose: () => void;
  onImportComplete: (moduleKey: ImportableModule, items: any[], mode: 'append' | 'replace') => void;
}

interface ModuleConfig {
  key: ImportableModule;
  title: string;
  category: string;
  filename: string;
  columns: string[];
  sampleRow: Record<string, any>;
  mapper: (row: Record<string, any>) => any;
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  accounts: {
    key: 'accounts',
    title: 'Kontak & Segmen CRM',
    category: 'Sales & Customer',
    filename: 'Template_Impor_Kontak_CRM.xlsx',
    columns: ['Nama Customer', 'Perusahaan / Institusi', 'Segmen Industri', 'Email', 'No Telepon', 'Sumber Lead', 'Alamat', 'Catatan'],
    sampleRow: {
      'Nama Customer': 'Bambang Sudirman',
      'Perusahaan / Institusi': 'PT Mineral Terpadu Indonesia',
      'Segmen Industri': 'Mining & Mineral',
      'Email': 'bambang@mineralterpadu.co.id',
      'No Telepon': '+62 812 3456 7890',
      'Sumber Lead': 'Referral',
      'Alamat': 'Kawasan Industri Morowali, Sulteng',
      'Catatan': 'Kebutuhan uji berkala ICP-OES dan FTIR bijih nikel',
    },
    mapper: (r) => ({
      id: uid(),
      name: String(r['Nama Customer'] || r['Nama'] || r['Customer'] || 'Customer Baru'),
      pic: String(r['Perusahaan / Institusi'] || r['Perusahaan'] || r['PIC'] || '-'),
      industry: String(r['Segmen Industri'] || r['Segmen'] || 'Laboratory'),
      email: String(r['Email'] || ''),
      phone: String(r['No Telepon'] || r['Telepon'] || r['WhatsApp'] || ''),
      source: String(r['Sumber Lead'] || r['Sumber'] || 'Excel Import'),
      addr: String(r['Alamat'] || ''),
      notes: String(r['Catatan'] || 'Diimpor via Excel'),
      referralStatus: 'Qualified',
    }),
  },
  deals: {
    key: 'deals',
    title: 'Papan Deal & Pipeline Penjualan',
    category: 'Sales & Customer',
    filename: 'Template_Impor_Deals_Pipeline.xlsx',
    columns: ['Judul Deal', 'Nama Perusahaan', 'Nilai IDR', 'Tahapan (Lead/Qualified/Proposal/Negosiasi/Won)', 'PIC Sales', 'Target Close Date', 'Probabilitas (%)'],
    sampleRow: {
      'Judul Deal': 'Kontrak Pengujian Batuan Nikel Q4',
      'Nama Perusahaan': 'PT Mineral Terpadu Indonesia',
      'Nilai IDR': 75000000,
      'Tahapan (Lead/Qualified/Proposal/Negosiasi/Won)': 'Proposal',
      'PIC Sales': 'Amanda Kusuma',
      'Target Close Date': '2026-11-15',
      'Probabilitas (%)': 75,
    },
    mapper: (r) => ({
      id: uid(),
      title: String(r['Judul Deal'] || r['Judul'] || 'Deal Baru'),
      accId: String(r['Nama Perusahaan'] || r['Perusahaan'] || ''),
      value: Number(r['Nilai IDR'] || r['Nilai'] || 0),
      stage: (r['Tahapan'] || r['Tahapan (Lead/Qualified/Proposal/Negosiasi/Won)'] || 'Qualified') as any,
      owner: String(r['PIC Sales'] || r['Sales'] || 'Sales Tim'),
      close: String(r['Target Close Date'] || today()),
      probability: Number(r['Probabilitas (%)'] || 60),
    }),
  },
  quotes: {
    key: 'quotes',
    title: 'Penawaran Harga (Quotes)',
    category: 'Sales & Customer',
    filename: 'Template_Impor_Penawaran_Harga.xlsx',
    columns: ['No Penawaran', 'Nama Customer / Perusahaan', 'Perihal Surat', 'Total Nilai (Rp)', 'Tanggal', 'Masa Berlaku', 'Status (Draft/Terkirim/Disetujui)'],
    sampleRow: {
      'No Penawaran': 'QUO-2026-089',
      'Nama Customer / Perusahaan': 'PT Energi Hijau Nusantara',
      'Perihal Surat': 'Penawaran Uji Karakterisasi Mineral dan Air Tambang',
      'Total Nilai (Rp)': 48000000,
      'Tanggal': today(),
      'Masa Berlaku': today(),
      'Status (Draft/Terkirim/Disetujui)': 'Terkirim',
    },
    mapper: (r) => ({
      id: uid(),
      no: String(r['No Penawaran'] || `QUO-${today().replace(/-/g, '')}`),
      accId: String(r['Nama Customer / Perusahaan'] || r['Customer'] || ''),
      perihal: String(r['Perihal Surat'] || 'Penawaran Jasa Pengujian'),
      amount: Number(r['Total Nilai (Rp)'] || r['Nilai'] || 0),
      date: String(r['Tanggal'] || today()),
      valid: String(r['Masa Berlaku'] || today()),
      status: (r['Status'] || r['Status (Draft/Terkirim/Disetujui)'] || 'Terkirim') as any,
    }),
  },
  labs: {
    key: 'labs',
    title: 'Work Order & Pengujian Laboratorium',
    category: 'Laboratory Operations',
    filename: 'Template_Impor_Work_Order_Lab.xlsx',
    columns: ['Sample ID (SID)', 'Nama Customer / Instansi', 'Layanan / Instrumen', 'Nama Analis', 'Tanggal Terima', 'Tanggal Selesai', 'Target SLA Hari', 'Jumlah Sampel Masuk', 'Jumlah Sampel Analisa', 'Status (Normal/Selesai)'],
    sampleRow: {
      'Sample ID (SID)': 'SID-2026-1044',
      'Nama Customer / Instansi': 'PT Antam Tbk',
      'Layanan / Instrumen': 'ICP-OES Avio 500',
      'Nama Analis': 'Dimas Wahyu',
      'Tanggal Terima': today(),
      'Tanggal Selesai': today(),
      'Target SLA Hari': 5,
      'Jumlah Sampel Masuk': 12,
      'Jumlah Sampel Analisa': 12,
      'Status (Normal/Selesai)': 'Selesai',
    },
    mapper: (r) => {
      const recDate = String(r['Tanggal Terima'] || r['Tanggal Masuk'] || today());
      const compDate = r['Tanggal Selesai'] ? String(r['Tanggal Selesai']) : undefined;
      const targetSla = Number(r['Target SLA Hari'] || r['SLA'] || 5);
      const actualTat = compDate
        ? Math.max(0, Math.ceil((new Date(compDate).getTime() - new Date(recDate).getTime()) / (1000 * 60 * 60 * 24)))
        : undefined;

      return {
        id: uid(),
        sid: String(r['Sample ID (SID)'] || r['SID'] || `SID-${today().replace(/-/g, '')}`),
        accId: String(r['Nama Customer / Instansi'] || r['Customer'] || '-'),
        service: String(r['Layanan / Instrumen'] || r['Layanan / Instrumen (ICP-OES / XRD / XRF / SEM)'] || r['Layanan'] || 'ICP-OES Avio 500'),
        cust: 'Eksternal',
        analyst: String(r['Nama Analis'] || r['Analis'] || 'Analis Lab'),
        date: recDate,
        completionDate: compDate,
        targetTatDays: targetSla,
        actualTatDays: actualTat,
        masuk: Number(r['Jumlah Sampel Masuk'] || 1),
        analisa: Number(r['Jumlah Sampel Analisa'] || 1),
        down: 'Tidak ada',
        jam: 0,
        serviceStatus: (r['Status'] || r['Status (Normal/Selesai)'] || (compDate ? 'Selesai' : 'Normal')) as any,
      };
    },
  },
  mkt: {
    key: 'mkt',
    title: 'Digital Marketing & Kampanye Leads',
    category: 'Marketing & Growth',
    filename: 'Template_Impor_Marketing_Leads.xlsx',
    columns: ['Tanggal', 'Kanal Platform (LinkedIn/Instagram/TikTok/YouTube/Event)', 'Nama Kampanye / Konten', 'Biaya Spend (Rp)', 'Reach (Jangkauan)', 'Klik', 'Leads Dihasilkan', 'Link Publikasi / URL', 'Catatan'],
    sampleRow: {
      'Tanggal': today(),
      'Kanal Platform (LinkedIn/Instagram/TikTok/YouTube/Event)': 'Instagram',
      'Nama Kampanye / Konten': 'Reels Edukasi XRF Batuan Nikel & Bauksit',
      'Biaya Spend (Rp)': 1500000,
      'Reach (Jangkauan)': 25000,
      'Klik': 420,
      'Leads Dihasilkan': 14,
      'Link Publikasi / URL': 'https://instagram.com/p/veritas_lab_geochem',
      'Catatan': 'Trafik lead tinggi dari segmen smelter Sulawesi',
    },
    mapper: (r) => ({
      id: uid(),
      date: String(r['Tanggal'] || today()),
      channel: String(r['Kanal Platform (LinkedIn/Instagram/TikTok/YouTube/Event)'] || r['Kanal'] || r['Platform'] || 'Instagram'),
      type: 'Digital & Event',
      name: String(r['Nama Kampanye / Konten'] || r['Nama Konten'] || r['Kampanye'] || 'Kampanye Baru'),
      spend: Number(r['Biaya Spend (Rp)'] || r['Biaya'] || r['Spend'] || 0),
      reach: Number(r['Reach (Jangkauan)'] || r['Reach'] || 0),
      clicks: Number(r['Klik'] || r['Clicks'] || 0),
      leads: Number(r['Leads Dihasilkan'] || r['Leads'] || 0),
      url: String(r['Link Publikasi / URL'] || r['Link'] || r['URL'] || ''),
      note: String(r['Catatan'] || 'Impor Excel'),
    }),
  },
  fins: {
    key: 'fins',
    title: 'Keuangan & Faktur Tagihan (Invoice)',
    category: 'Finance & Accounting',
    filename: 'Template_Impor_Faktur_Invoice.xlsx',
    columns: ['Nomor Invoice', 'Nama Pelanggan', 'No PO Klien', 'Tanggal Faktur', 'Jatuh Tempo', 'Nilai Tagihan (Rp)', 'Jumlah Terbayar (Rp)', 'Perihal Layanan'],
    sampleRow: {
      'Nomor Invoice': 'INV-2026-092',
      'Nama Pelanggan': 'PT Petrokimia Gresik',
      'No PO Klien': 'PO-PG-8891',
      'Tanggal Faktur': today(),
      'Jatuh Tempo': today(),
      'Nilai Tagihan (Rp)': 33000000,
      'Jumlah Terbayar (Rp)': 33000000,
      'Perihal Layanan': 'Jasa Analisis Spektroskopi Emisi Logam Pelumas',
    },
    mapper: (r) => ({
      id: uid(),
      no: String(r['Nomor Invoice'] || `INV-${today().replace(/-/g, '')}`),
      accId: String(r['Nama Pelanggan'] || r['Pelanggan'] || ''),
      po: String(r['No PO Klien'] || ''),
      date: String(r['Tanggal Faktur'] || today()),
      due: String(r['Jatuh Tempo'] || today()),
      amount: Number(r['Nilai Tagihan (Rp)'] || 0),
      paid: Number(r['Jumlah Terbayar (Rp)'] || 0),
      perihal: String(r['Perihal Layanan'] || 'Jasa Pengujian Laboratorium'),
    }),
  },
  procurements: {
    key: 'procurements',
    title: 'Pengadaan & Purchase Order (PO)',
    category: 'Logistics & Supply Chain',
    filename: 'Template_Impor_Pengadaan_PO.xlsx',
    columns: ['Nomor PO', 'Deskripsi Item / Reagen', 'Kategori', 'Supplier / Vendor', 'Jumlah', 'Satuan', 'Estimasi Biaya (Rp)', 'Pemohon', 'Target Tiba', 'Urgensi (Biasa/Mendesak/Kritis)', 'Status (Diajukan/Disetujui/Dipesan/Tiba di Lab)'],
    sampleRow: {
      'Nomor PO': 'PO-2026-015',
      'Deskripsi Item / Reagen': 'Asam Nitrat 65% TraceMetal Grade Merck',
      'Kategori': 'Reagen & Kimia',
      'Supplier / Vendor': 'PT Merck Chemicals Indonesia',
      'Jumlah': 4,
      'Satuan': 'Botol 2.5L',
      'Estimasi Biaya (Rp)': 8400000,
      'Pemohon': 'Dimas Wahyu',
      'Target Tiba': today(),
      'Urgensi (Biasa/Mendesak/Kritis)': 'Mendesak',
      'Status (Diajukan/Disetujui/Dipesan/Tiba di Lab)': 'Disetujui',
    },
    mapper: (r) => ({
      id: uid(),
      poNumber: String(r['Nomor PO'] || `PO-${today().replace(/-/g, '')}`),
      itemDescription: String(r['Deskripsi Item / Reagen'] || r['Item'] || 'Item Pengadaan'),
      category: (r['Kategori'] || 'Reagen & Kimia') as any,
      supplier: String(r['Supplier / Vendor'] || r['Supplier'] || '-'),
      qty: Number(r['Jumlah'] || r['Qty'] || 1),
      unit: String(r['Satuan'] || 'Unit'),
      estCost: Number(r['Estimasi Biaya (Rp)'] || 0),
      requestedBy: String(r['Pemohon'] || 'Staf Lab'),
      reqDate: today(),
      targetDate: String(r['Target Tiba'] || today()),
      urgency: (r['Urgensi (Biasa/Mendesak/Kritis)'] || r['Urgensi'] || 'Biasa') as any,
      status: (r['Status'] || r['Status (Diajukan/Disetujui/Dipesan/Tiba di Lab)'] || 'Diajukan') as any,
    }),
  },
  deliveries: {
    key: 'deliveries',
    title: 'Logistik Sampel & Resi Pengiriman',
    category: 'Logistics & Supply Chain',
    filename: 'Template_Impor_Logistik_Sampel.xlsx',
    columns: ['No Tracking / Resi', 'Tipe (Sampel Masuk/Sampel Keluar/Reagen Masuk)', 'Ekspedisi / Kurir', 'Asal Pengiriman', 'Tujuan', 'Kondisi Suhu', 'Penerima', 'Segel Utuh (YA/TIDAK)', 'Status'],
    sampleRow: {
      'No Tracking / Resi': 'TRK-EXP-9921',
      'Tipe (Sampel Masuk/Sampel Keluar/Reagen Masuk)': 'Sampel Masuk',
      'Ekspedisi / Kurir': 'DHL Cold Chain Logistics',
      'Asal Pengiriman': 'Site Tambang Nikel Morowali',
      'Tujuan': 'Lab B.J. Habibie Gedung 442',
      'Kondisi Suhu': 'Cold Chain (2-8°C)',
      'Penerima': 'Dimas Wahyu',
      'Segel Utuh (YA/TIDAK)': 'YA',
      'Status': 'Diterima di Lab',
    },
    mapper: (r) => ({
      id: uid(),
      trackingNo: String(r['No Tracking / Resi'] || r['Resi'] || `TRK-${today().replace(/-/g, '')}`),
      type: (r['Tipe'] || r['Tipe (Sampel Masuk/Sampel Keluar/Reagen Masuk)'] || 'Sampel Masuk') as any,
      courier: String(r['Ekspedisi / Kurir'] || r['Kurir'] || 'Kurir Ekspedisi'),
      origin: String(r['Asal Pengiriman'] || r['Asal'] || '-'),
      destination: String(r['Tujuan'] || 'Lab PT Veritas'),
      tempCondition: (r['Kondisi Suhu'] || 'Ambient (20-25°C)') as any,
      receivedDate: today(),
      status: (r['Status'] || 'Diterima di Lab') as any,
      receiver: String(r['Penerima'] || 'Staf Lab'),
      sealIntact: String(r['Segel Utuh (YA/TIDAK)'] || '').toUpperCase() !== 'TIDAK',
    }),
  },
  competencies: {
    key: 'competencies',
    title: 'Matriks Kompetensi Analis ISO 17025',
    category: 'People & Administration',
    filename: 'Template_Impor_Kompetensi_Analis_ISO17025.xlsx',
    columns: ['Nama Lengkap Analis', 'NIP / ID', 'Jabatan / Peran', 'Departemen', 'Pendidikan', 'Instrumen Diotorisasi (pisahkan koma)', 'Metode Uji Diotorisasi (pisahkan koma)', 'Sertifikasi K3 (YA/TIDAK)', 'Sertifikasi BNSP (YA/TIDAK)', 'Status Kualifikasi'],
    sampleRow: {
      'Nama Lengkap Analis': 'Dimas Wahyu, S.Si.',
      'NIP / ID': 'NV-2022-014',
      'Jabatan / Peran': 'Senior Analyst Spektroskopi',
      'Departemen': 'Laboratorium Kimia Anorganik',
      'Pendidikan': 'S1 Kimia',
      'Instrumen Diotorisasi (pisahkan koma)': 'ICP-OES Avio 500, AAS PinAAcle 900T',
      'Metode Uji Diotorisasi (pisahkan koma)': 'SNI 6989.59:2008 Logam Terlarut, APHA 3120 B',
      'Sertifikasi K3 (YA/TIDAK)': 'YA',
      'Sertifikasi BNSP (YA/TIDAK)': 'YA',
      'Status Kualifikasi': 'Terkualifikasi Penuh',
    },
    mapper: (r) => {
      const instStr = String(r['Instrumen Diotorisasi (pisahkan koma)'] || r['Instrumen'] || 'ICP-OES Avio 500');
      const methStr = String(r['Metode Uji Diotorisasi (pisahkan koma)'] || r['Metode'] || 'SNI 6989.59:2008');
      return {
        id: uid(),
        employeeName: String(r['Nama Lengkap Analis'] || r['Nama'] || 'Analis Baru'),
        nipOrId: String(r['NIP / ID'] || r['NIP'] || `NV-${today().replace(/-/g, '')}`),
        role: String(r['Jabatan / Peran'] || r['Jabatan'] || 'Analis Lab'),
        department: String(r['Departemen'] || 'Laboratorium'),
        education: String(r['Pendidikan'] || 'S1 Kimia'),
        instrumentsAuthorized: instStr.split(',').map((s) => s.trim()).filter(Boolean),
        methodsAuthorized: methStr.split(',').map((s) => s.trim()).filter(Boolean),
        k3Certified: String(r['Sertifikasi K3 (YA/TIDAK)'] || '').toUpperCase() === 'YA',
        bnspCertified: String(r['Sertifikasi BNSP (YA/TIDAK)'] || '').toUpperCase() === 'YA',
        lastEvaluated: today(),
        nextEvaluation: today(),
        status: (r['Status Kualifikasi'] || 'Terkualifikasi Penuh') as any,
      };
    },
  },
  employees: {
    key: 'employees',
    title: 'Direktori Karyawan & Personel',
    category: 'People & Administration',
    filename: 'Template_Impor_Direktori_Karyawan.xlsx',
    columns: ['Nama Lengkap', 'NIP', 'Email', 'No Telepon / WA', 'Departemen', 'Jabatan / Posisi', 'Tanggal Bergabung', 'Status (Aktif/Cuti/Resigned)', 'Kontak Darurat'],
    sampleRow: {
      'Nama Lengkap': 'Amanda Kusuma, S.I.Kom.',
      'NIP': 'NV-2023-018',
      'Email': 'amanda.kusuma@veritaslab.co.id',
      'No Telepon / WA': '+62 811 7766 5544',
      'Departemen': 'Komersial & Client Relations',
      'Jabatan / Posisi': 'Senior Account Manager CRM',
      'Tanggal Bergabung': '2023-04-01',
      'Status (Aktif/Cuti/Resigned)': 'Aktif',
      'Kontak Darurat': '+62 811 3322 1100 (Suami)',
    },
    mapper: (r) => ({
      id: uid(),
      name: String(r['Nama Lengkap'] || r['Nama'] || 'Karyawan Baru'),
      nip: String(r['NIP'] || `NV-${today().replace(/-/g, '')}`),
      email: String(r['Email'] || ''),
      phone: String(r['No Telepon / WA'] || r['Telepon'] || ''),
      department: String(r['Departemen'] || 'Umum'),
      position: String(r['Jabatan / Posisi'] || r['Jabatan'] || 'Staf'),
      joinDate: String(r['Tanggal Bergabung'] || today()),
      status: (r['Status'] || r['Status (Aktif/Cuti/Resigned)'] || 'Aktif') as any,
      emergencyContact: String(r['Kontak Darurat'] || ''),
    }),
  },
  inv: {
    key: 'inv',
    title: 'Inventori & Stok Reagen',
    category: 'Logistics & Supply Chain',
    filename: 'Template_Impor_Inventori_Reagen.xlsx',
    columns: ['Nama Reagen / Item', 'Instrumen Terkait', 'Satuan', 'Stok Saat Ini', 'Batas Minimum Stok', 'Tanggal Kadaluarsa (Exp)'],
    sampleRow: {
      'Nama Reagen / Item': 'Asam Klorida (HCl) 37% Suprapur Merck',
      'Instrumen Terkait': 'ICP-OES Avio 500',
      'Satuan': 'Botol 1L',
      'Stok Saat Ini': 8,
      'Batas Minimum Stok': 2,
      'Tanggal Kadaluarsa (Exp)': '2027-06-30',
    },
    mapper: (r) => ({
      id: uid(),
      name: String(r['Nama Reagen / Item'] || r['Nama'] || 'Item Baru'),
      inst: String(r['Instrumen Terkait'] || r['Instrumen'] || 'Semua Instrumen'),
      unit: String(r['Satuan'] || 'Botol'),
      stock: Number(r['Stok Saat Ini'] || r['Stok'] || 0),
      min: Number(r['Batas Minimum Stok'] || r['Min'] || 1),
      exp: String(r['Tanggal Kadaluarsa (Exp)'] || r['Exp'] || ''),
    }),
  },
};

(MODULE_CONFIGS as any).procurement = MODULE_CONFIGS.procurements;
(MODULE_CONFIGS as any).competency = MODULE_CONFIGS.competencies;

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  targetModule,
  onClose,
  onImportComplete,
}) => {
  const [selectedModule, setSelectedModule] = useState<ImportableModule>(targetModule);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsing, setParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectedModule(targetModule);
    setFile(null);
    setParsedRows([]);
    setPreviewHeaders([]);
    setErrorMsg(null);
  }, [targetModule, isOpen]);

  if (!isOpen) return null;

  const currentConfig = MODULE_CONFIGS[selectedModule] || MODULE_CONFIGS.accounts;

  // Download official pre-filled template
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([currentConfig.sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, currentConfig.filename);
  };

  // Process uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('File Excel tidak memiliki baris data.');
          setParsing(false);
          return;
        }

        const headers = Object.keys(rawJson[0]);
        setPreviewHeaders(headers);

        const mapped = rawJson.map(currentConfig.mapper);
        setParsedRows(mapped);
        setParsing(false);
      } catch (err: any) {
        console.error('Parsing error:', err);
        setErrorMsg(`Gagal membaca file Excel: ${err.message || 'Format tidak valid'}`);
        setParsing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Belum ada data yang siap diimpor.');
      return;
    }
    onImportComplete(selectedModule, parsedRows, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Impor Data Excel &amp; Sinkronisasi Panel
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Impor file .xlsx / .csv dengan pemetaan kolom otomatis ke basis data VERITAS ENTER
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)]">
          {/* Target Module Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Target Panel yang Akan Diimpor:
            </label>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value as ImportableModule);
                setFile(null);
                setParsedRows([]);
                setErrorMsg(null);
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {Object.values(MODULE_CONFIGS).map((cfg) => (
                <option key={cfg.key} value={cfg.key}>
                  [{cfg.category}] {cfg.title}
                </option>
              ))}
            </select>
          </div>

          {/* Download Official Template Box */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Unduh Format Template Standar</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Gunakan template resmi untuk format header kolom yang presisi
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih / Unggah File Excel Anda:
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-slate-700 dark:bg-slate-800/30 cursor-pointer transition"
            >
              <Upload className="h-8 w-8 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Klik untuk memilih file Excel (.xlsx / .xls / .csv)'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB &bull; Siap diproses`
                  : 'Atau drag & drop file dari komputer Anda ke area ini'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                hidden
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table if rows parsed */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Pratinjau Data Terbaca ({parsedRows.length} Baris Data Ditemukan)</span>
                </span>
                <span className="text-[10px] text-slate-400">Menampilkan 5 baris pertama</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-44 dark:border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 font-semibold">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      {previewHeaders.slice(0, 5).map((h, i) => (
                        <th key={i} className="py-2 px-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-1.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        {previewHeaders.slice(0, 5).map((h, i) => (
                          <td key={i} className="py-1.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {String(row[Object.keys(row)[i + 1]] || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Mode Radio */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Metode Penambahan ke Basis Data:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2 rounded-xl border p-3 cursor-pointer transition ${
                      importMode === 'append'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Gabungkan Data (Append)
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Tambahkan baris baru ke dalam data yang sudah ada tanpa menghapus data lama.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 rounded-xl border p-3 cursor-pointer transition ${
                      importMode === 'replace'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Gantikan Data Saat Ini (Overwrite)
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Hapus data modul saat ini dan ganti seutuhnya dengan data dari file Excel.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="text-[11px] text-slate-500">
            {parsedRows.length > 0 ? (
              <span className="font-semibold text-emerald-600">
                {parsedRows.length} entitas siap disinkronisasi
              </span>
            ) : (
              'Silakan pilih file untuk memulai pratinjau'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 transition"
            >
              Batal
            </button>
            <button
              disabled={parsedRows.length === 0 || parsing}
              onClick={handleExecuteImport}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Mulai Impor ke Sistem</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
