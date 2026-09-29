// src/services/ai/cloudEngine.ts
// 기존 Gemini Cloud API를 래핑하는 클라우드 엔진
// 개인 키가 있으면 직접 호출, 없으면 안전한 백엔드 프록시를 경유하여 키 유출을 원천 방지

import { fetchGemini, getActiveApiKey, LIGHTWEIGHT_MODEL, HIGH_PERFORMANCE_MODEL } from '../../apiUtils';
import type { AIEngine, AIResponse, AIEngineType } from './types';

// 환경 변수 또는 프록시 기본 엔드포인트
export const DEFAULT_AI_PROXY_URL = (import.meta as any).env?.VITE_AI_PROXY_URL || 'https://vocaquest-ai-proxy.kimnamhyung8.workers.dev';

export class CloudEngine implements AIEngine {
  readonly type: AIEngineType = 'CLOUD';

  isReady(): boolean {
    return true;
  }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    const userSavedKey = localStorage.getItem('vq_gemini_key');
    const isPremium = localStorage.getItem('vq_premium') === 'true';
    const dailyCount = parseInt(localStorage.getItem('vq_ai_daily_count') || '0');
    const activeKey = getActiveApiKey(userSavedKey, isPremium, dailyCount);

    // 1. 유저의 개인 API 키 또는 서버 키가 직접 존재하는 경우: 직접 호출
    if (activeKey) {
      const model = isPremium ? HIGH_PERFORMANCE_MODEL : LIGHTWEIGHT_MODEL;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

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

      if (!res.ok) {
        throw new Error(`CLOUD_API_ERROR_${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { content: text, engine: 'CLOUD' };
    }

    // 2. 클라이언트에 키가 없는 경우: 보안 백엔드 프록시 경유
    const proxyUrl = localStorage.getItem('vq_ai_proxy_url') || DEFAULT_AI_PROXY_URL;
    if (proxyUrl && proxyUrl.trim() !== '') {
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: isPremium ? HIGH_PERFORMANCE_MODEL : LIGHTWEIGHT_MODEL,
        }),
      });

      if (!res.ok) {
        throw new Error(`PROXY_API_ERROR_${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { content: text, engine: 'CLOUD' };
    }

    // 3. 키도 없고 프록시도 없는 경우
    throw new Error('NO_API_KEY');
  }
}

