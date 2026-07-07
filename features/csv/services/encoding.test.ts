import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeCsvBytes } from './encoding.ts';
import { parseCSV } from './csvParser.ts';

// ASCII文字はコードポイントそのままでバイト列に変換できるヘルパー。
// 日本語文字はこのヘルパーを使わず、下記の既知 CP932(Shift_JIS) バイト値を
// 個別にリテラルで並べる（ライブラリでエンコードして往復させることはしない）。
function asciiBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(`asciiBytes: 非ASCII文字は使用不可: ${str}`);
    }
    bytes.push(code);
  }
  return bytes;
}

// 既知の CP932 (Shift_JIS) バイト値（JIS X 0208 / CP932 の公開仕様に基づくアンカー）。
// 「日」= 0x93,0xFA、「付」= 0x95,0x74 は仕様書指定のアンカー。
const SJIS = {
  日: [0x93, 0xfa],
  付: [0x95, 0x74],
  内: [0x93, 0xe0],
  容: [0x97, 0x65],
  金: [0x8b, 0xe0],
  額: [0x8a, 0x7a],
  税: [0x90, 0xc5],
  込: [0x8d, 0x9e],
  保: [0x95, 0xdb],
  有: [0x97, 0x4c],
  融: [0x97, 0x5a],
  機: [0x8b, 0x40],
  関: [0x8a, 0xd6],
  コ: [0x83, 0x52],
  ン: [0x83, 0x93],
  ビ: [0x83, 0x72],
  ニ: [0x83, 0x6a],
  現: [0x8c, 0xbb],
};

function concatBytes(...chunks: (number[] | Uint8Array)[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

test('Shift_JISバイト列は encoding=shift_jis と判定され、正しくデコードされる（「日付」= 0x93,0xFA,0x95,0x74 アンカー）', () => {
  // 「日付」の2文字のみのバイト列
  const bytes = new Uint8Array([...SJIS.日, ...SJIS.付]);
  const result = decodeCsvBytes(bytes);
  assert.equal(result.encoding, 'shift_jis');
  assert.equal(result.text, '日付');
});

test('UTF-8（BOMなし）は encoding=utf-8 と判定される', () => {
  const text = '日付,内容,金額(税込)';
  const bytes = new TextEncoder().encode(text);
  const result = decodeCsvBytes(bytes);
  assert.equal(result.encoding, 'utf-8');
  assert.equal(result.text, text);
});

test('UTF-8 BOM付きは encoding=utf-8 と判定され、BOMは除去される', () => {
  const text = '日付,内容,金額(税込)';
  const withoutBom = new TextEncoder().encode(text);
  const bytes = concatBytes([0xef, 0xbb, 0xbf], withoutBom);
  const result = decodeCsvBytes(bytes);
  assert.equal(result.encoding, 'utf-8');
  assert.equal(result.text, text);
});

test('空のUint8Arrayはutf-8・空文字列・例外なしにフォールバックする', () => {
  assert.doesNotThrow(() => {
    const result = decodeCsvBytes(new Uint8Array(0));
    assert.equal(result.encoding, 'utf-8');
    assert.equal(result.text, '');
  });
});

test('統合テスト: Shift_JISのMF形式CSV全体をdecodeCsvBytes→parseCSVに通すとmoneyforward形式で2件以上取り込める', async () => {
  // ヘッダー: 日付,内容,金額(税込),保有金融機関
  const header = concatBytes(
    SJIS.日,
    SJIS.付,
    asciiBytes(','),
    SJIS.内,
    SJIS.容,
    asciiBytes(','),
    SJIS.金,
    SJIS.額,
    asciiBytes('('),
    SJIS.税,
    SJIS.込,
    asciiBytes(')'),
    asciiBytes(','),
    SJIS.保,
    SJIS.有,
    SJIS.金,
    SJIS.融,
    SJIS.機,
    SJIS.関
  );

  // データ行1: 2026/7/7,"コンビニ,店舗",-1000,現金 （マイナス金額 + カンマ入りクオート値）
  const row1 = concatBytes(
    asciiBytes('2026/7/7,"'),
    SJIS.コ,
    SJIS.ン,
    SJIS.ビ,
    SJIS.ニ,
    asciiBytes(','),
    asciiBytes('store'),
    asciiBytes('"'),
    asciiBytes(',-1000,'),
    SJIS.現,
    SJIS.金
  );

  // データ行2: 2026/7/8,給与,300000,銀行 相当（ここは日本語を増やさずASCII代替は避け、内容は簡略化）
  // 収入行として「内容」列に既存アンカー文字を再利用する
  const row2 = concatBytes(
    asciiBytes('2026/7/8,'),
    SJIS.内,
    SJIS.容,
    asciiBytes(',300000,'),
    SJIS.現,
    SJIS.金
  );

  const csvBytes = concatBytes(
    header,
    asciiBytes('\n'),
    row1,
    asciiBytes('\n'),
    row2,
    asciiBytes('\n')
  );

  const decoded = decodeCsvBytes(csvBytes);
  assert.equal(decoded.encoding, 'shift_jis');
  assert.match(decoded.text, /日付/);
  assert.match(decoded.text, /内容/);
  assert.match(decoded.text, /金額\(税込\)/);
  assert.match(decoded.text, /保有金融機関/);

  const parsed = await parseCSV(decoded.text);
  assert.equal(parsed.format, 'moneyforward');
  assert.ok(parsed.transactions.length >= 2);
});
