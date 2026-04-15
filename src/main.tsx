import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { Capacitor } from '@capacitor/core'

registerSW({ immediate: true })

// [기기 방어벽] 웹(웹사이트) 환경일 때만 AdSense 웹 코드를 주입 (하이브리드 앱 웹뷰 정책 위반 방어)
if (Capacitor.getPlatform() === 'web') {
  const adScript = document.createElement('script');
  adScript.async = true;
  adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8125662823247706";
  adScript.crossOrigin = "anonymous";
  document.head.appendChild(adScript);
}

// --- [UPDATED] Robust Global AI Fallback Network Interceptor ---
// Intercepts Google Gemini API requests. If the primary model fails (503, 429, 500), safely clone and retry with a stable fallback model.
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
  const isGemini = url.includes('generativelanguage.googleapis.com');
  
  let fallbackReqInit: RequestInit | undefined = undefined;
  let fallbackUrl = url;

  if (isGemini) {
      fallbackUrl = url.replace(/\/models\/gemini-[^:]+:/, '/models/gemini-3-flash-preview:');
      
      // We must extract the Request's metadata and body BEFORE it is consumed by the original fetch.
      if (typeof args[0] !== 'string') {
          const originalReq = args[0] as Request;
          try {
              fallbackReqInit = {
                  method: originalReq.method,
                  headers: new Headers(originalReq.headers),
                  mode: originalReq.mode,
                  credentials: originalReq.credentials,
                  cache: originalReq.cache,
                  redirect: originalReq.redirect,
                  referrer: originalReq.referrer,
                  integrity: originalReq.integrity,
              };
              if (originalReq.method !== 'GET' && originalReq.method !== 'HEAD') {
                  const cloned = originalReq.clone();
                  fallbackReqInit.body = await cloned.blob();
              }
          } catch(e) { console.error("Interceptor clone failed", e); }
      } else {
          fallbackReqInit = args[1] ? { ...args[1] } : undefined;
      }
  }

  let response = await originalFetch(...args);
  
  if (isGemini && !response.ok && (response.status === 503 || response.status === 429 || response.status >= 500)) {
      console.warn(`[AI Fallback] Server rejected request (${response.status}). Retrying quietly with gemini-3-flash-preview...`);
      // Second attempt using the exact same cloned headers and body (preventing empty payload API errors)
      response = await originalFetch(fallbackUrl, fallbackReqInit);
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
