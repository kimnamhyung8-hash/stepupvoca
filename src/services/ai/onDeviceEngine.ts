// src/services/ai/onDeviceEngine.ts
// @capgo/capacitor-llm 기반 온디바이스 추론 엔진

import { Capacitor } from '@capacitor/core';
import { CapgoLLM } from '@capgo/capacitor-llm';
import { ModelManager } from './modelManager';
import type { AIEngine, AIResponse, AIEngineType } from './types';

export class OnDeviceEngine implements AIEngine {
  readonly type: AIEngineType = 'ON_DEVICE';
  private _isReady = false;
  private _isInitializing = false;

  isReady(): boolean { return this._isReady; }

  async init(): Promise<void> {
    if (this._isInitializing || this._isReady) return;
    if (!Capacitor.isNativePlatform()) {
      console.log('[OnDevice] 웹 환경에서는 온디바이스 AI를 사용할 수 없습니다.');
      return;
    }

    this._isInitializing = true;

    try {
      const manager = ModelManager.getInstance();
      await manager.loadModel();

      const { readiness } = await CapgoLLM.getReadiness();
      console.log('[OnDevice] 모델 준비 상태:', readiness);

      if (readiness === 'ready' || readiness === 'available') {
        this._isReady = true;
        console.log('[OnDevice] ✅ 엔진 초기화 성공!');
      } else {
        throw new Error(`MODEL_NOT_READY: ${readiness}`);
      }
    } catch (err) {
      console.error('[OnDevice] ❌ 초기화 실패:', err);
      this._isReady = false;
      throw err;
    } finally {
      this._isInitializing = false;
    }
  }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    if (!this._isReady) throw new Error('ON_DEVICE_NOT_READY');

    // 새 채팅 세션 생성
    const { id: chatId } = await CapgoLLM.createChat();

    // 응답을 수집하기 위한 Promise
    const response = await new Promise<string>((resolve, reject) => {
      let fullText = '';
      let textListener: { remove: () => Promise<void> } | null = null;
      let finishListener: { remove: () => Promise<void> } | null = null;

      // 타임아웃 (30초)
      const timeout = setTimeout(async () => {
        if (textListener) await textListener.remove();
        if (finishListener) await finishListener.remove();
        reject(new Error('ON_DEVICE_TIMEOUT'));
      }, 30000);

      // 텍스트 스트리밍 리스너
      CapgoLLM.addListener('textFromAi', (event: any) => {
        fullText += event.text;
      }).then((l: any) => { textListener = l; });

      // 완료 리스너
      CapgoLLM.addListener('aiFinished', async (event: any) => {
        if (event.chatId === chatId) {
          clearTimeout(timeout);
          if (textListener) await textListener.remove();
          if (finishListener) await finishListener.remove();
          resolve(fullText);
        }
      }).then((l: any) => { finishListener = l; });

      // 메시지 전송 (시스템 인스트럭션 포함)
      const fullPrompt = systemInstruction
        ? `${systemInstruction}\n\nUser: ${prompt}\nAssistant:`
        : prompt;

      CapgoLLM.sendMessage({ chatId, message: fullPrompt }).catch(reject);
    });

    return { content: response, engine: 'ON_DEVICE' };
  }
}
