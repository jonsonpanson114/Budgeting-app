import Encoding from 'encoding-japanese';

export type DetectedEncoding = 'shift_jis' | 'utf-8';

export interface DecodeCsvBytesResult {
  text: string;
  encoding: DetectedEncoding;
}

const UTF8_BOM = [0xef, 0xbb, 0xbf];

function hasUtf8Bom(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 3 &&
    bytes[0] === UTF8_BOM[0] &&
    bytes[1] === UTF8_BOM[1] &&
    bytes[2] === UTF8_BOM[2]
  );
}

/**
 * 生バイト列が完全に妥当な UTF-8 シーケンスかどうかを判定する。
 * 1バイトでも不正なシーケンスがあれば false を返す。
 */
function isValidUtf8(bytes: Uint8Array): boolean {
  let i = 0;
  const len = bytes.length;

  while (i < len) {
    const byte1 = bytes[i];

    if (byte1 <= 0x7f) {
      // ASCII (0xxxxxxx)
      i += 1;
      continue;
    }

    let continuationBytes = 0;
    let codePoint = 0;
    let minCodePoint = 0;

    if ((byte1 & 0xe0) === 0xc0) {
      // 110xxxxx
      continuationBytes = 1;
      codePoint = byte1 & 0x1f;
      minCodePoint = 0x80;
    } else if ((byte1 & 0xf0) === 0xe0) {
      // 1110xxxx
      continuationBytes = 2;
      codePoint = byte1 & 0x0f;
      minCodePoint = 0x800;
    } else if ((byte1 & 0xf8) === 0xf0) {
      // 11110xxx
      continuationBytes = 3;
      codePoint = byte1 & 0x07;
      minCodePoint = 0x10000;
    } else {
      // 不正な先頭バイト（10xxxxxx や 11111xxx など）
      return false;
    }

    if (i + continuationBytes > len - 1) {
      // 続きバイトが足りない
      return false;
    }

    for (let j = 1; j <= continuationBytes; j++) {
      const cb = bytes[i + j];
      if ((cb & 0xc0) !== 0x80) {
        return false;
      }
      codePoint = (codePoint << 6) | (cb & 0x3f);
    }

    // 過長エンコーディング（オーバーロングエンコード）の排除
    if (codePoint < minCodePoint) {
      return false;
    }

    // サロゲート範囲・範囲外コードポイントの排除
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      return false;
    }
    if (codePoint > 0x10ffff) {
      return false;
    }

    i += continuationBytes + 1;
  }

  return true;
}

function decodeUtf8Bytes(bytes: Uint8Array): string {
  // encoding-japanese は UTF-8 <-> UNICODE(内部表現) の変換にも対応している。
  // Hermes 依存の TextDecoder は使わず、web/ネイティブ共通のJS実装で統一する。
  const result = Encoding.convert(Array.from(bytes), {
    to: 'UNICODE',
    from: 'UTF8',
    type: 'string',
  });
  return typeof result === 'string' ? result : '';
}

function decodeShiftJisBytes(bytes: Uint8Array): string {
  const result = Encoding.convert(Array.from(bytes), {
    to: 'UNICODE',
    from: 'SJIS',
    type: 'string',
  });
  return typeof result === 'string' ? result : '';
}

/**
 * 生バイト列から文字コードを判定し、デコードしたテキストと判定結果を返す。
 *
 * 判定順:
 *   1. UTF-8 BOM (EF BB BF) がある → utf-8
 *   2. バイト列全体が妥当な UTF-8 シーケンス → utf-8
 *   3. 上記以外（不正なシーケンスを含む） → shift_jis
 *      （マネーフォワードME/ZaimのCSV出力は UTF-8 か Shift_JIS(CP932) の
 *        二択という前提のもとでの十分条件として扱う）
 *
 * 空・不正なバイト列でも例外を投げず、utf-8 として空文字列にフォールバックする。
 */
export function decodeCsvBytes(bytes: Uint8Array): DecodeCsvBytesResult {
  try {
    if (!bytes || bytes.length === 0) {
      return { text: '', encoding: 'utf-8' };
    }

    if (hasUtf8Bom(bytes)) {
      const withoutBom = bytes.subarray(3);
      return { text: decodeUtf8Bytes(withoutBom), encoding: 'utf-8' };
    }

    if (isValidUtf8(bytes)) {
      return { text: decodeUtf8Bytes(bytes), encoding: 'utf-8' };
    }

    return { text: decodeShiftJisBytes(bytes), encoding: 'shift_jis' };
  } catch {
    // 判定・デコードのいずれで失敗しても例外は投げない
    return { text: '', encoding: 'utf-8' };
  }
}
