import { CapaAction, IsoGapItem, QcQaState } from '../types';
import rawData from './qcqaData.json';

export interface DailyQcItem {
  id: number;
  area: string;
  q: string;
  e: string;
}

export const DAILY_QC_QUESTIONS: DailyQcItem[] = rawData.daily;
export const ISO_GAP_QUESTIONS: IsoGapItem[] = rawData.gap;

export const DEFAULT_QCQA_STATE: QcQaState = {
  checks: {},
  actions: [],
  gaps: {},
};

export const QCQA_AREAS = [
  'Semua',
  'Kesiapan personel',
  'Lingkungan',
  'Peralatan',
  'Bahan/reagen',
  'Sampel',
  'Preparasi',
  'Metode',
  'QC hasil',
  'Data',
  'Perhitungan',
  'Pelaporan',
  'Pekerjaan tidak sesuai',
  'CAPA',
  'Dokumen',
  'K3/limbah',
  'Penutupan',
  'Handover',
  'Ketidakberpihakan',
  'Ketertelusuran',
  'Tinjauan supervisor',
] as const;

export const CAPA_SOURCES = [
  'Daily GLP',
  'GAP ISO 17025',
  'QC',
  'Keluhan',
  'Audit',
  'Lainnya',
] as const;

export const CAPA_STATUSES = ['Open', 'In progress', 'Closed'] as const;

/**
 * Export Helper for Daily Checklist to CSV
 */
export function exportDailyCsv(dateStr: string, checksOnDate: Record<number, any>) {
  const rows = [
    ['No', 'Area', 'Pertanyaan Pengawasan', 'Bukti Objektif', 'Status', 'Temuan', 'Tindakan Segera', 'PIC', 'Target Tanggal', 'Verifikasi'],
    ...DAILY_QC_QUESTIONS.map((q) => {
      const rec = checksOnDate[q.id] || {};
      return [
        q.id,
        q.area,
        q.q,
        q.e,
        rec.status || 'Belum Diperiksa',
        rec.finding || '-',
        rec.action || '-',
        rec.owner || '-',
        rec.target || '-',
        rec.verification || '-',
      ];
    }),
  ];

  downloadCsv(`Veritas_QC_Daily_GLP_${dateStr}.csv`, rows);
}

/**
 * Export Helper for Actions & CAPA to CSV
 */
export function exportActionsCsv(actions: CapaAction[]) {
  const rows = [
    ['ID CAPA', 'Tanggal', 'Sumber', 'Area / Klausul', 'Deskripsi Temuan', 'Risiko', 'Tindakan Segera', 'Akar Penyebab (RCA)', 'Tindakan Korektif', 'PIC', 'Target', 'Status', 'Verifikasi'],
    ...actions.map((x) => [
      x.id,
      x.date,
      x.source,
      x.area,
      x.description,
      x.risk || '-',
      x.immediate || '-',
      x.cause || '-',
      x.corrective || '-',
      x.owner || '-',
      x.target || '-',
      x.status,
      x.verification || '-',
    ]),
  ];

  downloadCsv(`Veritas_QCQA_CAPA_${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

/**
 * Export Helper for GAP Assessment ISO 17025 to CSV
 */
export function exportGapCsv(gaps: Record<number, any>) {
  const rows = [
    ['No', 'Klausul', 'Area', 'Pertanyaan Standar ISO 17025', 'Bukti Pemenuhan KAN', 'Skor (0-5)', 'Gap / Risiko', 'Rencana Tindakan', 'PIC', 'Target'],
    ...ISO_GAP_QUESTIONS.map((q) => {
      const x = gaps[q.id] || {};
      return [
        q.id,
        q.cl,
        q.area,
        q.q,
        q.e,
        x.score !== undefined ? x.score : '-',
        x.gap || '-',
        x.action || '-',
        x.owner || '-',
        x.target || '-',
      ];
    }),
  ];

  downloadCsv(`Veritas_GAP_Assessment_ISO17025_${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
