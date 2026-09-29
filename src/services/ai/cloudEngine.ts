// src/services/ai/cloudEngine.ts
// 기존 Gemini Cloud API를 래핑하는 클라우드 엔진
// 개인 키가 있으면 직접 호출(실패 시 프록시 폴백), 없으면 안전한 백엔드 프록시를 경유하여 키 유출을 원천 방지

import { fetchGemini, decryptApiKey, LIGHTWEIGHT_MODEL, HIGH_PERFORMANCE_MODEL } from '../../apiUtils';
import type { AIEngine, AIResponse, AIEngineType } from './types';

// 환경 변수 또는 프록시 기본 엔드포인트
export const DEFAULT_AI_PROXY_URL = (import.meta as any).env?.VITE_AI_PROXY_URL || 'https://vocaquest-ai-proxy.kimnamhyung8.workers.dev';

export class CloudEngine implements AIEngine {
  readonly type: AIEngineType = 'CLOUD';

  isReady(): boolean {
    return true;
  }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    const rawUserKey = localStorage.getItem('vq_gemini_key');
    const isPremium = localStorage.getItem('vq_premium') === 'true';
    const proxyUrl = localStorage.getItem('vq_ai_proxy_url') || DEFAULT_AI_PROXY_URL;

    // 1. 유저가 설정에서 직접 입력한 개인 API 키가 있는 경우 우선 시도
    if (rawUserKey) {
      const userKey = decryptApiKey(rawUserKey);
      if (userKey && userKey.trim() !== '') {
        try {
          const model = isPremium ? HIGH_PERFORMANCE_MODEL : LIGHTWEIGHT_MODEL;
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userKey}`;

          const body: any = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json',
            },
          };

          if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
          }

          const res = await fetchGemini(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return { content: text, engine: 'CLOUD' };
          }
          console.warn(`[CloudEngine] 개인 키 직접 호출 실패(${res.status}). 보안 프록시로 폴백합니다.`);
        } catch (directErr) {
          console.warn('[CloudEngine] 개인 키 오류, 프록시로 폴백:', directErr);
        }
      }
    }

    // 2. 보안 백엔드 프록시 경유 (기본 모드 및 폴백)
    if (proxyUrl && proxyUrl.trim() !== '') {
      console.log('[CloudEngine] 보안 프록시를 통해 AI 호출 중...');
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: 'gemini-3.5-flash-lite',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `PROXY_API_ERROR_${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { content: text, engine: 'CLOUD' };
    }

    // 3. 키도 없고 프록시도 없는 경우
    throw new Error('NO_API_KEY');
  }
}

