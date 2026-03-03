/**
 * 自然言語入力をパースして、店名・金額を抽出する
 * 例: "スタバで500円"、"コンビニで牛乳とパンで800円"
 */

export interface ParsedInput {
  storeName?: string;
  amount?: number;
  items?: string[];
}

/**
 * 自然言語入力をパースする
 */
export function parseNaturalInput(text: string): ParsedInput {
  if (!text || text.trim().length === 0) {
    return {};
  }

  const result: ParsedInput = {
    storeName: '',
    amount: 0,
    items: [],
  };

  // 店名を検出（店名キーワードリスト）
  const storeKeywords = [
    'スタバ', 'スターバックス', 'ドトール', 'タリーズ',
    'マクドナルド', 'マック', 'マクド',
    'セブン', 'セブンイレブン', 'ローソン', 'ファミマ',
    'ファミリーマート', 'ミニストップ', 'デイリーヤマザキ',
    'イオン', 'ライフ', 'コープ', '業務スーパー',
    'マックスバリュ', 'ユニクロ', 'GU', 'ZARA', 'H&M', 'しまむら',
    'マツモトキヨシ', 'ウエルシア', 'ツルハ', 'スギ薬局',
    'コンビニ', 'スーパー', 'ドラッグ', '薬局',
    'イトーヨード', 'ヨドバシ', 'ヤマダ',
    'ディズニーランド', 'ユニバーサル', 'USJ',
  ];

  // 金額パターン（円、万円、万、千、百）
  const amountPattern = /(\d+(?:[,]\d{3})*(?:円|万円|万円|千円|百円))/g;

  // 店名が含まれているかチェック
  let remainingText = text;

  for (const keyword of storeKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      result.storeName = keyword;
      // 店名以降のテキストを抽出
      const storeIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
      remainingText = text.substring(storeIndex + keyword.length).trim();
      break;
    }
  }

  // 金額を抽出
  const amountMatches = remainingText.match(amountPattern);
  if (amountMatches) {
    // カンマを除去して数値化
    const amountStr = amountMatches[0].replace(/[,]/g, '');
    result.amount = parseInt(amountStr, 10);
  }

  // 商品名を抽出（金額以外のテキスト）
  const cleanedText = remainingText.replace(amountPattern, '').trim();
  if (cleanedText.length > 0) {
    // 「と」「で」「の」などで分割
    result.items = cleanedText
      .split(/[とでの、・、]/)
      .filter(s => s.trim().length > 0);
  }

  return result;
}

/**
 * パース結果から入力文字列を生成する
 */
export function formatParsedInput(parsed: ParsedInput): string {
  const parts: string[] = [];

  if (parsed.storeName) {
    parts.push(parsed.storeName);
  }
  if (parsed.items && parsed.items.length > 0) {
    parts.push(parsed.items.join('・'));
  }
  if (parsed.amount) {
    parts.push(`${parsed.amount}円`);
  }

  return parts.join('で');
}

/**
 * 音声認識結果を処理して、入力画面に適用するためのテキストを生成
 */
export function processVoiceInput(transcript: string): {
  displayText: string;
  parsed: ParsedInput;
  confidence: number;
} {
  const parsed = parseNaturalInput(transcript);
  const displayText = formatParsedInput(parsed);

  // 簡単な信頼度スコアリング
  let confidence = 0.5;
  if (parsed.storeName && parsed.amount) {
    confidence = 0.8;
  }
  if (parsed.items && parsed.items.length > 0) {
    confidence = 0.9;
  }

  return {
    displayText,
    parsed,
    confidence,
  };
}
