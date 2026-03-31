
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CommunityApp from './CommunityApp.tsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CommunityApp />
  </StrictMode>,
)
