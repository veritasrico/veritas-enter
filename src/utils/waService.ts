export interface WaTemplateOption {
  id: string;
  title: string;
  template: (data: any) => string;
}

export const WA_TEMPLATES: WaTemplateOption[] = [
  {
    id: 'referral_followup',
    title: 'Sinyal Follow-Up Klien Referral',
    template: (data) =>
      `Halo Bapak/Ibu ${data.name || ''} dari ${data.pic || ''},\n\nTerima kasih atas rekomendasi dari kolega Bapak/Ibu untuk pengujian laboratorium di PT NUSA VERITAS INSPEKTAMA.\n\nKami siap membantu kebutuhan analisa dan karakterisasi sampel riset / industri Anda. Apakah kami dapat jadwalkan diskusi singkat via telepon atau meeting online hari ini?\n\nSalam hormat,\nRicoh Sutrisno\nLaboratory Manager acting as General Manager\nPT NUSA VERITAS INSPEKTAMA (Telp: +62 21 293 257 39 / WA: +62 811 9811 562)`,
  },
  {
    id: 'quote_sent',
    title: 'Pengiriman Penawaran Harga (Quotation)',
    template: (data) =>
      `Yth. Bapak/Ibu ${data.name || ''} (${data.pic || ''}),\n\nKami telah menerbitkan Surat Penawaran Harga resmi No: ${data.quoteNo || ''} untuk perihal: "${data.perihal || 'Pengujian Laboratorium'}".\n\nTotal nilai penawaran: Rp ${(Number(data.amount) || 0).toLocaleString('id-ID')} (sudah termasuk PPN).\n\nDokumen resmi penawaran telah kami kirimkan ke email ${data.email || ''}. Mohon konfirmasinya jika telah diterima.\n\nTerima kasih,\nPT NUSA VERITAS INSPEKTAMA`,
  },
  {
    id: 'sample_ready',
    title: 'Pemberitahuan Sampel Selesai Dianalisa',
    template: (data) =>
      `Kabar Baik! Yth. Bapak/Ibu ${data.name || ''} (${data.pic || ''}),\n\nKami informasikan bahwa pengujian untuk ID Sampel: ${data.sid || ''} dengan layanan instrumen ${data.service || ''} telah SELESAI diproses di laboratorium kami.\n\nData mentah dan draf Sertifikat Hasil Uji (Certificate of Analysis) siap untuk ditinjau.\n\nSalam hangat,\nTim Analis Laboratorium\nPT NUSA VERITAS INSPEKTAMA`,
  },
  {
    id: 'invoice_reminder',
    title: 'Pengingat Pembayaran Invoice',
    template: (data) =>
      `Yth. Bagian Keuangan / Bapak/Ibu ${data.name || ''} (${data.pic || ''}),\n\nKami ingin menginformasikan pengingat tagihan Invoice No: ${data.invoiceNo || ''} dengan nilai tagihan Rp ${(Number(data.amount) || 0).toLocaleString('id-ID')}, yang jatuh tempo pada ${data.due || ''}.\n\nPembayaran dapat ditransfer ke:\n${data.bank || 'Bank Mandiri No. Rek: 133-00-987654-1 a.n. PT NUSA VERITAS INSPEKTAMA'}\n\nMohon abaikan pesan ini jika pembayaran telah dilakukan.\n\nTerima kasih atas kerja samanya.\nPT NUSA VERITAS INSPEKTAMA`,
  },
];

export function buildWaUrl(phone: string, text: string): string {
  let clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62') && clean.length > 6) {
    clean = '62' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export async function sendWaNotice(payload: {
  phone: string;
  clientName?: string;
  templateId?: string;
  customText: string;
}) {
  try {
    const res = await fetch('/api/wa/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('WA backend fallback:', err);
    return {
      success: true,
      directUrl: buildWaUrl(payload.phone, payload.customText),
      status: 'Fallback ke WhatsApp Web Gateway',
    };
  }
}
