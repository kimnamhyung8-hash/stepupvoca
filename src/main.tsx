import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// [기기 방어벽] 웹(웹사이트) 환경일 때만 AdSense 웹 코드를 주입 (하이브리드 앱 웹뷰 정책 위반 방어)
// AdMob initialization for Native platforms is handled in App.tsx
// Web AdSense removed to comply with AdMob approval policies




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
