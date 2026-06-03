import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'PrepBridge — All India Exam Prep',
        short_name: 'PrepBridge',
        description: 'One platform for all 200+ competitive exams in India',
        theme_color: '#0a0f1e',
        background_color: '#0a0f1e',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/?source=pwa',
        lang: 'en-IN',
        categories: ['education', 'productivity'],
        id: 'in.prepbridge.app',
        icons: [
          { src: '/icons/icon-72.png',  sizes: '72x72',   type: 'image/png' },
          { src: '/icons/icon-96.png',  sizes: '96x96',   type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
        shortcuts: [
          {
            name: 'Daily Quiz',
            short_name: 'Quiz',
            url: '/app/dashboard?shortcut=quiz',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'AI Tutor',
            short_name: 'K² AI',
            url: '/app/ai-tutor',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Mock Tests',
            short_name: 'Tests',
            url: '/app/mock-tests',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
        ],
        screenshots: [
          { src: '/seo-preview.png', sizes: '1200x630', type: 'image/png', form_factor: 'wide', label: 'PrepBridge Dashboard' },
        ],
        related_applications: [
          { platform: 'play', url: 'https://play.google.com/store/apps/details?id=in.prepbridge.app', id: 'in.prepbridge.app' },
          { platform: 'itunes', url: 'https://apps.apple.com/app/prepbridge/id0000000000' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-static', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co/,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com/,
            handler: 'NetworkOnly', // Never cache AI responses
          },
        ],
      },
    }),
  ],
  server: { port: 5173, open: true },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'firebase'
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom') || id.includes('node_modules/zustand')) return 'vendor'
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-hot-toast') || id.includes('node_modules/date-fns')) return 'ui'
          // Keep questions data in the main chunk to prevent TDZ across lazy chunks
          if (id.includes('/src/data/questions')) return 'index'
        }
      }
    }
  },
})
