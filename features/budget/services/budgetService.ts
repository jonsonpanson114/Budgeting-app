import { supabase } from '../../../lib/supabase/client';
import { defaultCategories } from '../../../lib/constants/categories';
import type { CategoryBudget } from '../../../lib/types/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getCategoryBudgets(userId: string): Promise<CategoryBudget[]> {
  const cacheKey = `category_budgets_${userId}`;
  try {
    const { data, error } = await supabase
      .from('category_budgets')
      .select(`
        id,
        user_id,
        category_id,
        categories (
          name,
          color
        ),
        amount,
        period_type,
        start_date,
        end_date,
        alert_threshold,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      throw error;
    }

    const budgets = (data as CategoryBudget[]) || [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(budgets));
    return budgets;
  } catch (error) {
    console.error('Error fetching category budgets, trying cache:', error);
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Cache read error:', cacheError);
    }
    throw error;
  }
}

// カテゴリ別予算を設定
export async function setCategoryBudget(
  userId: string,
  categoryId: string,
  amount: number,
  periodType: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): Promise<void> {
  const { error } = await supabase
    .from('category_budgets')
    .upsert({
      user_id: userId,
      category_id: categoryId,
      amount,
      period_type: periodType,
      start_date: getPeriodStartDate(periodType),
      end_date: getPeriodEndDate(periodType),
      alert_threshold: 80,
      is_active: true,
    });

  if (error) {
    console.error('Error setting category budget:', error);
    throw error;
  }
}

// カテゴリ別予算を削除
export async function deleteCategoryBudget(budgetId: string): Promise<void> {
  const { error } = await supabase
    .from('category_budgets')
    .delete()
    .eq('id', budgetId);

  if (error) {
    console.error('Error deleting category budget:', error);
    throw error;
  }
}

// カテゴリ別の支出を取得
export async function getCategoryExpense(
  userId: string,
  categoryId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const cacheKey = `category_expense_${userId}_${categoryId}_${startDate}_${endDate}`;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const total = data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(total));
    return total;
  } catch (error) {
    console.error('Error fetching category expense, trying cache:', error);
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Cache read error:', cacheError);
    }
    return 0;
  }
}

// 予算の残りを計算
function calculateRemaining(
  budget: number,
  spent: number
): { remaining: number; percentage: number; isOver: boolean } {
  const remaining = budget - spent;
  const percentage = spent > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;

  return { remaining, percentage, isOver };
}

// 予算の進捗状況を取得
export async function getBudgetProgress(
  userId: string,
  year: number,
  month: number
): Promise<{ totalBudget: number; categoryProgress: any[] }> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  // 予算設定を取得
  const budgets = await getCategoryBudgets(userId);

  // カテゴリ別の支出を取得
  const categoryProgress: any[] = [];
  for (const budget of budgets) {
    const category = defaultCategories.find(c => c.id === budget.category_id);
    const spent = await getCategoryExpense(userId, budget.category_id, startDate, endDate);
    const progress = calculateRemaining(budget.amount, spent);

    categoryProgress.push({
      category_id: budget.category_id,
      category_name: category?.name || '',
      category_color: category?.color || '',
      budget: budget.amount,
      spent,
      remaining: progress.remaining,
      percentage: progress.percentage,
      isOver: progress.isOver,
    });
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  return { totalBudget, categoryProgress };
}

// 予算の期間を計算
function getPeriodStartDate(periodType: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  switch (periodType) {
    case 'monthly':
      return `${year}-${String(month).padStart(2, '0')}-01`;
    case 'quarterly':
      const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
      return `${year}-${String(quarterStartMonth).padStart(2, '0')}-01`;
    case 'yearly':
      return `${year}-01-01`;
    default:
      return `${year}-${String(month).padStart(2, '0')}-01`;
  }
}

function getPeriodEndDate(periodType: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  switch (periodType) {
    case 'monthly':
      return `${year}-${String(month).padStart(2, '0')}-31`;
    case 'quarterly':
      const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
      const quarterEndMonth = quarterStartMonth + 2;
      return `${year}-${String(quarterEndMonth).padStart(2, '0')}-${new Date(year, quarterEndMonth, 0).getDate()}`;
    case 'yearly':
      return `${year}-12-31`;
    default:
      return `${year}-${String(month).padStart(2, '0')}-31`;
  }
}

// 月次予算を取得
export async function getMonthlyBudget(userId: string): Promise<number> {
  const cacheKey = `monthly_budget_${userId}`;
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('monthly_budget')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const budget = data?.monthly_budget || 0;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(budget));
    return budget;
  } catch (error) {
    console.error('Error fetching monthly budget, trying cache:', error);
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Cache read error:', cacheError);
    }
    return 0;
  }
}
