import { supabase } from './client';
import type { AuthResponse, User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
