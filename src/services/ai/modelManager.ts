// src/services/ai/modelManager.ts
// @capgo/capacitor-llm 기반 온디바이스 AI 모델 관리

import { Capacitor } from '@capacitor/core';
import { CapgoLLM } from '@capgo/capacitor-llm';
import { Filesystem, Directory } from '@capacitor/filesystem';

// 모델 다운로드 URL (HuggingFace - Gemma3 270M, 경량 모델)
const MODEL_URL = 'https://firebasestorage.googleapis.com/v0/b/vocaquest-7ebea.firebasestorage.app/o/gemma-3-270m-it-int8.task?alt=media&token=70fd18e2-6b2e-474f-a57e-7e9698b5e79c';
const MODEL_FILENAME = 'gemma-3-270m-it-int8.task';
// 안드로이드용 추가 설정 파일 (.litertlm) URL (iOS는 사용 안 함)
const COMPANION_URL = '여기에_litertlm_파일의_다운로드_URL을_붙여넣으세요';

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

    // 실제 파일이 Documents 폴더에 존재하는지 '무조건' 먼저 확인합니다.
    try {
      const stat = await Filesystem.stat({
        path: MODEL_FILENAME,
        directory: Directory.Documents
      });

      // 용량 체크: 1MB(1048576 bytes) 이하인 경우 제대로 된 모델 파일이 아님!
      // (예: 허깅페이스 권한 에러로 인해 받아진 140 byte짜리 HTML 파일)
      if (stat.size < 1048576) {
        throw new Error('FILE_TOO_SMALL');
      }

      // 파일이 존재하면 경로 업데이트
      const uri = await Filesystem.getUri({
        path: MODEL_FILENAME,
        directory: Directory.Documents
      });

      // iOS의 경우 'file://' 접두사가 필요할 수 있음
      const finalPath = Capacitor.getPlatform() === 'ios' ? uri.uri.replace('file://', '') : uri.uri;
      this._modelPath = finalPath;
      localStorage.setItem('vq_llm_model_path', finalPath);

      return true;
    } catch (err) {
      console.log('[ModelManager] 모델 파일이 없거나 유효하지 않음:', err);
      // 파일이 없으면 저장된 경로 정보 확실하게 삭제 (이전 앱 찌꺼기 방지)
      localStorage.removeItem('vq_llm_model_path');
      this._modelPath = null;
      try {
        await Filesystem.deleteFile({ path: MODEL_FILENAME, directory: Directory.Documents });
      } catch (e) { }
      return false;
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
        ...(Capacitor.getPlatform() === 'android' ? { companionUrl: COMPANION_URL } : {})
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
    } catch (err: any) {
      console.error('[ModelManager] 모델 로드 실패:', err);
      // 로드 실패 시 만약 파일 없음 오류라면 기존 경로가 꼬인 것이므로 삭제
      if (err?.message?.includes('NOT_FOUND') || err?.message?.includes('No such file')) {
        localStorage.removeItem('vq_llm_model_path');
        this._modelPath = null;
        try {
          await Filesystem.deleteFile({
            path: MODEL_FILENAME,
            directory: Directory.Documents
          });
        } catch (e) {
          console.log('[ModelManager] 찌꺼기 파일 삭제 실패:', e);
        }
      }
      throw err;
    }
  }
}
