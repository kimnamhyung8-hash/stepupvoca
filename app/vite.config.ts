import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        navigateFallbackDenylist: [/^\/ads\.txt/, /^\/app-ads\.txt/, /^\/robots\.txt/, /^\/sitemap\.xml/, /^\/__\//],
      },
      manifest: {
        name: 'Stepup Voca - VocaQuest',
        short_name: 'VocaQuest',
        description: 'Vibrant 1:1 Voca Battle & AI English Conversation',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        study: 'study.html',
        mastery: 'mastery.html',
        battle: 'battle.html',
        aiconv: 'aiconv.html',
        dictionary: 'dictionary.html',
        bible: 'bible.html',
        contents: 'contents.html',
        success: 'success.html',
        careers: 'careers.html',
        partnership: 'partnership.html',
        store: 'store.html',
        community: 'community.html',
      },
      onwarn(warning, warn) {
        if (warning.code === 'DYNAMIC_IMPORT_WILL_NOT_MOVE') return;
        warn(warning);
      },
    },
  },
})
