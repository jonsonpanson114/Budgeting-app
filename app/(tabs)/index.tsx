import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../lib/store/authStore';
import { getRecentTransactions, getMonthlySummary } from '../../features/transactions/services/transactionService';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(80000);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categorySummary, setCategorySummary] = useState<any[]>([]);

  const userId = useAuthStore((state) => state.user);

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

      // 直近の取引を取得
      const recent = await getRecentTransactions(userId, 5);
      setTransactions(recent);

      // カテゴリ別集計
      const categoryMap = new Map();
      summary.transactions.forEach(t => {
        if (t.type === 'expense') {
          const current = categoryMap.get(t.category_name || 'その他') || { amount: 0, color: t.category_color || colors.slate };
          categoryMap.set(t.category_name || 'その他', {
            amount: current.amount + t.amount,
            color: t.category_color || colors.slate,
          });
        }
      });

      const summaryArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        amount: data.amount,
        color: data.color,
      })).sort((a, b) => b.amount - a.amount);

      setCategorySummary(summaryArray);
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
  const progressPercent = Math.min((monthlyExpense / monthlyBudget) * 100, 100);

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

          {/* プログレスバー */}
          <View style={{ height: 4, backgroundColor: colors.bgWarm, borderRadius: 2, marginTop: 16 }}>
            <View
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: progressPercent > 90 ? colors.rose : colors.sage,
                borderRadius: 2,
              }}
            />
          </View>
        </Card>

        {/* AIコメントカード（仮） */}
        <Card variant="alt" style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 12 }}>
            AIからのアドバイス
          </Text>
          <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 12 }}>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.ink }}>
              先週はコンビニの出費が多かったみたい。外食を控えて、家で作るようにすると今月は予算内で収まりそうやで。
            </Text>
          </View>
        </Card>

        {/* 支出内訳 */}
        {categorySummary.length > 0 && (
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 16 }}>
              支出内訳
            </Text>
            {categorySummary.map((item) => (
              <View
                key={item.name}
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
                      backgroundColor: item.color,
                    }}
                  />
                  <Text style={{ fontSize: 15, color: colors.inkSoft }}>{item.name}</Text>
                </View>
                <Text style={{ fontSize: 15, color: colors.ink, fontWeight: '300' }}>
                  ¥{item.amount.toLocaleString()}
                </Text>
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
                  <Text style={{ fontSize: 12, color: t.category_color || colors.inkLight }}>
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
