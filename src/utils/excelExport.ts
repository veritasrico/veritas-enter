import * as XLSX from 'xlsx';
import { AppState } from '../types';

export interface ExcelExportOptions {
  includeDeals?: boolean;
  includeLabs?: boolean;
  includeQcQa?: boolean;
  includeAccounts?: boolean;
  includeFinance?: boolean;
  includeQuotes?: boolean;
  includeInstruments?: boolean;
  includeInventory?: boolean;
  includeActivities?: boolean;
  includeMarketing?: boolean;
  includeCatalog?: boolean;
  includeLogs?: boolean;
  includeUsers?: boolean;
}

export function exportAllDataToExcel(state: AppState, options?: ExcelExportOptions) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);

  // 1. Sheet Ringkasan Eksekutif
  const wonDeals = state.deals.filter((d) => d.stage === 'Won');
  const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const openDeals = state.deals.filter((d) => !['Won', 'Lost'].includes(d.stage));
  const pipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const totalInvoiced = state.fins.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalPaidRevenue = state.fins.reduce((sum, f) => sum + (Number(f.paid) || 0), 0);
  const totalPendingRevenue = Math.max(0, totalInvoiced - totalPaidRevenue);

  const completedLabs = state.labs.filter((l) => l.serviceStatus === 'Selesai' || l.completedLogged);
  const activeLabs = state.labs.filter((l) => l.serviceStatus !== 'Selesai' && !l.completedLogged);

  const summaryData = [
    { Parameter: 'Nama Perusahaan', Nilai: state.settings?.co?.name || 'PT NUSA VERITAS INSPEKTAMA' },
    { Parameter: 'Tanggal Ekspor Data', Nilai: new Date().toLocaleString('id-ID') },
    { Parameter: 'Total Kontak Pelanggan / Institusi', Nilai: state.accounts.length },
    { Parameter: 'Total Peluang Deal', Nilai: state.deals.length },
    { Parameter: 'Nilai Deal Berhasil (Won)', Nilai: `Rp ${wonValue.toLocaleString('id-ID')}` },
    { Parameter: 'Nilai Pipeline Berjalan', Nilai: `Rp ${pipelineValue.toLocaleString('id-ID')}` },
    { Parameter: 'Total Work Order Laboratorium', Nilai: state.labs.length },
    { Parameter: 'Sampel Sedang Diproses', Nilai: activeLabs.length },
    { Parameter: 'Sampel Selesai Diuji', Nilai: completedLabs.length },
    { Parameter: 'Total Faktur Invoice', Nilai: state.fins.length },
    { Parameter: 'Total Pendapatan Terbayar', Nilai: `Rp ${totalPaidRevenue.toLocaleString('id-ID')}` },
    { Parameter: 'Tagihan Belum Lunas', Nilai: `Rp ${totalPendingRevenue.toLocaleString('id-ID')}` },
    { Parameter: 'Master Instrumen Terdaftar', Nilai: state.insts.length },
    { Parameter: 'Item Inventori & Reagen', Nilai: state.inv.length },
    { Parameter: 'Tindakan CAPA QC/QA', Nilai: state.qcqa?.actions?.length || 0 },
    { Parameter: 'Total Log Audit Trail Tercatat', Nilai: state.log.length },
    { Parameter: 'Total Akun Pengguna Terdaftar', Nilai: (state.users || []).length },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // 2. Sheet Papan Deal & Pipeline
  if (!options || options.includeDeals !== false) {
    const dealsData = state.deals.map((d, idx) => {
      const acc = state.accounts.find((a) => a.id === d.accId);
      return {
        No: idx + 1,
        ID_Deal: d.id,
        Judul_Peluang: d.title,
        Klien_Perusahaan: acc?.name || '-',
        Segmen_Industri: acc?.industry || '-',
        Nilai_IDR: d.value,
        Tahap_Pipeline: d.stage,
        PIC_Owner: d.owner,
        Target_Closing: d.close,
        Probabilitas_Persen: d.probability || 0,
        Status_Layanan: d.serviceStatus || 'Normal',
        Catatan_Layanan: d.serviceClosedNote || '-',
      };
    });
    const wsDeals = XLSX.utils.json_to_sheet(dealsData.length > 0 ? dealsData : [{ Pesan: 'Belum ada data deal' }]);
    XLSX.utils.book_append_sheet(wb, wsDeals, 'Pipeline Deal');
  }

  // 3. Sheet Laboratorium & Sampel
  if (!options || options.includeLabs !== false) {
    const labsData = state.labs.map((l, idx) => {
      const acc = state.accounts.find((a) => a.id === l.accId);
      return {
        No: idx + 1,
        ID_WorkOrder: l.id,
        Sample_ID: l.sid,
        Customer_Instansi: acc?.name || '-',
        Layanan_Instrumen: l.service,
        Tipe_Klien: l.cust,
        Analis_Penanggung_Jawab: l.analyst || '-',
        Tanggal_Penerimaan: l.date,
        Jumlah_Sampel_Masuk: l.masuk,
        Jumlah_Sampel_Dianalisa: l.analisa,
        Jam_Operasional: l.jam,
        Status_Layanan: l.serviceStatus || (l.completedLogged ? 'Selesai' : 'Normal'),
        Catatan: l.note || '-',
      };
    });
    const wsLabs = XLSX.utils.json_to_sheet(labsData.length > 0 ? labsData : [{ Pesan: 'Belum ada data work order laboratorium' }]);
    XLSX.utils.book_append_sheet(wb, wsLabs, 'Work Order Lab');
  }

  // 4. Sheet Panel QC/QA & CAPA ISO 17025
  if (!options || options.includeQcQa !== false) {
    const capaData = (state.qcqa?.actions || []).map((c, idx) => ({
      No: idx + 1,
      ID_CAPA: c.id,
      Tanggal_Lapor: c.date,
      Sumber_Temuan: c.source,
      Area_Uji: c.area,
      Penanggung_Jawab: c.owner,
      Deskripsi_Ketidaksesuaian: c.description,
      Analisis_Akar_Masalah: c.cause || '-',
      Tindakan_Koreksi_Langsung: c.immediate || '-',
      Tindakan_Pencegahan_CAPA: c.corrective || '-',
      Target_Selesai: c.target || '-',
      Status: c.status,
      Verifikasi_Efektivitas: c.verification || '-',
    }));
    const wsQcQa = XLSX.utils.json_to_sheet(capaData.length > 0 ? capaData : [{ Pesan: 'Belum ada data tindakan CAPA QC/QA' }]);
    XLSX.utils.book_append_sheet(wb, wsQcQa, 'CAPA QC-QA 17025');
  }

  // 5. Sheet Kontak & Pelanggan
  if (!options || options.includeAccounts !== false) {
    const accountsData = state.accounts.map((a, idx) => ({
      No: idx + 1,
      ID_Kontak: a.id,
      Nama_Customer: a.name,
      Perusahaan_Institusi: a.pic,
      Segmen_Bidang: a.industry,
      Email: a.email,
      No_Telepon_WhatsApp: a.phone,
      Sumber_Lead: a.source,
      Status_Referral: a.referralStatus || 'New',
      Alamat: a.addr || '-',
      Catatan: a.notes || '-',
    }));
    const wsAccounts = XLSX.utils.json_to_sheet(accountsData.length > 0 ? accountsData : [{ Pesan: 'Belum ada data kontak pelanggan' }]);
    XLSX.utils.book_append_sheet(wb, wsAccounts, 'Kontak Pelanggan');
  }

  // 6. Sheet Keuangan & Invoice
  if (!options || options.includeFinance !== false) {
    const finsData = state.fins.map((f, idx) => {
      const acc = state.accounts.find((a) => a.id === f.accId);
      const isLunas = (f.paid || 0) >= (f.amount || 0);
      const isSebagian = (f.paid || 0) > 0 && !isLunas;
      const statusBayar = isLunas ? 'Lunas' : isSebagian ? 'Sebagian' : 'Belum Bayar';

      return {
        No: idx + 1,
        Nomor_Faktur: f.no,
        Klien_Pembeli: acc?.name || '-',
        Nilai_Tagihan_IDR: f.amount,
        Nilai_Terbayar_IDR: f.paid,
        Sisa_Piutang_IDR: Math.max(0, f.amount - f.paid),
        PPN_IDR: f.ppn || 0,
        Tanggal_Terbit: f.date,
        Jatuh_Tempo: f.due,
        Status_Pembayaran: statusBayar,
        Perihal: f.perihal || '-',
        Catatan: f.note || '-',
      };
    });
    const wsFins = XLSX.utils.json_to_sheet(finsData.length > 0 ? finsData : [{ Pesan: 'Belum ada data invoice' }]);
    XLSX.utils.book_append_sheet(wb, wsFins, 'Keuangan & Faktur');
  }

  // 7. Sheet Penawaran Harga (Quotes)
  if (!options || options.includeQuotes !== false) {
    const quotesData = state.quotes.map((q, idx) => {
      const acc = state.accounts.find((a) => a.id === q.accId);
      return {
        No: idx + 1,
        Nomor_Penawaran: q.no,
        Klien_Tujuan: acc?.name || '-',
        Total_Nilai_IDR: q.amount,
        PPN_IDR: q.ppn || 0,
        Tanggal_Penawaran: q.date,
        Masa_Berlaku: q.valid,
        Status_Penawaran: q.status,
        Perihal: q.perihal || '-',
        Catatan: q.note || '-',
        Jumlah_Item: q.items?.length || 0,
      };
    });
    const wsQuotes = XLSX.utils.json_to_sheet(quotesData.length > 0 ? quotesData : [{ Pesan: 'Belum ada data penawaran harga' }]);
    XLSX.utils.book_append_sheet(wb, wsQuotes, 'Penawaran Harga');
  }

  // 8. Sheet Master Instrumen
  if (!options || options.includeInstruments !== false) {
    const instsData = state.insts.map((i, idx) => ({
      No: idx + 1,
      ID_Alat: i.id,
      Nama_Instrumen: i.name,
      Merek_Model: i.brand,
      PIC_Analis: i.pic || '-',
      Target_Jam_Bulanan: i.target,
      Jam_Operasional_Bulan_Ini: i.ops,
      Interval_Kalibrasi_Hari: i.int,
      Kalibrasi_Terakhir: i.last || '-',
      Kalibrasi_Berikutnya: i.next || '-',
      Interval_PM_Hari: i.pmInt,
      PM_Terakhir: i.pmLast || '-',
      PM_Berikutnya: i.pmNext || '-',
      Keterangan_Spesifikasi: i.note || '-',
    }));
    const wsInsts = XLSX.utils.json_to_sheet(instsData.length > 0 ? instsData : [{ Pesan: 'Belum ada data master instrumen' }]);
    XLSX.utils.book_append_sheet(wb, wsInsts, 'Master Instrumen');
  }

  // 9. Sheet Inventori & Reagen
  if (!options || options.includeInventory !== false) {
    const invData = state.inv.map((item, idx) => ({
      No: idx + 1,
      ID_Item: item.id,
      Nama_Barang_Reagen: item.name,
      Instrumen_Terkait: item.inst || '-',
      Stok_Tersedia: item.stock,
      Satuan: item.unit,
      Stok_Minimum: item.min,
      Tanggal_Kadaluarsa: item.exp || '-',
      Catatan: item.note || '-',
    }));
    const wsInv = XLSX.utils.json_to_sheet(invData.length > 0 ? invData : [{ Pesan: 'Belum ada data inventori' }]);
    XLSX.utils.book_append_sheet(wb, wsInv, 'Inventori & Reagen');
  }

  // 10. Sheet Aktivitas Sales
  if (!options || options.includeActivities !== false) {
    const actsData = state.acts.map((act, idx) => {
      const acc = state.accounts.find((a) => a.id === act.accId);
      return {
        No: idx + 1,
        ID_Aktivitas: act.id,
        Tanggal: act.date,
        Jenis_Aktivitas: act.type,
        Klien_Terkait: acc?.name || '-',
        Status: act.status,
        Catatan_Hasil: act.note,
      };
    });
    const wsActs = XLSX.utils.json_to_sheet(actsData.length > 0 ? actsData : [{ Pesan: 'Belum ada data aktivitas sales' }]);
    XLSX.utils.book_append_sheet(wb, wsActs, 'Aktivitas Sales');
  }

  // 11. Sheet Digital Marketing
  if (!options || options.includeMarketing !== false) {
    const mktData = state.mkt.map((m, idx) => ({
      No: idx + 1,
      ID_Campaign: m.id,
      Tanggal: m.date,
      Saluran_Channel: m.channel,
      Nama_Program: m.name,
      Biaya_Spend_IDR: m.spend,
      Jangkauan_Reach: m.reach,
      Jumlah_Klik: m.clicks,
      Jumlah_Lead_Didapat: m.leads,
      Status: m.status || '-',
      Catatan: m.note || '-',
    }));
    const wsMkt = XLSX.utils.json_to_sheet(mktData.length > 0 ? mktData : [{ Pesan: 'Belum ada data marketing' }]);
    XLSX.utils.book_append_sheet(wb, wsMkt, 'Digital Marketing');
  }

  // 12. Sheet Katalog Layanan
  if (!options || options.includeCatalog !== false) {
    const catData = state.cat.map((c, idx) => ({
      No: idx + 1,
      ID_Layanan: c.id,
      Deskripsi_Layanan: c.d,
      Metode_Uji_Instrumen: c.m,
      Harga_Satuan_IDR: c.p,
      Status_Layanan: c.status || 'Tersedia',
      Alasan_Tutup: c.closedReason || '-',
      Tutup_Mulai: c.closedFrom || '-',
      Tutup_Sampai: c.closedUntil || '-',
    }));
    const wsCat = XLSX.utils.json_to_sheet(catData.length > 0 ? catData : [{ Pesan: 'Belum ada data katalog' }]);
    XLSX.utils.book_append_sheet(wb, wsCat, 'Katalog Layanan');
  }

  // 13. Sheet Audit Trail Log Book
  if (!options || options.includeLogs !== false) {
    const logsData = state.log.slice(0, 1000).map((l, idx) => ({
      No: idx + 1,
      Waktu_Catat: new Date(l.ts).toLocaleString('id-ID'),
      Petugas_User: l.user,
      Peran_Role: l.role,
      Jenis_Aksi: l.action,
      Modul_Sistem: l.mod,
      Referensi_Objek: l.ref,
      Catatan_Aktivitas: l.note,
    }));
    const wsLogs = XLSX.utils.json_to_sheet(logsData.length > 0 ? logsData : [{ Pesan: 'Belum ada catatan log book' }]);
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Log Book Audit');
  }

  // 14. Sheet Akun Pengguna & Hak Akses
  if (!options || options.includeUsers !== false) {
    const usersData = (state.users || []).map((u, idx) => ({
      No: idx + 1,
      ID_Pengguna: u.id,
      Username: u.username,
      Nama_Lengkap: u.name,
      Peran_Role: u.role,
      Divisi_Unit: u.department,
      Status: u.isActive ? 'Aktif' : 'Nonaktif',
      Proteksi_PIN: u.pin ? 'Ya' : 'Tidak',
      Jumlah_Modul_Diizinkan: u.allowedTabs.length,
      Daftar_Modul: u.allowedTabs.join(', '),
      Tanggal_Dibuat: u.createdAt,
    }));
    const wsUsers = XLSX.utils.json_to_sheet(usersData.length > 0 ? usersData : [{ Pesan: 'Belum ada data pengguna' }]);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Daftar Pengguna');
  }

  const fileName = `Veritas_Integrated_Data_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
