export interface ParsedTransaction {
  date: string;
  method: string;
  category: string;
  subCategory: string;
  paymentSource: string;
  depositDestination: string;
  item: string;
  memo: string;
  shop: string;
  currency: string;
  income: number;
  expense: number;
  transfer: number;
  balanceAdjustment: number;
  place: string;
  amountBeforeCurrencyConversion: number;
}

// Zaim形式のCSVパーサー
export function parseZaimCSV(csvText: string): ParsedTransaction[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    throw new Error('CSVが無効です');
  }

  // ヘッダー行を取得
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim());

  // 必要なカラムのインデックスを確認
  const columnIndices: Record<string, number> = {};
  headers.forEach((h, index) => {
    columnIndices[h] = index;
  });

  // 必要なカラムを確認
  const requiredColumns = ['日付', '支払', '品目'];
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
      continue;
    }

    const getValue = (headerName: string): string => {
      const index = columnIndices[headerName];
      return index !== undefined ? values[index] || '' : '';
    };

    const dateStr = getValue('日付');
    const expenseStr = getValue('支出');
    const incomeStr = getValue('入金');
    const amountStr = expenseStr || incomeStr || '';
    const amount = parseFloat(amountStr.replace(/[,-]/g, '').replace(/円/g, '')) || 0;

    // Zaimでは支出・収入・振替のどれかで表現される
    const isExpense = !!expenseStr;
    const isIncome = !!incomeStr;
    const isTransfer = getValue('振替') !== '';

    if (amount === 0 && !isTransfer) {
      continue; // 金額がない取引はスキップ
    }

    // 日付を解析
    let parsedDate = dateStr;
    const dateMatch = dateStr.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (dateMatch) {
      parsedDate = `${dateMatch[1]}-${dateMatch[3].padStart(2, '0')}-${dateMatch[5].padStart(2, '0')}`;
    }

    transactions.push({
      date: parsedDate,
      method: getValue('方法'),
      category: getValue('カテゴリ') || '',
      subCategory: getValue('カテゴリの内訳') || '',
      paymentSource: getValue('支払元') || '',
      depositDestination: getValue('入金先') || '',
      item: getValue('品目') || getValue('メモ') || '',
      memo: getValue('メモ') || '',
      shop: getValue('お店'),
      currency: getValue('通貨'),
      income: isIncome ? amount : 0,
      expense: isExpense ? amount : 0,
      transfer: isTransfer ? amount : 0,
      balanceAdjustment: parseFloat(getValue('残高調整').replace(/[,-]/g, '') || 0,
      place: getValue('PLACE'),
      amountBeforeCurrencyConversion: parseFloat(getValue('通貨変換前の金額').replace(/[,-]/g, '') || 0,
    });
  }

  return transactions;
}

// CSVがZaim形式かを判定
export function isZaimFormat(csvText: string): boolean {
  const firstLine = csvText.split('\n')[0];
  if (!firstLine) return false;

  return firstLine.includes('日付') &&
         firstLine.includes('支払') &&
         firstLine.includes('品目') &&
         firstLine.includes('お店');
}
