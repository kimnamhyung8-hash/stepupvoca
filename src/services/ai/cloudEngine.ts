// src/services/ai/cloudEngine.ts
// 기존 Gemini Cloud API를 래핑하는 클라우드 엔진
// 기존 apiUtils.ts의 fetchGemini, getActiveApiKey 등을 그대로 활용

import { fetchGemini, getActiveApiKey, LIGHTWEIGHT_MODEL, HIGH_PERFORMANCE_MODEL } from '../../apiUtils';
import type { AIEngine, AIResponse, AIEngineType } from './types';

export class CloudEngine implements AIEngine {
  readonly type: AIEngineType = 'CLOUD';

  isReady(): boolean {
    // 클라우드는 API 키만 있으면 항상 준비 상태
    return true;
  }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    const userSavedKey = localStorage.getItem('vq_gemini_key');
    const isPremium = localStorage.getItem('vq_premium') === 'true';
    const dailyCount = parseInt(localStorage.getItem('vq_ai_daily_count') || '0');
    const activeKey = getActiveApiKey(userSavedKey, isPremium, dailyCount);

    if (!activeKey) {
      throw new Error('NO_API_KEY');
    }

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
}
