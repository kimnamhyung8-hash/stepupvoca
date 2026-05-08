// src/services/ai/dispatcher.ts
// 하이브리드 AI 디스패처: 레벨 기반 엔진 라우팅 + 자동 폴백

import { OnDeviceEngine } from './onDeviceEngine';
import { CloudEngine } from './cloudEngine';
import type { AIResponse } from './types';

class AIDispatcher {
  private onDevice = new OnDeviceEngine();
  private cloud = new CloudEngine();

  /** 온디바이스 엔진 초기화 시도 (실패해도 클라우드로 폴백 가능) */
  async init(): Promise<void> {
    // 이미 준비되었다면 다시 초기화할 필요 없음
    if (this.onDevice.isReady()) return;

    try {
      await this.onDevice.init();
      console.log('[Dispatcher] 온디바이스 엔진 활성화');
    } catch (e) {
      console.warn('[Dispatcher] 온디바이스 사용 불가, 클라우드 모드로 동작:', e);
    }
  }

  get isOnDeviceReady(): boolean {
    return this.onDevice.isReady();
  }

  /**
   * AI 응답 생성
   * - 온디바이스 엔진이 준비되어 있으면 먼저 시도
   * - 실패 시 자동으로 클라우드 폴백
   */
  async generate(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    // 1. 온디바이스 엔진이 준비되면 먼저 시도
    if (this.onDevice.isReady()) {
      try {
        console.log('[Dispatcher] 온디바이스 추론 시도...');
        const result = await this.onDevice.generateResponse(prompt, systemInstruction);
        console.log('[Dispatcher] ✅ 온디바이스 응답 성공');
        return result;
      } catch (e) {
        console.warn('[Dispatcher] 온디바이스 실패, 클라우드로 폴백:', e);
      }
    }

    // 2. 클라우드 폴백
    console.log('[Dispatcher] 클라우드 추론...');
    return this.cloud.generateResponse(prompt, systemInstruction);
  }
}

// 싱글톤 인스턴스
export const aiDispatcher = new AIDispatcher();
