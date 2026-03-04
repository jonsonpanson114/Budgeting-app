import { useState, useEffect } from 'react';
import { Screen } from '../../components/layout/Screen';
import { colors } from '../../lib/constants/colors';
import { Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '../../lib/store/authStore';
import { getTransactions } from '../../features/transactions/services/transactionService';
import { router } from 'expo-router';

export default function TransactionsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');

  const userId = useAuthStore((state) => state.user);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
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

  // フィルター処理
  const filteredTransactions = transactions.filter(t => {
    // カテゴリフィルター
    if (selectedCategory !== 'すべて' && t.category_name !== selectedCategory) {
      return false;
    }
    // 検索フィルター
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const storeMatch = t.store_name?.toLowerCase().includes(searchLower);
      const memoMatch = t.memo?.toLowerCase().includes(searchLower);
      if (!storeMatch && !memoMatch) {
        return false;
      }
    }
    return true;
  });

  const handleTransactionPress = (transaction: any) => {
    // TODO: 取引詳細画面へ遷移
    console.log('Transaction pressed:', transaction.id);
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
        <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 20 }}>
          明細
        </Text>

        {/* 検索バー */}
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="取引を検索..."
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 15,
            color: colors.ink,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />

        {/* カテゴリフィルター */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['すべて', '食費', '交通費', '娯楽', '日用品', 'その他'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedCategory(filter)}
              style={{
                backgroundColor: selectedCategory === filter ? colors.ink : colors.bgWarm,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: selectedCategory === filter ? colors.card : colors.inkSoft,
                  fontWeight: selectedCategory === filter ? '600' : '400',
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 取引リスト */}
        {filteredTransactions.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 14, color: colors.inkMuted }}>
              {transactions.length === 0 ? '取引はありません' : '検索結果はありません'}
            </Text>
          </View>
        ) : (
          <View>
            {filteredTransactions.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleTransactionPress(t)}
                style={{
                  backgroundColor: colors.card,
                  padding: 16,
                  marginBottom: 1,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 4 }}>
                      {formatDate(t.date)}
                    </Text>
                    <Text style={{ fontSize: 15, color: colors.inkSoft }}>
                      {t.store_name || t.memo || '不明'}
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
              </TouchableOpacity>
            ))}
          </View>
        )}
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
