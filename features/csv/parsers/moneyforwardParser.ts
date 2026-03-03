export interface CSVRow {
  [key: string]: string;
}

export interface ParsedTransaction {
  date: string;
  content: string;
  amount: number;
  bank: string;
  largeItem: string;
  middleItem: string;
  memo: string;
  transfer: string;
  id: string;
}

// マネーフォワードME形式のCSVパーサー
export function parseMoneyforwardCSV(csvText: string): ParsedTransaction[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    throw new Error('CSVが無効です');
  }

  // ヘッダー行を取得
  const headerLine = lines[0].split(',');
  const headers = headerLine.map(h => h.trim().replace(/"/g, ''));

  // 必要なカラムのインデックスを確認
  const requiredColumns = ['日付', '内容', '金額(税込)', '保有金融機関'];
  const columnIndices: Record<string, number> = {};
  headers.forEach((h, index) => {
    columnIndices[h] = index;
  });

  // すべての必須カラムが存在するか確認
  for (const col of requiredColumns) {
    if (!(col in columnIndices)) {
      throw new Error(`必須カラム "${col}" が見つかりません`);
    }
  }

  const transactions: ParsedTransaction[] = [];

  // データ行をパース（ヘッダーをスキップ）
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    // CSVの値をパース（クオートを考慮）
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else if (char === ',') {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) {
      values.push(current.trim());
    }

    if (values.length < headers.length) {
      continue; // 列数が不足している行はスキップ
    }

    const getValue = (headerName: string): string => {
      const index = columnIndices[headerName];
      return index !== undefined ? values[index] || '' : '';
    };

    const dateStr = getValue('日付').replace(/\//g, '-'); // 和暦を対応
    const amountStr = getValue('金額(税込)').replace(/[,-]/g, '').replace(/円/g, '');
    const amount = parseFloat(amountStr);

    // 日付を解析（複数形式に対応）
    let parsedDate = dateStr;
    const dateMatch = dateStr.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (dateMatch) {
      parsedDate = `${dateMatch[1]}-${dateMatch[3].padStart(2, '0')}-${dateMatch[5].padStart(2, '0')}`;
    }

    // 支出は正の数値（MFでは支出が正、収入がマイナス）
    const isExpense = amount > 0;

    transactions.push({
      date: parsedDate,
      content: getValue('内容'),
      amount: Math.abs(amount),
      bank: getValue('保有金融機関'),
      largeItem: getValue('大項目') || '',
      middleItem: getValue('中項目') || '',
      memo: getValue('メモ'),
      transfer: getValue('振替') || '',
      id: getValue('ID'),
    });
  }

  return transactions;
}

// 文字コードを検出（Shift_JIS対応）
export function detectEncoding(csvText: string): 'utf-8' | 'shift_jis' {
  // Shift_JISの可能性をチェック
  const hasShiftJISChars = /[\x81-\x9F\xFA-\xFD]/.test(csvText);
  return hasShiftJISChars ? 'shift_jis' : 'utf-8';
}

// CSVがマネーフォワードME形式かを判定
export function isMoneyforwardFormat(csvText: string): boolean {
  const firstLine = csvText.split('\n')[0];
  if (!firstLine) return false;

  return firstLine.includes('日付') &&
         firstLine.includes('金額(税込)') &&
         firstLine.includes('保有金融機関');
}
