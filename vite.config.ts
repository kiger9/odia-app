import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project at https://<user>.github.io/odia-app/,
  // so the app must know it lives under the /odia-app/ subfolder.
  base: '/odia-app/',
  plugins: [
    react(),
    // Makes the app installable to the phone's home screen and work offline,
    // exactly like the single-file prototype did — but generated automatically.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Odia in Small Bites',
        short_name: 'Odia',
        description: 'Learn spoken Odia in short lessons.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf7f0',
        theme_color: '#ff9933',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
