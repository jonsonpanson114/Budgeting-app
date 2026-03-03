import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { defaultCategories } from '../../lib/constants/categories';
import { useAuthStore } from '../../lib/store/authStore';
import { createTransaction } from '../../features/transactions/services/transactionService';
import { classifyCategory, saveStoreMapping } from '../../features/transactions/services/categoryClassifier';

export default function InputScreen() {
  const [inputMode, setInputMode] = useState<'manual' | 'receipt' | 'csv'>('manual');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberStore, setRememberStore] = useState(false);

  const userId = useAuthStore((state) => state.user);

  const handleRecord = async () => {
    if (!userId) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    if (!amount || !selectedCategory) {
      Alert.alert('エラー', '金額とカテゴリを入力してください');
      return;
    }

    const amountValue = parseInt(amount.replace(/,/g, ''), 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('エラー', '金額を正しく入力してください');
      return;
    }

    setLoading(true);

    try {
      // カテゴリを自動分類（店名がある場合）
      let categoryId = selectedCategory;
      let categorySource: 'manual' | 'builtin' | 'user_dict' | 'ai' = 'manual';
      let categoryConfidence = 1.0;

      if (storeName && !selectedCategory) {
        const classification = await classifyCategory(userId, storeName, amountValue);
        categoryId = classification.category_id;
        categorySource = classification.source;
        categoryConfidence = classification.confidence;
      }

      // 取引を保存
      const today = new Date().toISOString().split('T')[0];

      await createTransaction({
        user_id: userId,
        date: today,
        amount: amountValue,
        type: 'expense',
        category_id: categoryId,
        store_name: storeName || null,
        memo: memo || null,
        source: 'manual',
      });

      // 店名を記憶する
      if (rememberStore && storeName && categoryId) {
        await saveStoreMapping(userId, storeName, categoryId);
      }

      // フォームをリセット
      setAmount('');
      setSelectedCategory(null);
      setStoreName('');
      setMemo('');
      setRememberStore(false);

      Alert.alert('記録完了', '支出を記録しました');
    } catch (error) {
      console.error('Error recording transaction:', error);
      Alert.alert('エラー', '記録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: 'manual' | 'receipt' | 'csv') => {
    setInputMode(mode);
    if (mode === 'csv') {
      router.push('/input/csv-import');
    } else if (mode === 'receipt') {
      // TODO: レシート撮影へ遷移
      Alert.alert('工事中', 'レシート撮影は工事中です');
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
        支出を記録
      </Text>

      {/* モード選択（Segmented Control） */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.bgWarm, borderRadius: 12, padding: 4, marginBottom: 32 }}>
        {['手動入力', 'レシート', 'CSV'].map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => switchMode(mode)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderRadius: 8,
              backgroundColor: inputMode === mode ? colors.card : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: inputMode === mode ? colors.ink : colors.inkMuted,
                fontWeight: inputMode === mode ? '600' : '400',
              }}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 手動入力モード */}
      {inputMode === 'manual' && (
        <>
          {/* 金額入力 */}
          <Card style={{ marginBottom: 24, alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 16 }}>
              金額
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="numeric"
              editable={!loading}
              style={{
                fontSize: 48,
                fontWeight: '300',
                color: colors.ink,
                textAlign: 'center',
                minWidth: 200,
              }}
            />
            <Text style={{ fontSize: 16, color: colors.inkMuted, marginTop: 8 }}>
              円
            </Text>
          </Card>

          {/* カテゴリ選択 */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 16 }}>
              カテゴリ
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {defaultCategories.filter(c => !c.parentId).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  disabled={loading}
                  style={{
                    backgroundColor:
                      selectedCategory === category.id ? colors.accentBg : colors.bgWarm,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor:
                      selectedCategory === category.id ? colors.accentSoft : colors.borderLight,
                    minWidth: 80,
                    alignItems: 'center',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: selectedCategory === category.id ? colors.accent : colors.inkSoft,
                      fontWeight: selectedCategory === category.id ? '600' : '400',
                    }}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* カテゴリが選択されている場合のみ予算設定ボタンを表示 */}
            {selectedCategory && (
              <TouchableOpacity
                onPress={() => router.push('/settings/budget')}
                style={{
                  backgroundColor: colors.bgWarm,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, color: colors.inkSoft }}>
                  予算設定
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* 店名・メモ */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 16 }}>
              詳細
            </Text>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              placeholder="店名"
              editable={!loading}
              style={{
                fontSize: 16,
                color: colors.ink,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
                marginBottom: 16,
              }}
            />
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="メモ"
              editable={!loading}
              style={{
                fontSize: 16,
                color: colors.ink,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            />

            {/* 店名を記憶するチェックボックス */}
            {storeName && (
              <TouchableOpacity
                onPress={() => setRememberStore(!rememberStore)}
                disabled={loading}
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: rememberStore ? colors.accent : colors.border,
                    backgroundColor: rememberStore ? colors.accent : 'transparent',
                    marginRight: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {rememberStore && (
                    <Text style={{ color: colors.card, fontSize: 14 }}>✓</Text>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: colors.inkSoft }}>
                  この店名を記憶する
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* 記録ボタン */}
          <TouchableOpacity
            onPress={handleRecord}
            disabled={loading}
            style={{
              backgroundColor: loading ? colors.inkLight : colors.accent,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              minHeight: 56,
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.card }}>
                記録する
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </Screen>
  );
}
