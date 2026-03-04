import { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../lib/constants/colors';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { signUp } from '../../lib/supabase/auth';
import { useAuthStore } from '../../lib/store/authStore';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useAuthStore((state) => state.setUser);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await signUp(email, password);

    setLoading(false);

    if (authError) {
      setError('アカウント作成に失敗しました。このメールアドレスは既に使用されている可能性があります。');
    } else {
      // 認証ストアを更新
      setUser(email); // 暫定実装：実際はuser.idを設定
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24, textAlign: 'center' }}>
            アカウント作成
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
            パスワード（6文字以上）
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
              marginBottom: 16,
            }}
            placeholderTextColor={colors.inkLight}
            placeholder="•••••••••"
          />

          <Text style={{ fontSize: 14, color: colors.inkSoft, marginBottom: 8 }}>
            パスワード（確認）
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            title={loading ? '作成中...' : 'アカウントを作成'}
            onPress={handleRegister}
            disabled={loading}
            style={{ marginBottom: 16 }}
          />
        </Card>

        <TouchableOpacity onPress={handleBack} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: colors.accent }}>
            ログインに戻る
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
