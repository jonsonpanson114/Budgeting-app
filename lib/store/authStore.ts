import { create } from 'zustand';

interface AuthState {
  user: string | null;
  isAuthenticated: boolean;
  setUser: (userId: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (userId) => set({ user: userId, isAuthenticated: !!userId }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
