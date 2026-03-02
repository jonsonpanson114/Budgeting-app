# CLAUDE.md — ツッコミ家計簿 プロジェクト仕様書

## プロジェクト概要

既存の家計簿アプリ（マネーフォワードME / Zaim）のCSVデータを取り込み、AIによる「気づき」と「ツッコミ」で支出改善を促すモバイルアプリ。

コンセプト: 責めるのではなく気づかせる。努力ではなく意識の変化で節約を実現する。

---

## 技術スタック

- **フレームワーク**: React Native (Expo) + TypeScript + expo-router
- **バックエンド**: Supabase (認証・PostgreSQL・Edge Functions)
- **AI分析**: Claude API (支出分析・ツッコミ生成)
- **画像認識**: Gemini API (レシートOCR・食品認識)
- **状態管理**: Zustand
- **チャート**: Victory Native
- **UIライブラリ**: NativeWind (Tailwind CSS for React Native)

---

## デザインシステム

### 設計思想

Aesop、Diptyque、Monocle誌のような「素材と余白で語る上品さ」。装飾を足すのではなく、タイポグラフィ・余白・色の引き算で品質を表現する。

### カラーパレット

```typescript
export const colors = {
  // Base
  bg: '#FAFAF7',           // 温かみのあるオフホワイト
  bgWarm: '#F5F3EE',       // セカンダリ背景
  card: '#FFFFFF',          // カード背景
  cardAlt: '#F8F7F4',      // 代替カード背景
  cream: '#F0EDE6',         // アクセント背景

  // Typography
  ink: '#1A1A1A',           // プライマリテキスト
  inkSoft: '#3D3D3D',       // セカンダリテキスト
  inkMuted: '#8A8A82',      // ミュートテキスト
  inkLight: '#B5B5AD',      // 薄いテキスト

  // Accent (テラコッタ — 控えめに使用)
  accent: '#C4785C',        // メインアクセント
  accentSoft: '#D4967E',    // ソフトアクセント
  accentBg: '#FDF6F3',      // アクセント背景

  // Semantic
  sage: '#7A8F7A',          // 成功・ポジティブ
  sageSoft: '#9BAF9B',
  sageBg: '#F2F5F2',
  navy: '#2C3E50',          // 強調
  navySoft: '#4A6274',
  rose: '#C9928A',          // 警告
  roseBg: '#FBF3F1',
  slate: '#64748B',

  // Borders & Shadows
  border: '#E8E6E0',
  borderLight: '#F0EEE8',

  // Category Colors (控えめな彩度)
  catFood: '#C4785C',       // 食費 (テラコッタ)
  catTransport: '#4A6274',  // 交通費 (ネイビー)
  catEntertain: '#C9928A',  // 娯楽 (ローズ)
  catDaily: '#7A8F7A',      // 日用品 (セージ)
  catClothing: '#64748B',   // 被服費 (スレート)
  catComm: '#8A8A82',       // 通信費 (グレー)
  catHousing: '#2C3E50',    // 住居費 (ダークネイビー)
  catUtility: '#9BAF9B',    // 水道光熱 (ライトセージ)
} as const;
```

### タイポグラフィ

```typescript
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
```

### スペーシング

```typescript
export const spacing = {
  screenPadding: 20,   // 画面左右の余白
  cardPadding: 24,     // カード内部の余白
  cardRadius: 20,      // カードの角丸
  sectionGap: 24,      // セクション間の間隔
  itemGap: 16,         // アイテム間の間隔
  // 原則: 余白は多めに。詰め込まない。呼吸させる。
} as const;
```

### シャドウ

```typescript
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  // 影は極めて控えめに。ボーダーはニュートラルトーンで薄く。
} as const;
```

### コンポーネント設計原則

1. **カード**: 白背景 + 薄いボーダー(borderLight) + 微かなシャドウ。角丸20px。
2. **ボタン**: プライマリはaccent(テラコッタ)の塗り。白テキスト。角丸16px。
3. **リスト**: カード内にまとめ、セパレーターは左端インデント付きの極細線(borderLight)。
4. **チャート**: 曲線はCatmull-Romスプライン。塗りの下にaccent色のグラデーション(0.08透過)。ドットは白背景+accent stroke。
5. **入力フィールド**: 白背景 + border。フォーカス時のborderをaccentSoftに。
6. **タブバー**: テキストのみ。アクティブ状態はaccent色 + 下部に小さなバー(幅16px)。
7. **アイコン**: 絵文字を使用（React Native対応のため）。カテゴリ表示ではカラードットも併用。
8. **AIコメント**: cardAlt背景に配置。引用部分はserifフォント+italic。ラベルは小さく控えめに。

