import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../lib/constants/colors';
import { useAuthStore } from '../lib/store/authStore';
import { getCurrentUser } from '../lib/supabase/auth';

export default function RootLayout() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (user) {
      setUser(user.id);
      // 既にログイン済みならホームへ
      router.replace('/(tabs)');
    }
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
