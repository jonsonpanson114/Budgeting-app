import { Screen } from '../../components/layout/Screen';
import { colors } from '../../lib/constants/colors';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function TransactionsScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 20 }}>
        明細
      </Text>

      {/* 検索バー */}
      <TextInput
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
            style={{
              backgroundColor: filter === 'すべて' ? colors.ink : colors.bgWarm,
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: filter === 'すべて' ? colors.card : colors.inkSoft,
                fontWeight: filter === 'すべて' ? '600' : '400',
              }}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginTop: 40 }}>
        明細はまだありません
      </Text>
    </Screen>
  );
}