---

## データ取得戦略（ルートB）

```
[マネーフォワードME / Zaim]
  ↓ CSVエクスポート（ユーザーが取り込み）
[本アプリ]
  ├── CSVパーサー（MF形式 / Zaim形式 自動判別）
  ├── 店名 → カテゴリ AI自動分類
  ├── レシート撮影 OCR（Gemini Vision）
  ├── 手動入力
  └── AI分析 & ツッコミ生成
```

### CSVパーサー仕様

マネーフォワードME:
- カラム: 日付, 内容, 金額(税込), 保有金融機関, 大項目, 中項目, メモ, 振替, ID
- 文字コード: UTF-8 or Shift_JIS（自動判別が必要）
- 支出は正の数値、収入はマイナス

Zaim:
- カラム: 日付, 方法, カテゴリ, カテゴリの内訳, 支払元, 入金先, 品目, メモ, お店, 通貨, 収入, 支出, 振替, 残高調整, 通貨変換前の金額, PLACE
- 文字コード: UTF-8

---

## 画面構成

### ホーム画面
- 今月の残り予算（大きな数字、fontWeight: 300）
- AIコメントカード（cardAlt背景、serifフォントで引用風）
- 支出内訳（ドーナツチャート + カテゴリリスト）
- 直近の取引（5件）

### 入力画面
- モード切替（手動入力 / レシート撮影 / CSV取込）をSegmented Controlで
- 金額入力（中央配置、大きな数字、fontWeight: 300）
- カテゴリ選択（4列グリッド、選択時はaccentBg + accentSoftボーダー）
- 店名・メモフィールド
- 記録ボタン（accent色）

### 明細一覧画面
- 検索バー
- カテゴリフィルター（ピル型ボタン、選択時はink色反転）
- 取引リスト（カード内、セパレーター左インデント）

### 分析画面
- 支出推移チャート（6ヶ月、Catmull-Rom曲線）
- カテゴリ別前月比（横バー比較）
- AI分析レポート（気づき / 提案 / 良かった点 の3セクション、左ボーダーで色分け）

### 設定画面
- AIトーン選択（やさしめ / ふつう / きびしめ）
- 設定リスト（カード内グループ化、chevron付き）

---

## AI ツッコミ機能

### 分析データ構造

```typescript
interface AnalysisInput {
  period: string;              // "2026-03"
  total_income: number;
  total_expense: number;
  categories: {
    [name: string]: {
      amount: number;
      prev_month: number;
      transactions: Transaction[];
    };
  };
  patterns: {
    late_night_purchases: number;   // 22時以降の購入回数
    impulse_over_3000: number;      // 3000円以上の衝動買い
    subscriptions: string[];         // サブスク一覧
    frequent_stores: { name: string; count: number; total: number }[];
  };
}
```

### プロンプト設計方針

- トーン3段階: やさしめ（励まし中心）/ ふつう（バランス）/ きびしめ（率直に指摘）
- 言語: 関西弁（デフォルト）/ 標準語 / 先生口調
- 必ず「良かった点」を含める（ポジティブ強化）
- 具体的な金額と行動パターンを指摘する
- 実行可能な提案を1つ以上含める

### 出力形式

```typescript
interface AIComment {
  insights: { label: string; text: string }[];   // 気づき
  suggestions: { label: string; text: string }[]; // 提案
  praise: { label: string; text: string }[];      // 良かった点
  summary: string;                                 // ホーム画面用の短い一言
}
```

---

## データモデル（Supabase）

### transactions

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| date | date | 取引日 |
| amount | integer | 金額（円、支出は正の数） |
| type | text | income / expense / transfer |
| category_id | uuid | FK → categories |
| store_name | text | 店名 |
| memo | text | メモ |
| source | text | manual / csv_mf / csv_zaim / receipt |
| created_at | timestamptz | 作成日時 |

### categories

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | カテゴリ名 |
| parent_id | uuid | 親カテゴリ (nullable) |
| color | text | 表示色 (hex) |
| sort_order | integer | 並び順 |
| is_default | boolean | 初期カテゴリか |

