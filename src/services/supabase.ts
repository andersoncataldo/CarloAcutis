import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cagywhslrofuwlmpzbfy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_mmxRQpS9zKRRmndSiE8i6g_qVvdTSsa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
