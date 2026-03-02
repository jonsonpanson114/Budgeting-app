import { Database } from './types';

// データベースの型定義
// Supabaseから型を生成するまでの暫定定義

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];
export type Functions = Database['public']['Functions'];