### ai_comments

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| period | text | "YYYY-MM" or "YYYY-WXX" |
| type | text | weekly / monthly |
| content | jsonb | AIComment 構造 |
| tone | text | gentle / normal / strict |
| created_at | timestamptz | 生成日時 |

### user_settings

| カラム | 型 | 説明 |
|--------|-----|------|
| user_id | uuid | PK, FK → auth.users |
| monthly_budget | integer | 月次予算 |
| ai_tone | text | gentle / normal / strict |
| csv_source | text | moneyforward / zaim |
| created_at | timestamptz | 作成日時 |

### RLS ポリシー

全テーブルに `auth.uid() = user_id` の行レベルセキュリティを適用。

---

## カテゴリ自動分類（3段階推定 + ユーザー確認）

### 概要

CSV取込時・手動入力時に、店名からカテゴリを自動推定する。推定は3段階で行い、すべての取引はユーザーが後から変更可能。ユーザーの修正履歴は学習辞書として蓄積され、次回以降の推定精度が向上する。

### 推定フロー（3段階）

```
店名 → ① ユーザー学習辞書を検索（最優先）
      → ② ビルトイン辞書を検索
      → ③ Claude API で推定（フォールバック）
      → 推定結果 + 信頼度をセット
      → ユーザー確認画面へ
```

#### ① ユーザー学習辞書（最優先）

ユーザーが過去に修正した「店名→カテゴリ」の対応を記録。同じ店名が出てきたら最優先で適用。信頼度は最も高い。

```typescript
// store_category_mappings テーブル（後述）から取得
// 部分一致検索で柔軟にマッチ
// 例: "セブン-イレブン 三宮店" → "セブン-イレブン" でヒット
```

#### ② ビルトイン辞書

アプリに同梱する初期辞書。一般的な店名をカバー。

```typescript
const BUILTIN_STORE_CATEGORIES: {
  pattern: string;    // 部分一致パターン
  category: string;   // カテゴリ名
  confidence: number; // 信頼度 0-1
}[] = [
  // コンビニ
  { pattern: 'セブン-イレブン', category: '食費', confidence: 0.9 },
  { pattern: 'セブンイレブン', category: '食費', confidence: 0.9 },
  { pattern: 'ローソン', category: '食費', confidence: 0.9 },
  { pattern: 'ファミリーマート', category: '食費', confidence: 0.9 },
  { pattern: 'ファミマ', category: '食費', confidence: 0.9 },
  { pattern: 'ミニストップ', category: '食費', confidence: 0.9 },
  { pattern: 'デイリーヤマザキ', category: '食費', confidence: 0.9 },

  // スーパー
  { pattern: 'イオン', category: '食費', confidence: 0.85 },
  { pattern: 'ライフ', category: '食費', confidence: 0.85 },
  { pattern: 'コープ', category: '食費', confidence: 0.85 },
  { pattern: '業務スーパー', category: '食費', confidence: 0.9 },
  { pattern: 'マックスバリュ', category: '食費', confidence: 0.85 },

  // カフェ・飲食
  { pattern: 'スターバックス', category: '食費', confidence: 0.95 },
  { pattern: 'スタバ', category: '食費', confidence: 0.95 },
  { pattern: 'ドトール', category: '食費', confidence: 0.95 },
  { pattern: 'マクドナルド', category: '食費', confidence: 0.95 },
  { pattern: '吉野家', category: '食費', confidence: 0.95 },
  { pattern: '松屋', category: '食費', confidence: 0.85 },
  { pattern: 'すき家', category: '食費', confidence: 0.95 },
  { pattern: 'CoCo壱', category: '食費', confidence: 0.95 },
  { pattern: 'ガスト', category: '食費', confidence: 0.95 },
  { pattern: 'サイゼリヤ', category: '食費', confidence: 0.95 },

  // アパレル
  { pattern: 'ユニクロ', category: '被服費', confidence: 0.95 },
  { pattern: 'UNIQLO', category: '被服費', confidence: 0.95 },
  { pattern: 'GU', category: '被服費', confidence: 0.9 },
  { pattern: 'ZARA', category: '被服費', confidence: 0.95 },
  { pattern: 'H&M', category: '被服費', confidence: 0.95 },
  { pattern: 'しまむら', category: '被服費', confidence: 0.95 },

  // 交通
  { pattern: 'JR', category: '交通費', confidence: 0.95 },
  { pattern: 'Suica', category: '交通費', confidence: 0.9 },
  { pattern: 'ICOCA', category: '交通費', confidence: 0.9 },
  { pattern: 'PASMO', category: '交通費', confidence: 0.9 },
  { pattern: '阪急', category: '交通費', confidence: 0.85 },
  { pattern: '阪神', category: '交通費', confidence: 0.85 },
  { pattern: 'タクシー', category: '交通費', confidence: 0.95 },
  { pattern: 'Uber', category: '交通費', confidence: 0.8 },

  // ドラッグストア
  { pattern: 'マツモトキヨシ', category: '日用品', confidence: 0.8 },
  { pattern: 'ウエルシア', category: '日用品', confidence: 0.8 },
  { pattern: 'ツルハ', category: '日用品', confidence: 0.8 },
  { pattern: 'スギ薬局', category: '日用品', confidence: 0.8 },

  // 通信
  { pattern: 'docomo', category: '通信費', confidence: 0.95 },
  { pattern: 'au', category: '通信費', confidence: 0.8 },
  { pattern: 'SoftBank', category: '通信費', confidence: 0.9 },
  { pattern: '楽天モバイル', category: '通信費', confidence: 0.95 },

  // EC（信頼度低め＝多カテゴリのため確認推奨）
  { pattern: 'Amazon', category: '日用品', confidence: 0.5 },
  { pattern: 'アマゾン', category: '日用品', confidence: 0.5 },
  { pattern: '楽天', category: '日用品', confidence: 0.45 },
  { pattern: 'Yahoo', category: '日用品', confidence: 0.45 },
  { pattern: 'メルカリ', category: '日用品', confidence: 0.4 },

  // サブスク・娯楽
  { pattern: 'Netflix', category: '娯楽', confidence: 0.95 },
  { pattern: 'Spotify', category: '娯楽', confidence: 0.95 },
  { pattern: 'Apple', category: '通信費', confidence: 0.6 },
  { pattern: 'Google Play', category: '娯楽', confidence: 0.7 },
  { pattern: 'YouTube', category: '娯楽', confidence: 0.9 },
  { pattern: 'Adobe', category: '娯楽', confidence: 0.7 },

  // 光熱
  { pattern: '電力', category: '水道光熱', confidence: 0.95 },
  { pattern: 'ガス', category: '水道光熱', confidence: 0.85 },
  { pattern: '水道', category: '水道光熱', confidence: 0.95 },
  { pattern: '東京電力', category: '水道光熱', confidence: 0.95 },
  { pattern: '関西電力', category: '水道光熱', confidence: 0.95 },
  { pattern: '大阪ガス', category: '水道光熱', confidence: 0.95 },
];
```

