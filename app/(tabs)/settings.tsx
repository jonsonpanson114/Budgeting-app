import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { colors } from '../../lib/constants/colors';
import { Text, View, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 20 }}>
        設定
      </Text>

      {/* 予算設定 */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 12 }}>
          予算
        </Text>
        <Text style={{ fontSize: 16, color: colors.ink }}>月次予算: ¥80,000</Text>
      </Card>

      {/* AIトーン設定 */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 12 }}>
          AIのトーン
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['やさしめ', 'ふつう', 'きびしめ'].map((tone) => (
            <TouchableOpacity
              key={tone}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: tone === 'ふつう' ? colors.accentBg : colors.bgWarm,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: tone === 'ふつう' ? colors.accentSoft : colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: tone === 'ふつう' ? colors.accent : colors.inkSoft,
                  fontWeight: tone === 'ふつう' ? '600' : '400',
                }}
              >
                {tone}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* その他設定 */}
      <Card>
        {['通知設定', 'CSV取込元', 'カテゴリ管理', 'データエクスポート'].map((item) => (
          <TouchableOpacity
            key={item}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <Text style={{ fontSize: 15, color: colors.inkSoft }}>{item}</Text>
            <Text style={{ fontSize: 16, color: colors.inkLight }}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>
    </Screen>
  );
}
