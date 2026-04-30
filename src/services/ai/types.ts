// src/services/ai/types.ts
// 하이브리드 AI 시스템 공통 타입 정의

export type AIEngineType = 'ON_DEVICE' | 'CLOUD';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  engine: AIEngineType;
}

export interface AIEngine {
  readonly type: AIEngineType;
  generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse>;
  isReady(): boolean;
  init?(): Promise<void>;
}
