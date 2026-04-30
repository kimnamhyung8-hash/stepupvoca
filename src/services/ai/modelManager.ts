// src/services/ai/modelManager.ts
// 온디바이스 AI 모델 파일 다운로드 및 관리

import { Filesystem, Directory } from '@capacitor/filesystem';

const MODEL_NAME = 'gemma-2b-it-gpu-int4.bin';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/llm_inference/gemma-2b-it-gpu-int4.bin';

export class ModelManager {
  private static instance: ModelManager;
  private _isDownloading = false;
  private _progress = 0;

  private constructor() {}

  static getInstance(): ModelManager {
    if (!ModelManager.instance) ModelManager.instance = new ModelManager();
    return ModelManager.instance;
  }

  get isDownloading() { return this._isDownloading; }
  get progress() { return this._progress; }

  async isModelPresent(): Promise<boolean> {
    try {
      await Filesystem.stat({ path: `models/${MODEL_NAME}`, directory: Directory.Data });
      return true;
    } catch {
      return false;
    }
  }

  async getModelUri(): Promise<string> {
    const { uri } = await Filesystem.getUri({
      path: `models/${MODEL_NAME}`,
      directory: Directory.Data
    });
    return uri;
  }

  async downloadModel(onProgress?: (percent: number) => void): Promise<void> {
    if (this._isDownloading) return;
    this._isDownloading = true;
    this._progress = 0;

    try {
      // 모델 저장 디렉토리 생성
      await Filesystem.mkdir({ path: 'models', directory: Directory.Data, recursive: true }).catch(() => {});

      console.log('[ModelManager] 모델 다운로드 시작...');

      // Capacitor Filesystem.downloadFile: 네이티브 스트리밍으로 메모리 부하 없음
      await Filesystem.downloadFile({
        path: `models/${MODEL_NAME}`,
        url: MODEL_URL,
        directory: Directory.Data,
        progress: true,
      });

      this._progress = 100;
      onProgress?.(100);
      console.log('[ModelManager] 모델 다운로드 완료!');
    } catch (err) {
      console.error('[ModelManager] 다운로드 실패:', err);
      throw err;
    } finally {
      this._isDownloading = false;
    }
  }

  async deleteModel(): Promise<void> {
    try {
      await Filesystem.deleteFile({ path: `models/${MODEL_NAME}`, directory: Directory.Data });
      console.log('[ModelManager] 모델 삭제 완료');
    } catch { /* 파일 없으면 무시 */ }
  }
}
