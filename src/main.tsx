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

// --- [NEW] Global AI Fallback Network Interceptor ---
// If Gemini 503 Overload occurs on any preview model, automatically retry with the stable gemini-3-flash-preview model
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let response = await originalFetch(...args);
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
  
  // 503 Service Unavailable (Overload)
  if (url.includes('generativelanguage.googleapis.com') && response.status === 503) {
      console.warn('⚠️ [AI Fallback] 503 Overload detected on primary model. Retrying with gemini-3-flash-preview ...');
      // swap the model segment in the URL
      const fallbackUrl = url.replace(/\/models\/gemini-[^:]+:/, '/models/gemini-3-flash-preview:');
      args[0] = fallbackUrl;
      response = await originalFetch(...args);
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
