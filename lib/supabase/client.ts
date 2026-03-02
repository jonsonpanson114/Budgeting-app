import { createClient } from '@supabase/supabase-js';

// Supabaseの環境変数はプロジェクトルートの.env.localに設定してください
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
