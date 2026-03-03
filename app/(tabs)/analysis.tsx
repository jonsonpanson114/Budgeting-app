import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../lib/store/authStore';
import { useAIStore } from '../../lib/store/aiStore';
import {
  getOrGenerateAIComment,
  getCurrentMonthPeriod,
  getCurrentWeekPeriod,
  type AIComment,
} from '../../features/ai/services/aiService';
import { getMonthlySummary } from '../../features/transactions/services/transactionService';
import { defaultCategories } from '../../lib/constants/categories';

export default function AnalysisScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [prevMonthlyExpense, setPrevMonthlyExpense] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);

  const userId = useAuthStore((state) => state.user);
  const aiComment = useAIStore((state) => state.currentComment);
  const aiLoading = useAIStore((state) => state.loading);
  const tone = useAIStore((state) => state.tone);
  const setCurrentComment = useAIStore((state) => state.setCurrentComment);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // 今月のサマリーを取得
      const summary = await getMonthlySummary(userId, year, month);
      setMonthlyExpense(summary.totalExpense);

      // 前月のサマリーを取得
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevSummary = await getMonthlySummary(userId, prevYear, prevMonth);
      setPrevMonthlyExpense(prevSummary.totalExpense);

      // カテゴリ別集計
      const categoryTotals: any[] = [];
      const categoryMap = new Map<string, number>();

      summary.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const current = categoryMap.get(t.category_id) || 0;
          categoryMap.set(t.category_id, current + t.amount);
        });

      categoryMap.forEach((amount, categoryId) => {
        const category = defaultCategories.find(c => c.id === categoryId);
        if (category) {
          categoryTotals.push({
            id: categoryId,
            name: category.name,
            color: category.color,
            amount,
          });
        }
      });

      // 金額順にソート
      categoryTotals.sort((a, b) => b.amount - a.amount);
      setCategoryBreakdown(categoryTotals);

      // AIコメントを取得
      const periodStr = period === 'month' ? getCurrentMonthPeriod() : getCurrentWeekPeriod();
      const comment = await getOrGenerateAIComment(userId, periodStr, tone);
      setCurrentComment(comment);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, period, tone]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 変化率を計算
  const expenseChange = prevMonthlyExpense > 0
    ? ((monthlyExpense - prevMonthlyExpense) / prevMonthlyExpense) * 100
    : 0;
  const isExpenseIncrease = expenseChange > 0;

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
        {/* 期間切替 */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.bgWarm, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {[
            { label: '今月', value: 'month' },
            { label: '今週', value: 'week' },
          ].map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPeriod(p.value as 'week' | 'month')}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: period === p.value ? colors.card : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: period === p.value ? colors.ink : colors.inkMuted,
                  fontWeight: period === p.value ? '600' : '400',
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {/* 支出サマリー */}
            <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
              支出の概要
            </Text>

            <Card style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 8 }}>
                    今月の支出
                  </Text>
                  <Text style={{ fontSize: 32, fontWeight: '300', color: colors.ink }}>
                    ¥{monthlyExpense.toLocaleString()}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 8 }}>
                    前月比
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: '300',
                      color: isExpenseIncrease ? colors.rose : colors.sage,
                    }}
                  >
                    {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </Card>

            {/* AIコメントカード */}
            {aiComment && (
              <>
                <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
                  AIからの気づき
                </Text>

                {/* サマリー */}
                <Card variant="alt" style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 8 }}>
                    サマリー
                  </Text>
                  <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 12 }}>
                    <Text style={{ fontSize: 16, lineHeight: 24, color: colors.ink }}>
                      {aiComment.summary}
                    </Text>
                  </View>
                </Card>

                {/* 気づき */}
                {aiComment.insights && aiComment.insights.length > 0 && (
                  <Card style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 16 }}>
                      気づき
                    </Text>
                    {aiComment.insights.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          marginBottom: index < aiComment.insights.length - 1 ? 16 : 0,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.sageSoft,
                          paddingLeft: 12,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: colors.accent, marginBottom: 4 }}>
                          {item.label}
                        </Text>
                        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.inkSoft }}>
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* 良かった点 */}
                {aiComment.praise && aiComment.praise.length > 0 && (
                  <Card style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 16 }}>
                      良かった点
                    </Text>
                    {aiComment.praise.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          marginBottom: index < aiComment.praise.length - 1 ? 16 : 0,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.accentSoft,
                          paddingLeft: 12,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: colors.sage, marginBottom: 4 }}>
                          {item.label}
                        </Text>
                        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.inkSoft }}>
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* 提案 */}
                {aiComment.suggestions && aiComment.suggestions.length > 0 && (
                  <Card style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 16 }}>
                      トライしてみては？
                    </Text>
                    {aiComment.suggestions.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          marginBottom: index < aiComment.suggestions.length - 1 ? 16 : 0,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.navySoft,
                          paddingLeft: 12,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: colors.navy, marginBottom: 4 }}>
                          {item.label}
                        </Text>
                        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.inkSoft }}>
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}
              </>
            )}

            {/* カテゴリ別内訳 */}
            {categoryBreakdown.length > 0 && (
              <>
                <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
                  カテゴリ別内訳
                </Text>

                <Card style={{ marginBottom: 24 }}>
                  {categoryBreakdown.map((item, index) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 16,
                        borderBottomWidth: index < categoryBreakdown.length - 1 ? 1 : 0,
                        borderBottomColor: colors.borderLight,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: item.color,
                          }}
                        />
                        <Text style={{ fontSize: 15, color: colors.inkSoft }}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, color: colors.ink, fontWeight: '300' }}>
                        ¥{item.amount.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.inkMuted }}>
                        {((item.amount / monthlyExpense) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
