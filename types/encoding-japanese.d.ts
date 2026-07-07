declare module 'encoding-japanese' {
  export type EncodingName =
    | 'UTF32'
    | 'UTF16'
    | 'UTF16BE'
    | 'UTF16LE'
    | 'BINARY'
    | 'ASCII'
    | 'JIS'
    | 'UTF8'
    | 'EUCJP'
    | 'SJIS'
    | 'UNICODE';

  export interface ConvertOptions {
    to: EncodingName;
    from?: EncodingName | 'AUTO';
    type?: 'string' | 'arraybuffer' | 'array';
    bom?: string | boolean;
    fallback?: string;
  }

  export type EncodingJapaneseInput = number[] | Uint8Array | string;

  interface EncodingJapaneseStatic {
    version: string;
    detect(
      data: EncodingJapaneseInput,
      encodings?: EncodingName | EncodingName[] | string
    ): EncodingName | false;
    convert(data: EncodingJapaneseInput, to: ConvertOptions): string | number[] | Uint8Array;
    convert(
      data: EncodingJapaneseInput,
      to: EncodingName,
      from?: EncodingName | 'AUTO'
    ): number[] | Uint8Array;
    codeToString(data: number[] | Uint8Array): string;
    stringToCode(str: string): number[];
    urlEncode(data: EncodingJapaneseInput): string;
    urlDecode(str: string): number[];
    base64Encode(data: EncodingJapaneseInput): string;
    base64Decode(str: string): number[];
  }

  const Encoding: EncodingJapaneseStatic;
  export default Encoding;
}
