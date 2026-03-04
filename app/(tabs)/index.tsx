import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { typography, fontWeights, fontSizes } from '../../lib/constants/typography';
import { spacing } from '../../lib/constants/spacing';
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
        {/* 今月のサマリーヘッダー (洗練されたスタイル) */}
        <View style={{ marginBottom: spacing.sectionGap, alignItems: 'center', marginTop: 16 }}>
          <Text style={{
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.semibold,
            letterSpacing: 2,
            color: colors.inkMuted,
            textTransform: 'uppercase',
            marginBottom: 4
          }}>
            Overview
          </Text>
          <Text style={{
            fontSize: fontSizes.xl,
            fontFamily: typography.serif,
            color: colors.ink
          }}>
            今月の予算
          </Text>
        </View>

        {/* 残り予算メインカード */}
        <Card style={{ marginBottom: spacing.sectionGap, paddingTop: 32, paddingBottom: 32 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: fontSizes.sm, color: colors.inkMuted, marginBottom: 8, letterSpacing: 1 }}>
              残り予算
            </Text>
            <Text style={{
              fontSize: fontSizes['5xl'],
              fontWeight: fontWeights.light,
              fontFamily: typography.serif,
              color: colors.ink,
              letterSpacing: -1
            }}>
              ¥{remainingBudget.toLocaleString()}
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 40,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            paddingTop: 24,
            marginTop: 8
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, marginBottom: 4 }}>目標</Text>
              <Text style={{ fontSize: fontSizes.md, color: colors.inkSoft }}>¥{monthlyBudget.toLocaleString()}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.borderLight, height: '100%' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, marginBottom: 4 }}>支出</Text>
              <Text style={{
                fontSize: fontSizes.md,
                color: monthlyExpense > monthlyBudget ? colors.rose : colors.inkSoft
              }}>
                ¥{monthlyExpense.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* プログレスバー（カテゴリ別） */}
          {categorySummary.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, marginBottom: 12, letterSpacing: 1 }}>
                CATEGORIES
              </Text>
              {categorySummary.slice(0, 3).map((item) => {
                const progressPercent = Math.min((item.percentage || 0), 100);
                const isOver = item.isOver || false;
                return (
                  <View key={item.category_name} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: item.category_color,
                          }}
                        />
                        <Text style={{ fontSize: fontSizes.sm, color: colors.inkSoft }}>{item.category_name}</Text>
                      </View>
                      <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted }}>
                        {item.spent.toLocaleString()} / {item.budget.toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ height: 2, backgroundColor: colors.borderLight, borderRadius: 1 }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          backgroundColor: isOver ? colors.rose : colors.sage,
                          borderRadius: 1,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
              {/* 詳細表示 */}
              {totalProgressPercent > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, letterSpacing: 1 }}>
                    TOTAL PROGRESS
                  </Text>
                  <TouchableOpacity onPress={handleBudgetSettings}>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.accent }}>設定を編集</Text>
                  </TouchableOpacity>
                </View>
              )}
              {totalProgressPercent > 0 && (
                <View style={{ height: 2, backgroundColor: colors.borderLight, borderRadius: 1, marginTop: 8 }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${totalProgressPercent}%`,
                      backgroundColor: totalProgressPercent > 90 ? colors.rose : colors.sage,
                      borderRadius: 1,
                    }}
                  />
                </View>
              )}
            </View>
          )}

        </Card>

        {/* AIコメントはより上品に、単独で浮かせる */}
        {aiComment && (
          <View style={{
            marginBottom: spacing.sectionGap,
            paddingHorizontal: 16,
            paddingVertical: 24,
            backgroundColor: colors.cardAlt,
            borderRadius: spacing.cardRadius,
            borderLeftWidth: 2,
            borderLeftColor: colors.accent
          }}>
            <Text style={{
              fontSize: fontSizes.xs,
              color: colors.inkMuted,
              letterSpacing: 2,
              marginBottom: 12,
              textTransform: 'uppercase'
            }}>
              Insight
            </Text>
            <Text style={{
              fontSize: fontSizes.md,
              lineHeight: 28,
              color: colors.ink,
              fontFamily: typography.serif,
              fontStyle: 'italic'
            }}>
              "{aiComment.summary}"
            </Text>
          </View>
        )}

        {/* カテゴリ別ドーナツチャート */}
        {pieChartData.length > 0 && (
          <Card style={{ marginBottom: spacing.sectionGap }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
              Breakdown
            </Text>
            <Text style={{ fontSize: fontSizes.md, color: colors.ink }}>支出の内訳</Text>
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <VictoryPie
                data={pieChartData}
                width={screenWidth - 88}
                height={screenWidth - 88}
                innerRadius={screenWidth / 3.5}
                colorScale={pieChartData.map(d => d.fill)}
                style={{
                  labels: { fontSize: fontSizes.xs, fill: colors.inkMuted, fontFamily: typography.sans },
                }}
                labelRadius={({ innerRadius }) => innerRadius! + 15}
              />
            </View>
          </Card>
        )}

        {/* 支出内訳リスト（カテゴリ別） */}
        {categorySummary.length > 0 && (
          <Card style={{ marginBottom: spacing.sectionGap }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: fontSizes.md, color: colors.ink }}>
                カテゴリ別詳細
              </Text>
              <TouchableOpacity onPress={handleBudgetSettings}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.accent }}>管理</Text>
              </TouchableOpacity>
            </View>
            {categorySummary.map((item, index) => (
              <View
                key={item.category_name}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: index === categorySummary.length - 1 ? 0 : 1,
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
                  <Text style={{ fontSize: fontSizes.sm, color: colors.inkSoft }}>{item.category_name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: fontSizes.md, color: colors.ink, fontWeight: fontWeights.light }}>
                    ¥{item.spent.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: item.isOver ? colors.rose : colors.inkMuted, marginTop: 4 }}>
                    {item.spent >= item.budget ? '予算オーバー' : `${Math.round((item.spent / item.budget) * 100)}% 利用`}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* 直近の取引 */}
        <Card style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
            Recent
          </Text>
          <Text style={{ fontSize: fontSizes.md, color: colors.ink, marginBottom: 16 }}>
            直近の取引
          </Text>
          {transactions.length === 0 ? (
            <Text style={{ fontSize: fontSizes.sm, color: colors.inkLight, textAlign: 'center', paddingVertical: 32 }}>
              取引はありません
            </Text>
          ) : (
            transactions.map((t, index) => (
              <View
                key={t.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: index === transactions.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.inkMuted, marginBottom: 4 }}>
                    {formatDate(t.date)}
                  </Text>
                  <Text style={{ fontSize: fontSizes.sm, color: colors.inkSoft }} numberOfLines={1}>
                    {t.store_name || '不明'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: fontSizes.md, color: colors.ink, fontWeight: fontWeights.light }}>
                    ¥{t.amount.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.xs,
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
