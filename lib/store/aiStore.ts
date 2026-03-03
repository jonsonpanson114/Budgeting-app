import { create } from 'zustand';
import type { AIComment, AITone } from '../types/common';

interface AIState {
  // 現在のAIコメント
  currentComment: AIComment | null;
  // ローディング状態
  loading: boolean;
  // エラー状態
  error: string | null;
  // トーン設定
  tone: AITone;

  // アクション
  setCurrentComment: (comment: AIComment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTone: (tone: AITone) => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  currentComment: null,
  loading: false,
  error: null,
  tone: 'normal',

  setCurrentComment: (comment) => set({ currentComment: comment }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTone: (tone) => set({ tone }),
  clearError: () => set({ error: null }),
}));
