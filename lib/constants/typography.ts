export const typography = {
  // セリフ体: タイトル、AIコメントの引用部分
  serif: "'Georgia', 'Hiragino Mincho ProN', 'Noto Serif JP', serif",

  // サンセリフ体: UI全般、本文、ラベル
  sans: "'Hiragino Sans', 'Noto Sans JP', -apple-system, sans-serif",

  // フォントウェイト使い分け
  // 300: 金額の大きな数字 (軽やかさを演出)
  // 400: 本文
  // 500: セカンダリラベル
  // 600: プライマリラベル、ボタン
  // 700: 未使用 (品のある見出しは600まで)
} as const;

export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
} as const;

export const fontSizes = {
  xs: 12 as const,
  sm: 14 as const,
  md: 16 as const,
  lg: 18 as const,
  xl: 20 as const,
  '2xl': 24 as const,
  '3xl': 30 as const,
  '4xl': 36 as const,
  '5xl': 48 as const,
  '6xl': 60 as const,
} as const;
