import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMoneyforwardCSV, isMoneyforwardFormat } from './moneyforwardParser.ts';

const HEADER = '日付,内容,金額(税込),保有金融機関,大項目,中項目,メモ,振替,ID';

test('マイナス金額は支出として、プラス金額は収入として区別される', () => {
  const csv = [
    HEADER,
    '2026/7/7,コンビニ,-1000,現金,食費,食料品,,,1',
    '2026/7/7,給与,300000,銀行,収入,給与,,,2',
  ].join('\n');

  const result = parseMoneyforwardCSV(csv);
  assert.equal(result.length, 2);

  const expense = result[0];
  assert.equal(expense.type, 'expense');
  assert.equal(expense.amount, 1000);

  const income = result[1];
  assert.equal(income.type, 'income');
  assert.equal(income.amount, 300000);
});

test('カンマ入りクオート値があっても列がズレない', () => {
  const csv = [
    HEADER,
    '2026/7/7,"イオン,モール店",-2500,現金,食費,食料品,備考,,3',
  ].join('\n');

  const result = parseMoneyforwardCSV(csv);
  assert.equal(result.length, 1);
  assert.equal(result[0].content, 'イオン,モール店');
  assert.equal(result[0].amount, 2500);
  assert.equal(result[0].bank, '現金');
});

test('2026/7/7 と 2026-07-07 の両形式が 2026-07-07 に正規化される', () => {
  const csv = [
    HEADER,
    '2026/7/7,テスト1,-100,現金,,,,,1',
    '2026-07-07,テスト2,-100,現金,,,,,2',
  ].join('\n');

  const result = parseMoneyforwardCSV(csv);
  assert.equal(result[0].date, '2026-07-07');
  assert.equal(result[1].date, '2026-07-07');
});

test('空CSVはthrowする', () => {
  assert.throws(() => parseMoneyforwardCSV(''));
  assert.throws(() => parseMoneyforwardCSV('日付のみの行'));
});

test('必須カラムが欠落しているとthrowする', () => {
  const csv = ['日付,内容', '2026/7/7,テスト'].join('\n');
  assert.throws(() => parseMoneyforwardCSV(csv));
});

test('isMoneyforwardFormatはヘッダーで判定できる', () => {
  assert.equal(isMoneyforwardFormat(HEADER + '\n'), true);
  assert.equal(isMoneyforwardFormat('日付,支払,品目,お店\n'), false);
});
