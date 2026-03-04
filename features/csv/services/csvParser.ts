import { parseMoneyforwardCSV, isMoneyforwardFormat, detectEncoding } from './parsers/moneyforwardParser';
import { parseZaimCSV, isZaimFormat } from './parsers/zaimParser';

export type CSVFormat = 'moneyforward' | 'zaim' | 'unknown';

export interface CSVParseResult {
  format: CSVFormat;
  transactions: {
    date: string;
    content?: string;
    item?: string;
    amount: number;
    bank?: string;
    shop?: string;
    memo?: string;
  }[];
  encoding?: string;
}

export async function parseCSV(csvText: string): Promise<CSVParseResult> {
  if (!csvText || csvText.trim().length === 0) {
    throw new Error('CSVが空です');
  }

  // 文字コードを検出
  const encoding = detectEncoding(csvText);

  // フォーマットを自動判別
  let format: CSVFormat = 'unknown';
  if (isMoneyforwardFormat(csvText)) {
    format = 'moneyforward';
  } else if (isZaimFormat(csvText)) {
    format = 'zaim';
  }

  if (format === 'unknown') {
    throw new Error('認識できないCSV形式です。マネーフォワードMEまたはZaimのCSVを入力してください。');
  }

  let transactions;

  if (format === 'moneyforward') {
    const mfData = parseMoneyforwardCSV(csvText);
    transactions = mfData.map(t => ({
      date: t.date,
      content: t.content,
      amount: t.amount,
      shop: t.bank, // 保有金融機関を店名として扱う
      memo: t.memo,
    }));
  } else if (format === 'zaim') {
    const zaimData = parseZaimCSV(csvText);
    transactions = zaimData.map(t => ({
      date: t.date,
      item: t.item,
      amount: t.income > 0 ? t.income : t.expense,
      shop: t.shop,
      memo: t.memo,
    }));
  }

  return {
    format,
    transactions,
    encoding,
  };
}

// ファイルからCSVを読み込む
export async function readCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result as string;
      if (!text) {
        reject(new Error('CSVファイルの読み込みに失敗しました'));
        return;
      }

      try {
        const result = parseCSV(text);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('CSVファイルの読み込みに失敗しました'));
    };

    reader.readAsText(file);
  });
}

// 金額文字列を数値に変換するヘルパー
export function parseAmount(amountStr: string): number {
  // カンマと円を削除
  const cleaned = amountStr.replace(/,/g, '').replace(/円/g, '').trim();
  return parseFloat(cleaned) || 0;
}
