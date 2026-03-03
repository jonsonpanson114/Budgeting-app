import { useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { defaultCategories } from '../../lib/constants/categories';
import { useAuthStore } from '../../lib/store/authStore';
import { createTransaction } from '../../features/transactions/services/transactionService';
import { classifyCategory, saveStoreMapping } from '../../features/transactions/services/categoryClassifier';
import { getVoiceInputService, resetVoiceInputService, type VoiceInputResult } from '../../features/input/services/voiceInputService';
import { processVoiceInput, type ParsedInput } from '../../features/input/services/inputParser';

export default function InputScreen() {
  const [inputMode, setInputMode] = useState<'manual' | 'receipt' | 'csv' | 'voice'>('manual');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberStore, setRememberStore] = useState(false);

  // 音声入力の状態
  const [isListening, setIsListening] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{ text: string; parsed: ParsedInput; confidence: number } | null>(null);

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

  // 音声入力を開始
  const handleVoiceInput = async () => {
    const voiceService = getVoiceInputService();

    // 音声認識結果のコールバックを設定
    voiceService.setOnResult((result: VoiceInputResult) => {
      if (result.isFinal) {
        setIsListening(false);
        if (result.error) {
          Alert.alert('音声認識エラー', result.error);
          return;
        }

        // 音声結果をパース
        const processed = processVoiceInput(result.text);

        setVoiceResult({
          text: result.text,
          parsed: processed.parsed,
          confidence: processed.confidence,
        });

        if (processed.parsed.amount) {
          setAmount(processed.parsed.amount.toString());
        }
        if (processed.parsed.storeName) {
          setStoreName(processed.parsed.storeName);
        }
        if (processed.parsed.items && processed.parsed.items.length > 0) {
          setMemo(processed.parsed.items.join('・'));
        }

        // パース結果をモーダルで表示
        setVoiceModalVisible(true);
      } else if (result.text) {
        // 入力中のテキストを更新
        if (voiceResult) {
          setVoiceResult({
            text: result.text,
            parsed: voiceResult.parsed,
            confidence: voiceResult.confidence,
          });
        }
      }
    });

    try {
      setIsListening(true);
      setVoiceResult(null);
      await voiceService.startListening();
    } catch (error) {
      console.error('Voice input error:', error);
      setIsListening(false);
      Alert.alert('エラー', '音声入力を開始できませんでした');
    }
  };

  // 音声入力を停止
  const handleStopListening = () => {
    const voiceService = getVoiceInputService();
    voiceService.stopListening();
    setIsListening(false);
  };

  // 音声モーダルを適用
  const handleApplyVoiceResult = () => {
    if (voiceResult?.parsed) {
      if (voiceResult.parsed.amount && !amount) {
        setAmount(voiceResult.parsed.amount.toString());
      }
      if (voiceResult.parsed.storeName && !storeName) {
        setStoreName(voiceResult.parsed.storeName);
      }
      if (voiceResult.parsed.items && voiceResult.parsed.items.length > 0 && !memo) {
        setMemo(voiceResult.parsed.items.join('・'));
      }
    }
    setVoiceModalVisible(false);
  };

  const switchMode = (mode: 'manual' | 'receipt' | 'csv' | 'voice') => {
    setInputMode(mode);
    if (mode === 'csv') {
      router.push('/input/csv-import');
    } else if (mode === 'receipt') {
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
        {['手動入力', '音声', 'レシート', 'CSV'].map((mode) => (
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

      {/* 手動入力モードまたは音声入力モード */}
      {(inputMode === 'manual' || inputMode === 'voice') && (
        <>
          {/* 音声入力モードの時はマイクボタンを表示 */}
          {inputMode === 'voice' && (
            <TouchableOpacity
              onPress={isListening ? handleStopListening : handleVoiceInput}
              disabled={loading}
              style={{
                backgroundColor: isListening ? colors.rose : colors.accent,
                borderRadius: 50,
                width: 100,
                height: 100,
                alignSelf: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 32, color: colors.card }}>
                {isListening ? '🛑' : '🎙'}
              </Text>
            </TouchableOpacity>
          )}

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
            disabled={loading || (inputMode === 'voice' && isListening)}
            style={{
              backgroundColor: (loading || (inputMode === 'voice' && isListening)) ? colors.inkLight : colors.accent,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              minHeight: 56,
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.card }}>
                処理中...
              </Text>
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.card }}>
                記録する
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* 音声結果モーダル */}
      <Modal
        visible={voiceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Card style={{ maxWidth: 320 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 16 }}>
              音声入力結果
            </Text>

            {/* 信頼度表示 */}
            {voiceResult && voiceResult.confidence > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: colors.inkMuted, marginRight: 8 }}>
                  信頼度:
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: voiceResult.confidence > 0.7 ? colors.sage : (voiceResult.confidence > 0.5 ? colors.accent : colors.inkMuted),
                    fontWeight: '600',
                  }}
                >
                  {voiceResult.confidence > 0.7 ? '高い' : voiceResult.confidence > 0.5 ? '中' : '低い'}
                </Text>
              </View>
            )}

            {/* 音声テキスト */}
            {voiceResult && (
              <View style={{ backgroundColor: colors.bgWarm, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 4 }}>
                  音声テキスト
                </Text>
                <Text style={{ fontSize: 15, color: colors.ink }}>
                  {voiceResult.text}
                </Text>
              </View>
            )}

            {/* パース結果 */}
            {voiceResult?.parsed && (voiceResult.parsed.storeName || voiceResult.parsed.amount || voiceResult.parsed.items) && (
              <View style={{ backgroundColor: colors.bgWarm, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: colors.inkMuted, marginBottom: 8 }}>
                  解析結果
                </Text>
                <View style={{ gap: 12 }}>
                  {voiceResult.parsed.storeName && (
                    <View>
                      <Text style={{ fontSize: 12, color: colors.inkMuted }}>店名:</Text>
                      <Text style={{ fontSize: 15, color: colors.accent }}>
                        {voiceResult.parsed.storeName}
                      </Text>
                    </View>
                  )}
                  {voiceResult.parsed.amount && (
                    <View>
                      <Text style={{ fontSize: 12, color: colors.inkMuted }}>金額:</Text>
                      <Text style={{ fontSize: 15, color: colors.accent }}>
                        ¥{voiceResult.parsed.amount.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {voiceResult.parsed.items && voiceResult.parsed.items.length > 0 && (
                    <View>
                      <Text style={{ fontSize: 12, color: colors.inkMuted }}>商品:</Text>
                      <Text style={{ fontSize: 15, color: colors.ink }}>
                        {voiceResult.parsed.items.join('・')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ボタン */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setVoiceModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.bgWarm,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.inkSoft }}>
                  キャンセル
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyVoiceResult}
                style={{
                  flex: 1,
                  backgroundColor: colors.accent,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.card }}>
                  適用
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
