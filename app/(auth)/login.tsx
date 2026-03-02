import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { signIn } from '../../lib/supabase/auth';
import { useAuthStore } from '../../lib/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await signIn(email, password);

    setLoading(false);

    if (authError) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } else {
      // 認証ストアを更新
      setUser(email); // 暫定実装：実際はuser.idを設定
      router.replace('/(tabs)');
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24, textAlign: 'center' }}>
            ログイン
          </Text>

          <Text style={{ fontSize: 14, color: colors.inkSoft, marginBottom: 8 }}>
            メールアドレス
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: colors.bgWarm,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: colors.ink,
              marginBottom: 16,
            }}
            placeholderTextColor={colors.inkLight}
            placeholder="example@email.com"
          />

          <Text style={{ fontSize: 14, color: colors.inkSoft, marginBottom: 8 }}>
            パスワード
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              backgroundColor: colors.bgWarm,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: colors.ink,
              marginBottom: 8,
            }}
            placeholderTextColor={colors.inkLight}
            placeholder="•••••••••"
          />

          {error && (
            <Text style={{ fontSize: 13, color: colors.rose, marginBottom: 16 }}>
              {error}
            </Text>
          )}

          <Button
            title={loading ? 'ログイン中...' : 'ログイン'}
            onPress={handleLogin}
            disabled={loading}
            style={{ marginBottom: 16 }}
          />
        </Card>

        <TouchableOpacity onPress={handleRegister} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: colors.accent }}>
            アカウントを作成
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
