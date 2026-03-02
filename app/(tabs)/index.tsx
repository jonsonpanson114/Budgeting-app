import { View, Text, ScrollView } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';

export default function HomeScreen() {
  return (
    <Screen scrollable>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
        今月の予算
      </Text>

      {/* 残り予算カード */}
      <Card style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 8 }}>
          残り予算
        </Text>
        <Text style={{ fontSize: 48, fontWeight: '300', color: colors.ink }}>
          ¥52,800
        </Text>
        <Text style={{ fontSize: 14, color: colors.sage, marginTop: 8 }}>
          目標: ¥80,000 / 支出: ¥27,200
        </Text>
      </Card>

      {/* AIコメントカード */}
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
      <Card style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 16 }}>
          支出内訳
        </Text>
        {/* カテゴリリストは仮 */}
        {[
          { name: '食費', amount: 12000, color: colors.catFood },
          { name: '交通費', amount: 4800, color: colors.catTransport },
          { name: '日用品', amount: 5400, color: colors.catDaily },
          { name: '娯楽', amount: 5000, color: colors.catEntertain },
        ].map((item) => (
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

      {/* 直近の取引 */}
      <Card>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 16 }}>
          直近の取引
        </Text>
        {[
          { date: '今日', store: 'セブン-イレブン', amount: 680, category: '食費' },
          { date: '昨日', store: 'スターバックス', amount: 580, category: '食費' },
          { date: '2/28', store: 'ローソン', amount: 420, category: '食費' },
          { date: '2/28', store: 'JR西日本', amount: 240, category: '交通費' },
          { date: '2/27', store: 'Amazon', amount: 1580, category: '日用品' },
        ].map((item, index) => (
          <View
            key={index}
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
              <Text style={{ fontSize: 14, color: colors.inkMuted }}>{item.date}</Text>
              <Text style={{ fontSize: 15, color: colors.inkSoft }}>{item.store}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, color: colors.ink, fontWeight: '300' }}>
                ¥{item.amount}
              </Text>
              <Text style={{ fontSize: 12, color: colors.inkLight }}>{item.category}</Text>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
