// src/services/ai/modelManager.ts
// @capgo/capacitor-llm 기반 온디바이스 AI 모델 관리

import { Capacitor } from '@capacitor/core';
import { CapgoLLM } from '@capgo/capacitor-llm';

// 모델 다운로드 URL (HuggingFace - Gemma3 270M, 경량 모델)
const MODEL_URL = 'https://huggingface.co/litert-community/gemma-3-270m-it/resolve/main/gemma-3-270m-it-int4.task';
const MODEL_FILENAME = 'gemma-3-270m-it-int4.task';

export class ModelManager {
  private static instance: ModelManager;
  private _isDownloading = false;
  private _progress = 0;
  private _modelPath: string | null = null;

  private constructor() {}

  static getInstance(): ModelManager {
    if (!ModelManager.instance) ModelManager.instance = new ModelManager();
    return ModelManager.instance;
  }

  get isDownloading() { return this._isDownloading; }
  get progress() { return this._progress; }
  get modelPath() { return this._modelPath; }

  /** 웹에서는 온디바이스 AI 사용 불가 */
  get isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  async isModelPresent(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      const { readiness } = await CapgoLLM.getReadiness();
      return readiness === 'ready' || readiness === 'available';
    } catch {
      return false;
    }
  }

  async downloadModel(onProgress?: (percent: number) => void): Promise<void> {
    if (this._isDownloading || !this.isSupported) return;
    this._isDownloading = true;
    this._progress = 0;

    try {
      // 다운로드 진행률 리스너
      const progressListener = await CapgoLLM.addListener('downloadProgress', (event: any) => {
        this._progress = Math.round(event.progress);
        onProgress?.(this._progress);
      });

      console.log('[ModelManager] 모델 다운로드 시작...');

      const result = await CapgoLLM.downloadModel({
        url: MODEL_URL,
        filename: MODEL_FILENAME,
      });

      this._modelPath = result.path;
      this._progress = 100;
      onProgress?.(100);

      // 리스너 정리
      await progressListener.remove();

      console.log('[ModelManager] ✅ 모델 다운로드 완료:', result.path);
    } catch (err) {
      console.error('[ModelManager] 다운로드 실패:', err);
      throw err;
    } finally {
      this._isDownloading = false;
    }
  }

  async loadModel(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios') {
        // iOS: Apple Intelligence 시스템 모델 먼저 시도
        try {
          await CapgoLLM.setModel({ path: 'Apple Intelligence' });
          console.log('[ModelManager] ✅ Apple Intelligence 모델 로드 성공');
          return;
        } catch {
          console.log('[ModelManager] Apple Intelligence 불가, 다운로드 모델 시도...');
        }
      }

      // 다운로드된 모델 경로로 로드
      if (this._modelPath) {
        await CapgoLLM.setModel({
          path: this._modelPath,
          maxTokens: 512,
          topk: 40,
          temperature: 0.8,
        });
        console.log('[ModelManager] ✅ 다운로드 모델 로드 성공');
      } else {
        throw new Error('MODEL_NOT_DOWNLOADED');
      }
    } catch (err) {
      console.error('[ModelManager] 모델 로드 실패:', err);
      throw err;
    }
  }
}
