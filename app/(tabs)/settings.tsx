import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { colors } from '../../lib/constants/colors';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '../../lib/supabase/auth';
import { setUser, logout as logoutStore } from '../../lib/store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              setUser(null);
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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
        <TouchableOpacity
          onPress={() => router.push('/settings/budget')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <Text style={{ fontSize: 15, color: colors.inkSoft }}>CSV取込元</Text>
          <Text style={{ fontSize: 16, color: colors.inkLight }}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/settings/budget')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <Text style={{ fontSize: 15, color: colors.inkSoft }}>カテゴリ管理</Text>
          <Text style={{ fontSize: 16, color: colors.inkLight }}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
          onPress={() => {}}
        >
          <Text style={{ fontSize: 15, color: colors.inkSoft }}>データエクスポート</Text>
          <Text style={{ fontSize: 16, color: colors.inkLight }}>›</Text>
        </TouchableOpacity>

        {/* ログアウト */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontSize: 15, color: colors.inkSoft }}>ログアウト</Text>
          <Text style={{ fontSize: 16, color: colors.inkLight }}>›</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
}
