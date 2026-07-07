import test from 'node:test';
import assert from 'node:assert/strict';
import { parseZaimCSV, isZaimFormat } from './zaimParser.ts';

const HEADER = '日付,方法,カテゴリ,カテゴリの内訳,支払,支払元,入金先,品目,メモ,お店,通貨,収入,支出,振替,残高調整,PLACE,通貨変換前の金額';

test('支出列と入金列で収支が区別される', () => {
  const csv = [
    HEADER,
    '2026/7/7,現金,食費,食料品,現金,,,パン,,ベーカリー,JPY,,500,,,,0',
    '2026/7/7,銀行,収入,給与,銀行,,,,,,JPY,300000,,,,,0',
  ].join('\n');

  const result = parseZaimCSV(csv);
  assert.equal(result.length, 2);
  assert.equal(result[0].expense, 500);
  assert.equal(result[0].income, 0);
  assert.equal(result[1].income, 300000);
  assert.equal(result[1].expense, 0);
});

test('カンマ入りクオート値があっても列がズレない', () => {
  const csv = [
    HEADER,
    '2026/7/7,現金,食費,食料品,現金,,,"イオン,モール店",備考,イオン,JPY,,1500,,,,0',
  ].join('\n');

  const result = parseZaimCSV(csv);
  assert.equal(result.length, 1);
  assert.equal(result[0].item, 'イオン,モール店');
  assert.equal(result[0].expense, 1500);
  assert.equal(result[0].shop, 'イオン');
});

test('2026/7/7 と 2026-07-07 の両形式が 2026-07-07 に正規化される', () => {
  const csv = [
    HEADER,
    '2026/7/7,現金,,,現金,,,,,,,,100,,,,0',
    '2026-07-07,現金,,,現金,,,,,,,,100,,,,0',
  ].join('\n');

  const result = parseZaimCSV(csv);
  assert.equal(result[0].date, '2026-07-07');
  assert.equal(result[1].date, '2026-07-07');
});

test('空CSVはthrowする', () => {
  assert.throws(() => parseZaimCSV(''));
  assert.throws(() => parseZaimCSV('日付のみの行'));
});

test('必須カラムが欠落しているとthrowする', () => {
  const csv = ['日付,方法', '2026/7/7,現金'].join('\n');
  assert.throws(() => parseZaimCSV(csv));
});

test('isZaimFormatはヘッダーで判定できる', () => {
  assert.equal(isZaimFormat(HEADER + '\n'), true);
  assert.equal(isZaimFormat('日付,内容,金額(税込),保有金融機関\n'), false);
});
