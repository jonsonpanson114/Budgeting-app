import { supabase } from '../../../lib/supabase/client';
import { findStoreCategory, normalizeStoreName } from '../../../lib/constants/storeDict';
import type { Transaction } from '../../../lib/types/common';

export interface CategoryClassification {
  category_id: string;
  category_name: string;
  confidence: number;
  source: 'builtin' | 'user_dict' | 'ai' | 'manual';
}

// ① ユーザー学習辞書を検索（最優先）
async function searchUserDictionary(userId: string, storeName: string): Promise<CategoryClassification | null> {
  const normalized = normalizeStoreName(storeName);

  const { data } = await supabase
    .from('store_category_mappings')
    .select(`
      category_id,
      categories (
        name,
        color
      )
    `)
    .eq('user_id', userId)
    .ilike('store_pattern', `%${normalized}%`)
    .limit(1);

  if (!data || data.length === 0) {
    return null;
  }

  return {
    category_id: data[0].category_id,
    category_name: data[0].categories.name,
    confidence: 1.0,
    source: 'user_dict',
  };
}

// ② ビルトイン辞書を検索
function searchBuiltinDictionary(storeName: string): CategoryClassification | null {
  const result = findStoreCategory(storeName);
  if (!result) {
    return null;
  }

  return {
    category_id: result.category,
    category_name: result.category,
    confidence: result.confidence,
    source: 'builtin',
  };
}

// ③ Claude API で推定（フォールバック）
async function classifyWithAI(
  storeName: string,
  amount: number
): Promise<CategoryClassification> {
  try {
    // TODO: Edge Functionを呼び出す
    // 現在は暫定実装
    return {
      category_id: 'cat_other',
      category_name: 'その他',
      confidence: 0.3,
      source: 'ai',
    };
  } catch (error) {
    console.error('AI classification failed:', error);
    return {
      category_id: 'cat_other',
      category_name: 'その他',
      confidence: 0.0,
      source: 'ai',
    };
  }
}

// 店名からカテゴリを自動推定（3段階）
export async function classifyCategory(
  userId: string,
  storeName: string,
  amount: number = 0
): Promise<CategoryClassification> {
  if (!storeName) {
    return {
      category_id: 'cat_other',
      category_name: 'その他',
      confidence: 0.0,
      source: 'manual',
    };
  }

  // ① ユーザー学習辞書
  const userDictResult = await searchUserDictionary(userId, storeName);
  if (userDictResult) {
    return userDictResult;
  }

  // ② ビルトイン辞書
  const builtinResult = searchBuiltinDictionary(storeName);
  if (builtinResult) {
    return builtinResult;
  }

  // ③ AIフォールバック
  return await classifyWithAI(storeName, amount);
}

// ユーザーがカテゴリを修正したら学習辞書に保存
export async function saveStoreMapping(
  userId: string,
  storePattern: string,
  categoryId: string
): Promise<void> {
  const normalized = normalizeStoreName(storePattern);

  const { error } = await supabase
    .from('store_category_mappings')
    .upsert({
      user_id: userId,
      store_pattern: normalized,
      category_id: categoryId,
    }, {
      onConflict: 'user_id,store_pattern',
    });

  if (error) {
    console.error('Error saving store mapping:', error);
    throw error;
  }
}

// バッチ分類（CSV取込時）
export async function batchClassify(
  userId: string,
  items: { store_name: string; amount: number }[]
): Promise<CategoryClassification[]> {
  const results: CategoryClassification[] = [];

  for (const item of items) {
    if (!item.store_name) {
      results.push({
        category_id: 'cat_other',
        category_name: 'その他',
        confidence: 0.0,
        source: 'manual',
      });
      continue;
    }

    const classification = await classifyCategory(userId, item.store_name, item.amount);
    results.push(classification);
  }

  return results;
}
