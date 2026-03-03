import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../lib/store/authStore';
import { useBudgetStore } from '../../lib/store/budgetStore';
import { useAIStore } from '../../lib/store/aiStore';
import { getRecentTransactions, getMonthlySummary } from '../../features/transactions/services/transactionService';
import { getCategoryBudgets, getBudgetProgress, getMonthlyBudget } from '../../features/budget/services/budgetService';
import { getOrGenerateAIComment, getCurrentMonthPeriod } from '../../features/ai/services/aiService';
import { router } from 'expo-router';
import { VictoryPie } from 'victory-native';
import type { Transaction } from '../../lib/types/common';

const screenWidth = Dimensions.get('window').width;

interface PieChartData {
  x: string;
  y: number;
  fill: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState<any[]>([]);
  const [categorySummary, setCategorySummary] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);

  const userId = useAuthStore((state) => state.user);
  const monthlyBudget = useBudgetStore((state) => state.monthlyBudget);
  const aiComment = useAIStore((state) => state.currentComment);
  const aiLoading = useAIStore((state) => state.loading);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // 月次サマリーを取得
      const summary = await getMonthlySummary(userId, year, month);
      setMonthlyExpense(summary.totalExpense);
      setMonthlyIncome(summary.totalIncome);

      // カテゴリ別予算・進捗を取得
      const { categoryBudgets, categoryProgress } = await getBudgetProgress(userId, year, month);
      setCategoryBudgets(categoryBudgets);
      setCategorySummary(categoryProgress);

      // ドーナツチャート用データを作成
      const pieData: PieChartData[] = categoryProgress.map(item => ({
        x: item.category_name,
        y: item.spent,
        fill: item.category_color,
      }));
      setPieChartData(pieData);

      // 直近の取引を取得
      const recent = await getRecentTransactions(userId, 5);
      setTransactions(recent);

      // AIコメントを取得
      const period = getCurrentMonthPeriod();
      try {
        const comment = await getOrGenerateAIComment(userId, period, 'normal');
        useAIStore.getState().setCurrentComment(comment);
      } catch (error) {
        console.error('Error loading AI comment:', error);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const remainingBudget = monthlyBudget - monthlyExpense;
  const totalProgressPercent = Math.min((monthlyExpense / monthlyBudget) * 100, 100);

  const handleBudgetSettings = () => {
    router.push('/settings/budget');
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
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* 今月のサマリー */}
        <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
          今月の予算
        </Text>

        {/* 残り予算カード */}
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 8 }}>
            残り予算
          </Text>
          <Text style={{ fontSize: 48, fontWeight: '300', color: colors.ink }}>
            ¥{remainingBudget.toLocaleString()}
          </Text>
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, color: colors.inkMuted }}>
                目標
              </Text>
              <Text style={{ fontSize: 14, color: colors.inkSoft }}>
                ¥{monthlyBudget.toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: colors.inkMuted }}>
                支出
              </Text>
              <Text style={{ fontSize: 14, color: monthlyExpense > monthlyBudget ? colors.rose : colors.inkSoft }}>
                ¥{monthlyExpense.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* プログレスバー（カテゴリ別） */}
          {categorySummary.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 8 }}>
                カテゴリ別予算の進捗
              </Text>
              {categorySummary.slice(0, 3).map((item) => {
                const progressPercent = Math.min((item.percentage || 0), 100);
                const isOver = item.isOver || false;
                return (
                  <View key={item.category_name} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: item.category_color,
                          }}
                        />
                        <Text style={{ fontSize: 14, color: colors.inkSoft }}>{item.category_name}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: colors.inkMuted }}>
                        {item.spent.toLocaleString()} / {item.budget.toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ height: 4, backgroundColor: colors.bgWarm, borderRadius: 2 }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          backgroundColor: isOver ? colors.rose : colors.sage,
                          borderRadius: 2,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
              {/* 詳細表示 */}
              {totalProgressPercent > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ fontSize: 13, color: colors.inkMuted }}>
                    合計進捗
                  </Text>
                  <TouchableOpacity
                    onPress={handleBudgetSettings}
                    style={{
                      backgroundColor: colors.bgWarm,
                      borderRadius: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.accent }}>設定</Text>
                  </TouchableOpacity>
                </View>
              )}
              {totalProgressPercent > 0 && (
                <View style={{ height: 4, backgroundColor: colors.bgWarm, borderRadius: 2, marginTop: 8 }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${totalProgressPercent}%`,
                      backgroundColor: totalProgressPercent > 90 ? colors.rose : colors.sage,
                      borderRadius: 2,
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {/* AIコメントカード */}
          {aiComment && (
            <Card variant="alt" style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 12 }}>
                AIからのアドバイス
              </Text>
              <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 12 }}>
                <Text style={{ fontSize: 16, lineHeight: 24, color: colors.ink }}>
                  {aiComment.summary}
                </Text>
              </View>
            </Card>
          )}
        </Card>

        {/* カテゴリ別ドーナツチャート */}
        {pieChartData.length > 0 && (
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 16 }}>
              支出の内訳
            </Text>
            <View style={{ alignItems: 'center' }}>
              <VictoryPie
                data={pieChartData}
                width={screenWidth - 88}
                height={screenWidth - 88}
                innerRadius={screenWidth / 4}
                colorScale={pieChartData.map(d => d.fill)}
                style={{
                  labels: { fontSize: 10, fill: colors.inkMuted },
                }}
                labelRadius={({ innerRadius }) => innerRadius + 20}
              />
            </View>
          </Card>
        )}

        {/* 支出内訳（カテゴリ別） */}
        {categorySummary.length > 0 && (
          <Card style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink }}>
                支出内訳（カテゴリ別）
              </Text>
              <TouchableOpacity
                onPress={handleBudgetSettings}
                style={{ backgroundColor: colors.bgWarm, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 13, color: colors.accent }}>管理</Text>
              </TouchableOpacity>
            </View>
            {categorySummary.map((item) => (
              <View
                key={item.category_name}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: item.category_color,
                    }}
                  />
                  <Text style={{ fontSize: 15, color: colors.inkSoft }}>{item.category_name}</Text>
                </View>
                <Text style={{ fontSize: 15, color: colors.ink, fontWeight: '300' }}>
                  ¥{item.spent.toLocaleString()}
                </Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: item.isOver ? colors.rose : (item.spent >= item.budget ? colors.rose : colors.sage) }}>
                    {item.spent >= item.budget ? '予算オーバー' : `${Math.round((item.spent / item.budget) * 100)}%`}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* 直近の取引 */}
        <Card>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 16 }}>
            直近の取引
          </Text>
          {transactions.length === 0 ? (
            <Text style={{ fontSize: 14, color: colors.inkMuted, textAlign: 'center', paddingVertical: 20 }}>
              取引はありません
            </Text>
          ) : (
            transactions.map((t) => (
              <View
                key={t.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <View>
                  <Text style={{ fontSize: 14, color: colors.inkMuted }}>
                    {formatDate(t.date)}
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.inkSoft }}>
                    {t.store_name || '不明'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 16, color: colors.ink, fontWeight: '300' }}>
                    ¥{t.amount.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: t.category_color || colors.inkLight,
                      marginTop: 4,
                    }}
                  >
                    {t.category_name || 'その他'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return '今日';
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return '昨日';
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
