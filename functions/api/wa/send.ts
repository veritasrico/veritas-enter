import { jsonResponse, handleOptions } from '../../_shared';

export const onRequestOptions = () => handleOptions();

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const { phone, clientName, customText } = body;

    if (!phone) {
      return jsonResponse({ error: 'Nomor telepon tujuan wajib diisi' }, 400);
    }

    // Clean phone number (format 62...)
    let cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const encodedMsg = encodeURIComponent(
      customText || `Halo ${clientName || 'Bapak/Ibu'}, kami dari PT Veritas Enterprise.`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

    return jsonResponse({
      success: true,
      targetPhone: cleanPhone,
      directUrl: waUrl,
      timestamp: new Date().toISOString(),
      status: 'Terkirim ke WhatsApp Web / Mobile Gateway',
    });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Gagal memproses pengiriman WhatsApp' }, 500);
  }
};
