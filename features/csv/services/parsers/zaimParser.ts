export function isZaimFormat(csvText: string): boolean {
    return csvText.includes('方法') && csvText.includes('よく使うエピソード');
}

export interface ZaimRow {
    date: string;
    item: string;
    income: number;
    expense: number;
    shop: string;
    memo: string;
}

export function parseZaimCSV(csvText: string): ZaimRow[] {
    // FIXME: 実装はスタブ
    return [];
}