#### ③ Claude API フォールバック

辞書にマッチしなかった店名をClaude APIに投げて推定。金額情報も含めて精度を上げる。

```typescript
// Edge Function: classify-store
// Input: { store_name: string, amount: number, date: string }
// Output: { category: string, confidence: number, reasoning: string }

// プロンプト例:
// 「以下の取引の支出カテゴリを推定してください。
//   店名: ドン・キホーテ 渋谷店
//   金額: ¥3,280
//   日付: 2026-03-01
//   カテゴリ候補: 食費, 日用品, 被服費, 娯楽, 交通費, 通信費, 住居費, 水道光熱
//   JSON形式で回答: { "category": "...", "confidence": 0.0-1.0, "reasoning": "..." }」
```

#### バッチ推定（CSV取込時）

CSV取込時はまとめてAPIに送る（1回のリクエストで最大20件）。APIコストを抑えるため、辞書でマッチしたものはAPIに送らない。

```typescript
// CSV取込フロー:
// 1. CSVパース → 全取引を配列に
// 2. 各取引の店名を ①ユーザー辞書 → ②ビルトイン辞書 で検索
// 3. マッチしなかったものだけ ③Claude API にバッチ送信
// 4. 全取引に推定カテゴリ + 信頼度をセット
// 5. 確認画面へ
```

### 信頼度による表示分け

| 信頼度 | 表示 | 意味 |
|--------|------|------|
| 0.8以上 | カテゴリ名のみ表示 | 高確信。そのまま登録 |
| 0.5〜0.8 | カテゴリ名 + ⚠️マーク | 中確信。確認推奨 |
| 0.5未満 | 「未分類」+ カテゴリ候補表示 | 低確信。ユーザー選択必須 |

### ユーザー確認・修正フロー

#### CSV取込後の確認画面

