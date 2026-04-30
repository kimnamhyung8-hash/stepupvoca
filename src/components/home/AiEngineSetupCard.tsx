// src/components/home/AiEngineSetupCard.tsx
// 홈화면 온디바이스 AI 엔진 다운로드/상태 카드

import React, { useState, useEffect } from 'react';
import { Cpu, Download, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { ModelManager } from '../../services/ai/modelManager';
import { aiDispatcher } from '../../services/ai/dispatcher';

interface Props {
  lang: string;
}

export const AiEngineSetupCard: React.FC<Props> = ({ lang }) => {
  const [status, setStatus] = useState<'checking' | 'not_downloaded' | 'downloading' | 'ready' | 'error'>('checking');
  const [progress, setProgress] = useState(0);

  // 웹에서는 온디바이스 AI가 작동하지 않으므로 카드를 숨김
  if (Capacitor.getPlatform() === 'web') return null;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const manager = ModelManager.getInstance();
      const exists = await manager.isModelPresent();
      if (exists) {
        // 모델이 있으면 디스패처 초기화 시도
        await aiDispatcher.init();
        setStatus(aiDispatcher.isOnDeviceReady ? 'ready' : 'not_downloaded');
      } else {
        setStatus('not_downloaded');
      }
    } catch {
      setStatus('not_downloaded');
    }
  };

  const handleDownload = async () => {
    setStatus('downloading');
    setProgress(0);
    try {
      await ModelManager.getInstance().downloadModel((p) => setProgress(p));
      await aiDispatcher.init();
      setStatus('ready');
    } catch (e) {
      console.error('[AiSetup] 다운로드 실패:', e);
      setStatus('error');
    }
  };

  const handleDelete = async () => {
    await ModelManager.getInstance().deleteModel();
    setStatus('not_downloaded');
  };

  const isKo = lang === 'ko';

  if (status === 'checking') return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
      border: '1px solid rgba(139,92,246,0.3)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Cpu size={20} style={{ color: '#a78bfa' }} />
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0' }}>
          {isKo ? '🧠 온디바이스 AI 엔진' : '🧠 On-Device AI Engine'}
        </span>
      </div>

      {status === 'not_downloaded' && (
        <>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.5' }}>
            {isKo
              ? 'Gemma 2B 모델을 다운로드하면 오프라인에서도 AI와 대화할 수 있습니다. (약 1.2GB)'
              : 'Download Gemma 2B to chat with AI offline. (~1.2GB)'}
          </p>
          <button
            onClick={handleDownload}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: '#fff', border: 'none', fontWeight: 600, fontSize: '13px',
              cursor: 'pointer', width: '100%', justifyContent: 'center',
            }}
          >
            <Download size={16} />
            {isKo ? '모델 다운로드' : 'Download Model'}
          </button>
        </>
      )}

      {status === 'downloading' && (
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
            {isKo ? '다운로드 중...' : 'Downloading...'}
            {progress > 0 && ` ${progress}%`}
          </p>
          <div style={{
            height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)',
            marginTop: '8px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              width: `${Math.max(progress, 5)}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
            <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>
              {isKo ? '온디바이스 AI 활성화됨' : 'On-Device AI Active'}
            </span>
          </div>
          <button onClick={handleDelete} style={{
            background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer',
            padding: '4px',
          }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '8px' }}>
            {isKo ? '다운로드에 실패했습니다. 다시 시도해 주세요.' : 'Download failed. Please try again.'}
          </p>
          <button onClick={handleDownload} style={{
            padding: '8px 14px', borderRadius: '8px',
            background: '#7c3aed', color: '#fff', border: 'none',
            fontSize: '12px', cursor: 'pointer',
          }}>
            {isKo ? '재시도' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  );
};
