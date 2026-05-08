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

  private constructor() {
    this._modelPath = localStorage.getItem('vq_llm_model_path');
  }

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

  async isModelDownloaded(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      const { readiness } = await CapgoLLM.getReadiness();
      return (
        readiness === 'ready' || 
        readiness === 'available' || 
        !!this._modelPath || 
        !!localStorage.getItem('vq_llm_model_path')
      );
    } catch {
      return !!this._modelPath || !!localStorage.getItem('vq_llm_model_path');
    }
  }

  async downloadModel(onProgress?: (percent: number) => void): Promise<void> {
    if (this._isDownloading || !this.isSupported) return;
    this._isDownloading = true;
    this._progress = 0;

    try {
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
      localStorage.setItem('vq_llm_model_path', result.path);
      this._progress = 100;
      onProgress?.(100);

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
      const modelPath = this._modelPath || localStorage.getItem('vq_llm_model_path');

      if (modelPath) {
        await CapgoLLM.setModel({
          path: modelPath,
          maxTokens: 512,
          topk: 40,
          temperature: 0.8,
        });
        this._modelPath = modelPath;
        console.log('[ModelManager] ✅ 온디바이스 모델 로드 성공:', modelPath);
      } else {
        throw new Error('MODEL_NOT_DOWNLOADED');
      }
    } catch (err) {
      console.error('[ModelManager] 모델 로드 실패:', err);
      throw err;
    }
  }
}
