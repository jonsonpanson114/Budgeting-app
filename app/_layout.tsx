import '../global.css';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
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
          setUser('dummy-user');
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser('dummy-user');
        router.replace('/(tabs)');
      }
    };

    // ちょっと待機させてルーターの準備を待つ
    setTimeout(checkAuth, 100);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <>
        <Head>
          <title>Budget App</title>
          <meta name="description" content="Premium Budgeting Application" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="icon" href="/favicon.png" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <StatusBar style="dark" backgroundColor={colors.bg} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </>
    </ErrorBoundary>
  );
}