```
┌─────────────────────────────────┐
│  取込結果（32件）                  │
│                                  │
│  ✅ 自動分類済み: 24件            │
│  ⚠️ 確認推奨: 5件                │
│  ❓ 未分類: 3件                   │
│                                  │
│  [確認推奨の取引を見る]            │
│  [すべて確認する]                  │
│  [このまま登録する]                │
└─────────────────────────────────┘
```

#### 個別修正UI

取引をタップすると修正モーダルが開く:

```
┌─────────────────────────────────┐
│  セブン-イレブン 三宮店            │
│  ¥680  3月2日                    │
│                                  │
│  カテゴリ: [食費 ▼]  ← タップで変更│
│                                  │
│  ☐ この店名を記憶する              │
│    → 次回から「セブン-イレブン」は   │
│      自動で「食費」に分類           │
│                                  │
│  [保存]                           │
└─────────────────────────────────┘
```

#### 明細一覧からの修正

明細一覧画面で取引をタップ → 詳細画面 → カテゴリ変更可能。変更時に「この店名を記憶する」チェックボックスを表示。

### 学習辞書の仕組み

ユーザーがカテゴリを修正し「この店名を記憶する」をONにすると、`store_category_mappings`テーブルに保存。次回以降の同じ店名は自動でそのカテゴリに分類される。

#### store_category_mappings テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| store_pattern | text | 店名パターン（正規化済み） |
| category_id | uuid | FK → categories |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

#### 店名の正規化ルール

```typescript
function normalizeStoreName(name: string): string {
  return name
    .replace(/\s+/g, ' ')          // 連続スペースを1つに
    .replace(/[０-９]/g, c =>       // 全角数字→半角
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[Ａ-Ｚａ-ｚ]/g, c => // 全角英字→半角
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[\s]*[店舗支店出張所営業所]$/, '') // 末尾の「店」「支店」等を除去
    .replace(/[\s]*[0-9A-Za-z\-]+[店号]?$/, '') // 末尾の店舗番号を除去
    .trim();
}
// 例: "セブン-イレブン　三宮店" → "セブン-イレブン"
// 例: "スターバックス 元町３号店" → "スターバックス"
```

### transactions テーブルへの追加カラム

| カラム | 型 | 説明 |
|--------|-----|------|
| category_confidence | real | 推定信頼度 (0-1) |
| category_source | text | builtin / user_dict / ai / manual |
| category_confirmed | boolean | ユーザーが確認済みか (default: false) |

信頼度0.8以上の自動分類は `category_confirmed = false` のまま登録し、ユーザーが明示的に確認または修正した時点で `true` に更新。

---

## 開発ロードマップ

### Phase 1（2-3週間）: 基盤 + 手動入力
- Expo プロジェクト初期化 (TypeScript, expo-router, NativeWind)
- Supabase セットアップ (認証・DB・RLS)
- デザインシステム実装 (colors, typography, spacing, shadows)
- Tab ナビゲーション (ホーム・入力・明細・分析・設定)
- 手動入力フォーム
- 明細一覧 (リスト表示)
- 基本的な収支サマリー

### Phase 2（2-3週間）: CSV取込 + 自動分類
- CSVパーサー (MF / Zaim 自動判別)
- CSV取込 UI (ファイルピッカー → プレビュー → 確定)
- 店名辞書 + Claude API フォールバック分類
- カテゴリ管理画面

### Phase 3（2週間）: AI分析 & ツッコミ
- 支出データ集計ロジック
- Claude API 連携 (ツッコミ生成 Edge Function)
- AIコメントカード UI
- トーン設定 (やさしめ / ふつう / きびしめ)
- 週次・月次レポート

### Phase 4（随時）: 磨き込み
- レシート OCR (Gemini Vision)
- チャート (Victory Native)
- カレンダー表示
- データバックアップ
- テーマ切替

---

## セキュリティ・プライバシー

- 金融データは Supabase RLS でユーザー単位に厳密に保護
- API キーは Supabase Edge Functions の環境変数に格納（クライアントに露出しない）
- CSVはアプリ内で処理し、元ファイルは保存しない
- AI分析用データは必要最小限に匿名化して送信

---

## コーディング規約

- TypeScript strict mode
- コンポーネントは関数コンポーネント + hooks
- ファイル構成: feature-based (例: features/transactions/, features/analysis/)
- スタイル: NativeWind (Tailwind) を基本とし、デザインシステムの色・spacing定数を使う
- コメント: 日本語OK
- エラーハンドリング: try-catch + ユーザー向けトースト通知
