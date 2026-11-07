import { Env, getDatabase, setDatabase, jsonResponse, handleOptions } from '../_shared';

export const onRequestOptions = () => handleOptions();

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = await getDatabase(context.env);
    return jsonResponse({
      status: 'ok',
      syncedAt: db.syncedAt,
      hasData: !!db.data,
      data: db.data,
    });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Failed to read cloud state' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const { data, clientTimestamp } = body || {};
    const syncedAt = new Date().toISOString();

    if (data) {
      await setDatabase(context.env, data, syncedAt);
    }

    return jsonResponse({
      success: true,
      syncedAt,
      clientTimestamp,
      message: 'Sinkronisasi awan berhasil diperbarui.',
    });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Gagal sinkronisasi awan' }, 500);
  }
};
