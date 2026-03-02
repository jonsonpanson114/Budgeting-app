export type TransactionType = 'income' | 'expense' | 'transfer';
export type SourceType = 'manual' | 'csv_mf' | 'csv_zaim' | 'receipt' | 'recurring' | 'voice';
export type CategorySource = 'builtin' | 'user_dict' | 'ai' | 'manual';
export type AITone = 'gentle' | 'normal' | 'strict';

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  category_name?: string;
  category_color?: string;
  store_name?: string;
  memo?: string;
  source: SourceType;
  location_lat?: number;
  location_lng?: number;
  category_confidence?: number;
  category_source?: CategorySource;
  category_confirmed?: boolean;
  created_at: string;
}

export interface AIComment {
  insights: { label: string; text: string }[];
  suggestions: { label: string; text: string }[];
  praise: { label: string; text: string }[];
  summary: string;
}

export interface CategoryBudget {
  id: string;
  user_id: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  amount: number;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string;
  category_name?: string;
  amount: number;
  store_name?: string;
  memo?: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  day_of_month?: number;
  next_due_date: string;
  auto_generate: boolean;
  end_date?: string;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
  metadata?: Record<string, any>;
}

export type BadgeType =
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'first_month'
  | 'under_budget'
  | 'savings_goal'
  | 'early_adopter';

export interface SavingGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  period_start: string;
  period_end: string;
  baseline_amount?: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface AnomalyAlert {
  id: string;
  user_id: string;
  transaction_id?: string;
  alert_type: 'high_amount' | 'frequency_same_store' | 'late_night' | 'budget_over' | 'category_spike';
  severity: 'low' | 'medium' | 'high';
  description?: string;
  comparison_data?: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  monthly_budget: number;
  ai_tone: AITone;
  csv_source?: 'moneyforward' | 'zaim';
  notification_enabled: boolean;
}
