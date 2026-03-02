export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          type: 'income' | 'expense' | 'transfer';
          category_id: string;
          store_name: string | null;
          memo: string | null;
          source: 'manual' | 'csv_mf' | 'csv_zaim' | 'receipt' | 'recurring' | 'voice';
          location_lat: number | null;
          location_lng: number | null;
          category_confidence: number | null;
          category_source: 'builtin' | 'user_dict' | 'ai' | 'manual' | null;
          category_confirmed: boolean;
          created_at: string;
        };
        Insert: Omit<Transactions['Row'], 'id' | 'created_at' | 'category_confirmed'>;
        Update: Partial<Transactions['Row']>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_id: string | null;
          color: string;
          sort_order: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Categories['Row'], 'id' | 'created_at'>;
        Update: Partial<Categories['Row']>;
      };
      ai_comments: {
        Row: {
          id: string;
          user_id: string;
          period: string;
          type: 'weekly' | 'monthly';
          content: Json;
          tone: 'gentle' | 'normal' | 'strict';
          created_at: string;
        };
        Insert: Omit<AiComments['Row'], 'id' | 'created_at'>;
        Update: Partial<AiComments['Row']>;
      };
      user_settings: {
        Row: {
          user_id: string;
          monthly_budget: number;
          ai_tone: 'gentle' | 'normal' | 'strict';
          csv_source: 'moneyforward' | 'zaim' | null;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<UserSettings['Row'], 'user_id' | 'created_at' | 'updated_at'> & { user_id: string };
        Update: Partial<UserSettings['Row']>;
      };
      store_category_mappings: {
        Row: {
          id: string;
          user_id: string;
          store_pattern: string;
          category_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<StoreCategoryMappings['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<StoreCategoryMappings['Row']>;
      };
      category_budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          period_type: 'monthly' | 'quarterly' | 'yearly';
          start_date: string;
          end_date: string;
          alert_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<CategoryBudgets['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<CategoryBudgets['Row']>;
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          store_name: string | null;
          memo: string | null;
          frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
          day_of_month: number | null;
          month_quarter: number | null;
          day_of_year: number | null;
          next_due_date: string;
          auto_generate: boolean;
          end_date: string | null;
          is_active: boolean;
          last_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<RecurringTransactions['Row'], 'id' | 'created_at' | 'updated_at' | 'last_generated_at'>;
        Update: Partial<RecurringTransactions['Row']>;
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: 'streak_7' | 'streak_30' | 'streak_100' | 'first_month' | 'under_budget' | 'savings_goal' | 'early_adopter';
          earned_at: string;
          metadata: Json | null;
        };
        Insert: Omit<UserBadges['Row'], 'id' | 'earned_at'>;
        Update: Partial<UserBadges['Row']>;
      };
      streak_records: {
        Row: {
          id: string;
          user_id: string;
          record_date: string;
          transaction_count: number;
          created_at: string;
        };
        Insert: Omit<StreakRecords['Row'], 'id' | 'created_at'>;
        Update: Partial<StreakRecords['Row']>;
      };
      saving_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_amount: number;
          current_amount: number;
          period_start: string;
          period_end: string;
          baseline_amount: number | null;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<SavingGoals['Row'], 'id' | 'created_at' | 'updated_at' | 'completed_at'>;
        Update: Partial<SavingGoals['Row']>;
      };
      anomaly_alerts: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string | null;
          alert_type: 'high_amount' | 'frequency_same_store' | 'late_night' | 'budget_over' | 'category_spike';
          severity: 'low' | 'medium' | 'high';
          description: string | null;
          comparison_data: Json | null;
          is_read: boolean;
          is_dismissed: boolean;
          dismissed_at: string | null;
          created_at: string;
        };
        Insert: Omit<AnomalyAlerts['Row'], 'id' | 'created_at' | 'dismissed_at'>;
        Update: Partial<AnomalyAlerts['Row']>;
      };
      spending_patterns: {
        Row: {
          id: string;
          user_id: string;
          period: string;
          pattern_type: 'weekday' | 'hour' | 'category_correlation' | 'seasonal';
          pattern_data: Json;
          created_at: string;
        };
        Insert: Omit<SpendingPatterns['Row'], 'id' | 'created_at'>;
        Update: Partial<SpendingPatterns['Row']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
