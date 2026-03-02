export interface StoreCategoryMapping {
  pattern: string;    // 部分一致パターン
  category: string;   // カテゴリ名
  confidence: number; // 信頼度 0-1
}

export const BUILTIN_STORE_CATEGORIES: StoreCategoryMapping[] = [
  // コンビニ
  { pattern: 'セブン-イレブン', category: '食費', confidence: 0.9 },
  { pattern: 'セブンイレブン', category: '食費', confidence: 0.9 },
  { pattern: '7-ELEVEN', category: '食費', confidence: 0.9 },
  { pattern: 'ローソン', category: '食費', confidence: 0.9 },
  { pattern: 'LAWSON', category: '食費', confidence: 0.9 },
  { pattern: 'ファミリーマート', category: '食費', confidence: 0.9 },
  { pattern: 'ファミマ', category: '食費', confidence: 0.9 },
  { pattern: 'FAMILYMART', category: '食費', confidence: 0.9 },
  { pattern: 'ミニストップ', category: '食費', confidence: 0.9 },
  { pattern: 'デイリーヤマザキ', category: '食費', confidence: 0.9 },

  // スーパー
  { pattern: 'イオン', category: '食費', confidence: 0.85 },
  { pattern: 'AEON', category: '食費', confidence: 0.85 },
  { pattern: 'ライフ', category: '食費', confidence: 0.85 },
  { pattern: 'コープ', category: '食費', confidence: 0.85 },
  { pattern: '業務スーパー', category: '食費', confidence: 0.9 },
  { pattern: 'マックスバリュ', category: '食費', confidence: 0.85 },
  { pattern: 'イズミヤ', category: '食費', confidence: 0.85 },
  { pattern: 'スーパーアルプス', category: '食費', confidence: 0.85 },
  { pattern: 'ジャスコ', category: '食費', confidence: 0.85 },
  { pattern: 'イオングループ', category: '食費', confidence: 0.8 },

  // カフェ・飲食
  { pattern: 'スターバックス', category: '食費', confidence: 0.95 },
  { pattern: 'スタバ', category: '食費', confidence: 0.95 },
  { pattern: 'STARBUCKS', category: '食費', confidence: 0.95 },
  { pattern: 'ドトール', category: '食費', confidence: 0.95 },
  { pattern: 'DOUTOR', category: '食費', confidence: 0.95 },
  { pattern: 'エクセルシオ', category: '食費', confidence: 0.9 },
  { pattern: 'タリーズ', category: '食費', confidence: 0.9 },
  { pattern: 'マクドナルド', category: '食費', confidence: 0.95 },
  { pattern: 'McDonald', category: '食費', confidence: 0.95 },
  { pattern: 'モスバーガー', category: '食費', confidence: 0.9 },
  { pattern: 'ロッテリア', category: '食費', confidence: 0.9 },
  { pattern: '吉野家', category: '食費', confidence: 0.95 },
  { pattern: '松屋', category: '食費', confidence: 0.85 },
  { pattern: 'すき家', category: '食費', confidence: 0.95 },
  { pattern: 'SUKIYA', category: '食費', confidence: 0.95 },
  { pattern: 'CoCo壱', category: '食費', confidence: 0.95 },
  { pattern: 'カレー', category: '食費', confidence: 0.9 },
  { pattern: 'ガスト', category: '食費', confidence: 0.95 },
  { pattern: 'サイゼリヤ', category: '食費', confidence: 0.95 },
  { pattern: 'Saizeriya', category: '食費', confidence: 0.95 },
  { pattern: 'バーミヤン', category: '食費', confidence: 0.9 },
  { pattern: 'スシロー', category: '食費', confidence: 0.95 },
  { pattern: 'くら寿司', category: '食費', confidence: 0.95 },
  { pattern: '牛角', category: '食費', confidence: 0.95 },
  { pattern: '鳥貴族', category: '食費', confidence: 0.9 },

  // アパレル
  { pattern: 'ユニクロ', category: '被服費', confidence: 0.95 },
  { pattern: 'UNIQLO', category: '被服費', confidence: 0.95 },
  { pattern: 'GU', category: '被服費', confidence: 0.9 },
  { pattern: 'ZARA', category: '被服費', confidence: 0.95 },
  { pattern: 'H&M', category: '被服費', confidence: 0.95 },
  { pattern: 'しまむら', category: '被服費', confidence: 0.95 },
  { pattern: '洋服の青山', category: '被服費', confidence: 0.9 },
  { pattern: 'AOKI', category: '被服費', confidence: 0.9 },
  { pattern: '紳士服', category: '被服費', confidence: 0.85 },

  // 交通
  { pattern: 'JR', category: '交通費', confidence: 0.95 },
  { pattern: 'Suica', category: '交通費', confidence: 0.9 },
  { pattern: 'ICOCA', category: '交通費', confidence: 0.9 },
  { pattern: 'PASMO', category: '交通費', confidence: 0.9 },
  { pattern: 'TOICA', category: '交通費', confidence: 0.9 },
  { pattern: 'nimoca', category: '交通費', confidence: 0.9 },
  { pattern: 'Kitaca', category: '交通費', confidence: 0.9 },
  { pattern: 'SUGOCA', category: '交通費', confidence: 0.9 },
  { pattern: 'はやかけん', category: '交通費', confidence: 0.9 },
  { pattern: '阪急', category: '交通費', confidence: 0.85 },
  { pattern: '阪神', category: '交通費', confidence: 0.85 },
  { pattern: '南海', category: '交通費', confidence: 0.85 },
  { pattern: '近鉄', category: '交通費', confidence: 0.85 },
  { pattern: '京阪', category: '交通費', confidence: 0.85 },
  { pattern: '地下鉄', category: '交通費', confidence: 0.9 },
  { pattern: '地下鉄', category: '交通費', confidence: 0.9 },
  { pattern: 'タクシー', category: '交通費', confidence: 0.95 },
  { pattern: '第一', category: '交通費', confidence: 0.95 },
  { pattern: 'MK', category: '交通費', confidence: 0.9 },
  { pattern: 'Uber', category: '交通費', confidence: 0.8 },
  { pattern: 'Lyft', category: '交通費', confidence: 0.8 },

  // ドラッグストア
  { pattern: 'マツモトキヨシ', category: '日用品', confidence: 0.8 },
  { pattern: 'ウエルシア', category: '日用品', confidence: 0.8 },
  { pattern: 'ツルハ', category: '日用品', confidence: 0.8 },
  { pattern: 'スギ薬局', category: '日用品', confidence: 0.8 },
  { pattern: 'サガミ', category: '日用品', confidence: 0.8 },
  { pattern: 'ドラッグ', category: '日用品', confidence: 0.75 },

  // 通信
  { pattern: 'docomo', category: '通信費', confidence: 0.95 },
  { pattern: 'ドコモ', category: '通信費', confidence: 0.95 },
  { pattern: 'au', category: '通信費', confidence: 0.8 },
  { pattern: 'SoftBank', category: '通信費', confidence: 0.9 },
  { pattern: 'ソフトバンク', category: '通信費', confidence: 0.9 },
  { pattern: '楽天モバイル', category: '通信費', confidence: 0.95 },
  { pattern: 'Y!mobile', category: '通信費', confidence: 0.9 },
  { pattern: 'LINEMO', category: '通信費', confidence: 0.9 },
  { pattern: 'OCN', category: '通信費', confidence: 0.85 },
  { pattern: 'BIGLOBE', category: '通信費', confidence: 0.85 },
  { pattern: 'So-net', category: '通信費', confidence: 0.85 },

  // EC（信頼度低め＝多カテゴリのため確認推奨）
  { pattern: 'Amazon', category: '日用品', confidence: 0.5 },
  { pattern: 'アマゾン', category: '日用品', confidence: 0.5 },
  { pattern: '楽天', category: '日用品', confidence: 0.45 },
  { pattern: 'Yahoo', category: '日用品', confidence: 0.45 },
  { pattern: 'メルカリ', category: '日用品', confidence: 0.4 },
  { pattern: 'ZOZOTOWN', category: '被服費', confidence: 0.8 },
  { pattern: 'Rakuten', category: '日用品', confidence: 0.45 },

  // サブスク・娯楽
  { pattern: 'Netflix', category: '娯楽', confidence: 0.95 },
  { pattern: 'NETFLIX', category: '娯楽', confidence: 0.95 },
  { pattern: 'Spotify', category: '娯楽', confidence: 0.95 },
  { pattern: 'Apple', category: '通信費', confidence: 0.6 },
  { pattern: 'iTunes', category: '娯楽', confidence: 0.9 },
  { pattern: 'App Store', category: '娯楽', confidence: 0.9 },
  { pattern: 'Google Play', category: '娯楽', confidence: 0.7 },
  { pattern: 'YouTube', category: '娯楽', confidence: 0.9 },
  { pattern: 'YOUTUBE', category: '娯楽', confidence: 0.9 },
  { pattern: 'Adobe', category: '娯楽', confidence: 0.7 },
  { pattern: 'Disney', category: '娯楽', confidence: 0.9 },
  { pattern: 'Disney+', category: '娯楽', confidence: 0.9 },
  { pattern: 'U-NEXT', category: '娯楽', confidence: 0.9 },
  { pattern: 'Hulu', category: '娯楽', confidence: 0.9 },
  { pattern: 'DAZN', category: '娯楽', confidence: 0.95 },
  { pattern: 'Abema', category: '娯楽', confidence: 0.9 },

  // 光熱
  { pattern: '電力', category: '水道光熱', confidence: 0.95 },
  { pattern: 'ガス', category: '水道光熱', confidence: 0.85 },
  { pattern: '水道', category: '水道光熱', confidence: 0.95 },
  { pattern: '東京電力', category: '水道光熱', confidence: 0.95 },
  { pattern: '関西電力', category: '水道光熱', confidence: 0.95 },
  { pattern: '中部電力', category: '水道光熱', confidence: 0.95 },
  { pattern: '大阪ガス', category: '水道光熱', confidence: 0.95 },
  { pattern: '東京ガス', category: '水道光熱', confidence: 0.95 },
  { pattern: '水道局', category: '水道光熱', confidence: 0.95 },
] as const;

// 店名からカテゴリを検索（部分一致）
export function findStoreCategory(storeName: string): { category: string; confidence: number } | null {
  for (const mapping of BUILTIN_STORE_CATEGORIES) {
    if (storeName.includes(mapping.pattern)) {
      return { category: mapping.category, confidence: mapping.confidence };
    }
  }
  return null;
}

// 店名の正規化（パターンマッチ用）
export function normalizeStoreName(name: string): string {
  return name
    .replace(/\s+/g, ' ')          // 連続スペースを1つに
    .replace(/[０-９]/g, (c) =>      // 全角数字→半角
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[Ａ-Ｚａ-ｚ]/g, (c) => // 全角英字→半角
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[\s]*[店舗支店出張所営業所]$/, '') // 末尾の「店」「支店」等を除去
    .replace(/[\s]*[0-9A-Za-z\-]+[店号]?$/, '') // 末尾の店舗番号を除去
    .trim();
}
