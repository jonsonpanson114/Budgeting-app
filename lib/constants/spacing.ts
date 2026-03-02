export const spacing = {
  screenPadding: 20,   // 画面左右の余白
  cardPadding: 24,     // カード内部の余白
  cardRadius: 20,      // カードの角丸
  sectionGap: 24,      // セクション間の間隔
  itemGap: 16,         // アイテム間の間隔

  // 追加のスペーシング
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

// 原則: 余白は多めに。詰め込まない。呼吸させる。
