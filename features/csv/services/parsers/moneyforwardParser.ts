export function detectEncoding(csvText: string): string {
    // 簡易的な判定実装
    if (csvText.includes('')) return 'Shift_JIS';
    return 'utf-8';
}

export function isMoneyforwardFormat(csvText: string): boolean {
    return csvText.includes('計算対象') || csvText.includes('保有金融機関');
}

export interface MoneyforwardRow {
    date: string;
    content: string;
    amount: number;
    bank: string;
    memo: string;
}

export function parseMoneyforwardCSV(csvText: string): MoneyforwardRow[] {
    // FIXME: 実装はスタブ
    return [];
}
