import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数からAPIキーを取得（実運用ではSupabase Edge Functions経由が望ましい）
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface ParsedReceipt {
  storeName: string;
  totalAmount: number;
  items: ReceiptItem[];
  confidence: number;
  rawText?: string;
}

/**
 * レシート画像からテキストを抽出してパースする
 */
export async function parseReceipt(imageUri: string): Promise<ParsedReceipt> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEYが設定されていません');
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 画像をbase64エンコード
    const imageBase64 = await uriToBase64(imageUri);

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    const prompt = `
以下のレシート画像から情報を抽出してください。
JSON形式で以下の構造で回答してください:
{
  "storeName": "店名（例：セブン-イレブン）",
  "totalAmount": 合計金額（数値のみ）,
  "items": [
    {
      "name": "商品名",
      "price": 単価（数値のみ）,
      "quantity": 数量（あれば）
    }
  ],
  "confidence": 0.0から1.0の信頼度スコア
}

重要なルール:
1. storeNameは短く簡潔に（支店名は除く）
2. totalAmountは合計金額のみ（税込）
3. itemsは主要な商品を5つまで
4. 数字はカンマなしで数値のみ
5. JSON以外のテキストは出力しないでください
`;

    const result = await model.generateContent([imagePart, prompt]);
    const response = result.response.text();

    // JSONを抽出
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('レシートの解析に失敗しました');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      storeName: parsed.storeName || '不明',
      totalAmount: parsed.totalAmount || 0,
      items: parsed.items || [],
      confidence: parsed.confidence || 0.5,
      rawText: response,
    };
  } catch (error) {
    console.error('Receipt parsing error:', error);
    throw error;
  }
}

/**
 * URIをbase64文字列に変換（ブラウザとネイティブの両対応）
 */
async function uriToBase64(uri: string): Promise<string> {
  // ファイルURI（file://）の処理
  if (uri.startsWith('file://')) {
    return uriToBase64Native(uri);
  }

  // HTTP/HTTPS URIの処理
  if (uri.startsWith('http')) {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Base64 URI（data:image/...）の処理
  if (uri.startsWith('data:')) {
    return uri.split(',')[1];
  }

  throw new Error('Unsupported image URI format');
}

/**
 * ネイティブ環境でのbase64変換
 */
function uriToBase64Native(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // RNのFileSystemが必要だが、expo-file-systemを使う
    // ここでは簡易的にfetchを使うアプローチ
    fetch(uri)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

/**
 * レシート画像の品質チェック
 */
export async function validateReceiptImage(imageUri: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    // 基本的なURIチェック
    if (!imageUri || imageUri.length === 0) {
      return { valid: false, reason: '画像が選択されていません' };
    }

    // 画像サイズチェック（簡易的に）
    const imageBase64 = await uriToBase64(imageUri);
    const sizeKB = imageBase64.length * 0.75 / 1024; // base64概算サイズ

    if (sizeKB > 5000) {
      return { valid: false, reason: '画像サイズが大きすぎます（5MB以下にしてください）' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: '画像の読み込みに失敗しました' };
  }
}
