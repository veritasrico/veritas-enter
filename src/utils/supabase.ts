import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xirjwumegtyxwcullegn.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_t0nyWbcf-v2kYZOlbq5ZCQ_FEdICTHf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
