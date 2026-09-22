import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build') {
    const missingGoogleVariables = ['VITE_GOOGLE_CLIENT_ID', 'VITE_GOOGLE_API_KEY']
      .filter((name) => !env[name]?.trim() || /example|twój|twoj/i.test(env[name]))

    if (missingGoogleVariables.length > 0) {
      throw new Error(
        `Brak konfiguracji Google dla buildu: ${missingGoogleVariables.join(', ')}. ` +
        'Skopiuj .env.example jako .env.local i wpisz dane z Google Cloud Console.'
      )
    }
  }

  return {
    base: '/discipline-app/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          importScripts: ['notification-sw.js']
        },
        manifest: {
          id: '/discipline-app/',
          name: 'SamoDyscyplina',
          short_name: 'Dyscyplina',
          description: 'Aplikacja do budowania nawyków i samodyscypliny',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          lang: 'pl',
          icons: [
            {
              src: 'https://via.placeholder.com/192',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://via.placeholder.com/512',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ]
  }
})
