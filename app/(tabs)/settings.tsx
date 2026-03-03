import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { colors } from '../../lib/constants/colors';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '../../lib/supabase/auth';
import { useAuthStore } from '../../lib/store/authStore';
import { useAIStore } from '../../lib/store/aiStore';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const tone = useAIStore((state) => state.tone);
  const setTone = useAIStore((state) => state.setTone);

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
              logout();
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

      {/* AIトーン設定 */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 12 }}>
          AIのトーン
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'やさしめ', value: 'gentle' },
            { label: 'ふつう', value: 'normal' },
            { label: 'きびしめ', value: 'strict' },
          ].map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setTone(t.value as any)}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: tone === t.value ? colors.accentBg : colors.bgWarm,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: tone === t.value ? colors.accentSoft : colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: tone === t.value ? colors.accent : colors.inkSoft,
                  fontWeight: tone === t.value ? '600' : '400',
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ fontSize: 12, color: colors.inkMuted, marginTop: 12 }}>
          AIからのアドバイスのトーンを選択できます
        </Text>
      </Card>

      {/* 予算設定 */}
      <TouchableOpacity onPress={() => router.push('/settings/budget')}>
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, color: colors.inkSoft }}>カテゴリ別予算</Text>
            <Text style={{ fontSize: 16, color: colors.inkLight }}>›</Text>
          </View>
        </Card>
      </TouchableOpacity>

      {/* その他設定 */}
      <Card>
        <TouchableOpacity
          onPress={() => {}}
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
          onPress={() => {}}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
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
          <Text style={{ fontSize: 15, color: colors.rose }}>ログアウト</Text>
          <Text style={{ fontSize: 16, color: colors.rose }}>›</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
}
