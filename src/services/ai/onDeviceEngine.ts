// src/services/ai/onDeviceEngine.ts
// MediaPipe Gemma 2B 기반 온디바이스 추론 엔진

import { LlmInference, FilesetResolver } from '@mediapipe/tasks-genai';
import { Capacitor } from '@capacitor/core';
import { ModelManager } from './modelManager';
import type { AIEngine, AIResponse, AIEngineType } from './types';

export class OnDeviceEngine implements AIEngine {
  readonly type: AIEngineType = 'ON_DEVICE';
  private llm: LlmInference | null = null;
  private _isInitializing = false;
  private _isReady = false;

  isReady(): boolean { return this._isReady; }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    if (!this.llm) throw new Error('ON_DEVICE_NOT_READY');

    const fullPrompt = systemInstruction
      ? `${systemInstruction}\n\nUser: ${prompt}\nAssistant:`
      : prompt;

    const text = await this.llm.generateResponse(fullPrompt);
    return { content: text, engine: 'ON_DEVICE' };
  }

  async init(): Promise<void> {
    if (this._isInitializing || this._isReady) return;
    this._isInitializing = true;

    try {
      const manager = ModelManager.getInstance();
      const exists = await manager.isModelPresent();
      if (!exists) {
        console.warn('[OnDevice] 모델 파일이 없습니다. 다운로드가 필요합니다.');
        throw new Error('MODEL_NOT_DOWNLOADED');
      }

      console.log('[OnDevice] WASM fileset 로딩...');
      const wasmFileset = await FilesetResolver.forGenAiTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
      );

      console.log('[OnDevice] 모델 로딩 (로컬 URL)...');
      const uri = await manager.getModelUri();
      const localUrl = Capacitor.convertFileSrc(uri);

      this.llm = await LlmInference.createFromOptions(wasmFileset, {
        baseOptions: { modelAssetPath: localUrl },
        maxTokens: 512,
        topK: 40,
        temperature: 0.8,
        randomSeed: Math.floor(Math.random() * 1000),
      });

      this._isReady = true;
      console.log('[OnDevice] ✅ 엔진 초기화 성공!');
    } catch (err) {
      console.error('[OnDevice] ❌ 초기화 실패:', err);
      this.llm = null;
      this._isReady = false;
      throw err;
    } finally {
      this._isInitializing = false;
    }
  }
}
