import { supabase } from '../../../lib/supabase/client';
import type { AIComment, AITone } from '../../../lib/types/common';

/**
 * 支出分析をリクエストする
 */
export async function analyzeSpending(
  userId: string,
  period: string,
  tone: AITone = 'normal'
): Promise<AIComment> {
  // Supabase Edge Functionを呼び出し
  const { data, error } = await supabase.functions.invoke('analyze-spending', {
    body: {
      method: 'analyze-spending',
      userId,
      period,
      tone,
    },
  });

  if (error) {
    console.error('Error analyzing spending:', error);
    throw new Error('支出分析の取得に失敗しました');
  }

  return data as AIComment;
}

/**
 * 保存されたAIコメントを取得する
 */
export async function getAIComment(
  userId: string,
  period: string,
  type: 'weekly' | 'monthly' = 'monthly'
): Promise<AIComment | null> {
  const { data, error } = await supabase
    .from('ai_comments')
    .select('content, created_at')
    .eq('user_id', userId)
    .eq('period', period)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.content as AIComment;
}

/**
 * AIコメントをキャッシュから取得、なければ新規生成
 */
export async function getOrGenerateAIComment(
  userId: string,
  period: string,
  tone: AITone = 'normal',
  forceRefresh: boolean = false
): Promise<AIComment> {
  // 既存のコメントを取得
  if (!forceRefresh) {
    const existing = await getAIComment(userId, period, 'monthly');
    if (existing) {
      return existing;
    }
  }

  // 新規に分析をリクエスト
  return await analyzeSpending(userId, period, tone);
}

/**
 * 月次分析用のperiod文字列を生成
 */
export function getCurrentMonthPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 週次分析用のperiod文字列を生成
 */
export function getCurrentWeekPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  // ISO週番号を取得
  const week = getISOWeek(now);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * ISO週番号を取得するヘルパー関数
 */
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
}
