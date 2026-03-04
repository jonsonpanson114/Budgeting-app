import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { defaultCategories } from '../../lib/constants/categories';
import { useBudgetStore } from '../../lib/store/budgetStore';
import {
  getCategoryBudgets,
  setCategoryBudget,
  getMonthlyBudget,
  getBudgetProgress,
} from '../../features/budget/services/budgetService';
import type { CategoryBudget } from '../../lib/types/common';

export default function BudgetScreen() {
  const [loading, setLoading] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  const monthlyBudget = useBudgetStore((state) => state.monthlyBudget);
  const setMonthlyBudget = useBudgetStore((state) => state.setMonthlyBudget);
  const updateCategoryBudget = useBudgetStore((state) => state.updateCategoryBudget);

  const loadData = async () => {
    try {
      setLoading(true);

      // 予算を取得
      const budgets = await getCategoryBudgets('user-id-placeholder');
      setCategoryBudgets(budgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('エラー', '予算の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSetMonthlyBudget = () => {
    const amount = parseInt(editAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('エラー', '正しい金額を入力してください');
      return;
    }

    setMonthlyBudget(amount);
    setEditAmount('');
    Alert.alert('設定完了', '月次予算を設定しました');
  };

  const handleSetCategoryBudget = async (categoryId: string) => {
    const amount = parseInt(editAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0 || !categoryId) {
      return;
    }

    try {
      await setCategoryBudget('user-id-placeholder', categoryId, amount, 'monthly');
      await loadData();
      Alert.alert('設定完了', 'カテゴリ別予算を設定しました');
      setEditAmount('');
    } catch (error) {
      console.error('Error setting category budget:', error);
      Alert.alert('エラー', '予算の設定に失敗しました');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    Alert.alert(
      '予算を削除',
      'この予算を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 実際に削除機能
              Alert.alert('工事中', '削除機能は工事中です');
            } catch (error) {
              console.error('Error deleting budget:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
        カテゴリ別予算
      </Text>

      {/* 月次予算設定 */}
      <Card style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 12 }}>
          月次予算
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 15, color: colors.inkSoft }}>
            現在: ¥{monthlyBudget.toLocaleString()}
          </Text>
          <TouchableOpacity
            onPress={() => { }}
            style={{ backgroundColor: colors.bgWarm, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 14, color: colors.accent }}>変更</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* カテゴリ別予算リスト */}
      <Card style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 16 }}>
          カテゴリ別予算を設定
        </Text>
        {defaultCategories.filter(c => !c.parentId).map((category) => {
          const budget = categoryBudgets.find(b => b.category_id === category.id);
          return (
            <View key={category.id} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: category.color,
                    }}
                  />
                  <Text style={{ fontSize: 15, color: colors.inkSoft }}>{category.name}</Text>
                </View>
                {budget ? (
                  <Text style={{ fontSize: 15, color: colors.ink }}>
                    ¥{budget.amount.toLocaleString()}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(category.id)}
                    style={{
                      backgroundColor: colors.bgWarm,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.accent }}>設定</Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedCategory === category.id && (
                <View style={{ marginTop: 8, gap: 8 }}>
                  <TextInput
                    value={editAmount}
                    onChangeText={setEditAmount}
                    placeholder="金額"
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: colors.bgWarm,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 15,
                      color: colors.ink,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleSetCategoryBudget(category.id)}
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      minWidth: 60,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.card }}>
                      保存
                    </Text>
                  </TouchableOpacity>
                  {budget && (
                    <TouchableOpacity
                      onPress={() => handleDeleteBudget(budget.id)}
                      style={{
                        backgroundColor: colors.bgWarm,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: colors.rose }}>削除</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </Card>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ alignSelf: 'center', marginTop: 16 }}
      >
        <Text style={{ fontSize: 15, color: colors.accent }}>
          戻る
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
