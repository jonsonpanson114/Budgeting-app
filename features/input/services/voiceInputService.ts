import * as Speech from 'expo-speech-recognition';

export interface VoiceInputResult {
  text: string;
  isFinal: boolean;
  error?: string;
}

/**
 * 音声入力サービス
 */
export class VoiceInputService {
  private recognition: any;
  private onResult?: (result: VoiceInputResult) => void;

  constructor() {
    this.setupRecognition();
  }

  private setupRecognition(): void {
    // 音声認識の設定
    this.recognition = new Speech.Recognition();
    this.recognition.onSpeechResults = (event: any) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0].map((r: any) => r.transcript).join('');
        this.onResult?.({
          text: transcript,
          isFinal: false,
        });
      }
    };

    this.recognition.onSpeechEnd = () => {
      this.onResult?.({
        text: this.recognition._lastResults?.[0]?.map((r: any) => r.transcript).join('') || '',
        isFinal: true,
      });
    };

    this.recognition.onError = (event: any) => {
      let errorMessage = '音声認識エラー';
      if (event.error === 'no-speech') {
        errorMessage = '音声が検出されませんでした';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'マイクへのアクセスに失敗しました';
      } else if (event.error === 'network') {
        errorMessage = 'ネットワークエラーが発生しました';
      }

      this.onResult?.({
        text: '',
        isFinal: false,
        error: errorMessage,
      });
    };
  }

  /**
   * 音声認識を開始する
   */
  async startListening(): Promise<void> {
    try {
      await this.recognition.start();
    } catch (error: any) {
      console.error('Speech recognition error:', error);
      this.onResult?.({
        text: '',
        isFinal: false,
        error: '音声認識の開始に失敗しました',
      });
    }
  }

  /**
   * 音声認識を停止する
   */
  stopListening(): void {
    try {
      this.recognition.stop();
    } catch (error: any) {
      console.error('Speech recognition stop error:', error);
    }
  }

  /**
   * 結果コールバックを設定する
   */
  setOnResult(callback: (result: VoiceInputResult) => void): void {
    this.onResult = callback;
  }

  /**
   * 設定を取得
   */
  getSettings(): {
    locale: string;
    supportsOnDevice: boolean;
  } {
    return {
      locale: this.recognition.locale || 'ja-JP',
      supportsOnDevice: this.recognition.isRecognitionAvailable?.() || false,
    };
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.stopListening();
    this.recognition.removeAllListeners?.();
    this.onResult = undefined;
  }
}

/**
 * 音声入力サービスのシングルトンインスタンス
 */
let voiceInputServiceInstance: VoiceInputService | null = null;

export function getVoiceInputService(): VoiceInputService {
  if (!voiceInputServiceInstance) {
    voiceInputServiceInstance = new VoiceInputService();
  }
  return voiceInputServiceInstance;
}

/**
 * サービスをリセット（テスト用）
 */
export function resetVoiceInputService(): void {
  if (voiceInputServiceInstance) {
    voiceInputServiceInstance.destroy();
    voiceInputServiceInstance = null;
  }
}
