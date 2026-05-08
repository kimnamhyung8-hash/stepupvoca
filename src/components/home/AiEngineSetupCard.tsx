// src/components/home/AiEngineSetupCard.tsx
// 홈화면 온디바이스 AI 엔진 다운로드/상태 카드

import React, { useState, useEffect } from 'react';
import { Cpu, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { ModelManager } from '../../services/ai/modelManager';
import { aiDispatcher } from '../../services/ai/dispatcher';

interface Props {
  lang: string;
}

export const AiEngineSetupCard: React.FC<Props> = ({ lang }) => {
  const [status, setStatus] = useState<'checking' | 'not_downloaded' | 'downloading' | 'ready' | 'error' | 'unsupported'>('checking');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // 웹에서는 온디바이스 AI가 작동하지 않으므로 카드를 숨김
  if (!Capacitor.isNativePlatform()) return null;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const manager = ModelManager.getInstance();
    if (!manager.isSupported) {
      setStatus('unsupported');
      return;
    }

    try {
      // 1. 이미 준비되었는지 확인
      await aiDispatcher.init();
      if (aiDispatcher.isOnDeviceReady) {
        setStatus('ready');
        return;
      }

      // 2. 준비는 안 되었지만 모델 파일은 있는지 확인
      const isDownloaded = await manager.isModelDownloaded();
      if (isDownloaded) {
        // 파일은 있는데 초기화가 안 된 경우 -> 에러 상태로 표시하여 재시도 유도
        setStatus('error');
        return;
      }
    } catch (e) {
      console.warn('[AiSetup] 상태 체크 중 오류:', e);
    }

    setStatus('not_downloaded');
  };

  const handleDownload = async () => {
    const manager = ModelManager.getInstance();
    setStatus('downloading');
    setProgress(0);
    setErrorMsg('');
    
    try {
      // 1. 파일이 없는 경우에만 다운로드 시도
      const isDownloaded = await manager.isModelDownloaded();
      if (!isDownloaded) {
        await manager.downloadModel((p) => setProgress(p));
      } else {
        setProgress(100);
      }

      // 2. 엔진 초기화 (최대 3회 재시도)
      for (let i = 0; i < 3; i++) {
        await aiDispatcher.init();
        if (aiDispatcher.isOnDeviceReady) break;
        await new Promise(r => setTimeout(r, 1000)); // 1초 대기
      }

      setStatus(aiDispatcher.isOnDeviceReady ? 'ready' : 'error');
    } catch (e: any) {
      console.error('[AiSetup] 설정 실패:', e);
      setErrorMsg(e?.message || 'Unknown error');
      setStatus('error');
    }
  };

  const isKo = lang === 'ko';

  if (status === 'checking' || status === 'unsupported') return null;

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
              ? 'AI 모델을 다운로드하면 오프라인에서도 AI와 대화할 수 있습니다. (약 200MB)'
              : 'Download AI model to chat offline. (~200MB)'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
          <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>
            {isKo ? '온디바이스 AI 활성화됨' : 'On-Device AI Active'}
          </span>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '8px' }}>
            {isKo ? '설정에 실패했습니다. 모델 파일이 손상되었을 수 있습니다.' : 'Setup failed. Model file might be corrupted.'}
            {errorMsg && <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{errorMsg}</span>}
          </p>
          <button 
            onClick={async () => {
              // 강제 초기화 로직
              localStorage.removeItem('vq_llm_model_path');
              const manager = ModelManager.getInstance();
              (manager as any)._modelPath = null;
              setStatus('checking');
              checkStatus();
            }} 
            style={{
              padding: '8px 14px', borderRadius: '8px',
              background: '#ef4444', color: '#fff', border: 'none',
              fontSize: '12px', cursor: 'pointer', width: '100%',
              marginBottom: '8px'
            }}
          >
            {isKo ? '강제 초기화 후 다시 다운로드' : 'Force Reset & Redownload'}
          </button>
        </div>
      )}
    </div>
  );
};
