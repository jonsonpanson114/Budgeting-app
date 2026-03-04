import { supabase } from '../../../lib/supabase/client';
import type { Transaction } from '../../../lib/types/common';
import { defaultCategories } from '../../../lib/constants/categories';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'category_confirmed' | 'category_name' | 'category_color'>) {
  // カテゴリ名と色を取得
  const category = defaultCategories.find(c => c.id === transaction.category_id);

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      category_name: category?.name,
      category_color: category?.color,
      category_confirmed: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return data as Transaction;
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const cacheKey = `transactions_${userId}`;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        amount,
        type,
        category_id,
        category_name,
        category_color,
        store_name,
        memo,
        source,
        created_at
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false, nullsFirst: false });

    if (error) {
      throw error;
    }

    const txs = (data as Transaction[]) || [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(txs));
    return txs;
  } catch (error) {
    console.error('Error fetching transactions, trying cache:', error);
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

export async function getRecentTransactions(userId: string, limit: number = 5): Promise<Transaction[]> {
  const cacheKey = `recent_transactions_${userId}_${limit}`;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        amount,
        type,
        category_id,
        category_name,
        category_color,
        store_name,
        memo,
        source,
        created_at
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const txs = (data as Transaction[]) || [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(txs));
    return txs;
  } catch (error) {
    console.error('Error fetching recent transactions, trying cache:', error);
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

export async function getTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const cacheKey = `transactions_range_${userId}_${startDate}_${endDate}`;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    const txs = (data as Transaction[]) || [];
    await AsyncStorage.setItem(cacheKey, JSON.stringify(txs));
    return txs;
  } catch (error) {
    console.error('Error fetching transactions by date range, trying cache:', error);
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

export async function getMonthlySummary(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const transactions = await getTransactionsByDateRange(userId, startDate, endDate);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
  };
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }

  return data as Transaction;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}
