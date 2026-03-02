import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { defaultCategories } from '../../lib/constants/categories';

export default function InputScreen() {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [memo, setMemo] = useState('');

  const handleRecord = () => {
    // TODO: 取引を保存
    console.log('Record:', { amount, selectedCategory, storeName, memo });
  };

  return (
    <Screen scrollable>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
        支出を記録
      </Text>

      {/* モード選択（Segmented Control - 仮実装） */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.bgWarm, borderRadius: 12, padding: 4, marginBottom: 32 }}>
        {['手動入力', 'レシート', 'CSV'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderRadius: 8,
              backgroundColor: mode === '手動入力' ? colors.card : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: mode === '手動入力' ? colors.ink : colors.inkMuted,
                fontWeight: mode === '手動入力' ? '600' : '400',
              }}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          style={{
            fontSize: 16,
            color: colors.ink,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        />
      </Card>

      {/* 記録ボタン */}
      <TouchableOpacity
        onPress={handleRecord}
        style={{
          backgroundColor: colors.accent,
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: 'center',
          minHeight: 56,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.card }}>
          記録する
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
