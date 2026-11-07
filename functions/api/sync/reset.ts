import { Env, clearDatabase, jsonResponse, handleOptions } from '../../_shared';

export const onRequestOptions = () => handleOptions();

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    await clearDatabase(context.env);
    return jsonResponse({ success: true, message: 'Cloud database reset successfully' });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Failed to reset cloud database' }, 500);
  }
};
