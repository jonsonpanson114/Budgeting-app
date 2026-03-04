import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../lib/constants/colors';
import { useAuthStore } from '../lib/store/authStore';
import { getCurrentUser } from '../lib/supabase/auth';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../components/ui/ErrorFallback';

export default function RootLayout() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // コンポーネントがマウントされてからチェック
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUser(user.id);
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/(auth)/login');
      }
    };

    // ちょっと待機させてルーターの準備を待つ
    setTimeout(checkAuth, 100);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <>
        <StatusBar style="dark" backgroundColor={colors.bg} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </>
    </ErrorBoundary>
  );
}
