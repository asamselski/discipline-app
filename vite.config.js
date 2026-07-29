import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Ścieżka pod GitHub Pages (nazwa Twojego repozytorium z ukośnikami)
  base: '/discipline-app/', 
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SamoDyscyplina',
        short_name: 'Dyscyplina',
        description: 'Aplikacja do budowania nawyków i samodyscypliny',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone', // Dzięki temu działa jak natywna aplikacja bez paska przeglądarki
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
})