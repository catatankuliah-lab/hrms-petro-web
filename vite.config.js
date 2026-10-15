import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Biar PWA aktif dan tombol install muncul di localhost saat npm run dev
      },
      // 🎯 Tambahkan konfigurasi batas ukuran cache Workbox di sini (8 MB)
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'HRMS Pacific Dashboard',
        short_name: 'PetroPacific',
        description: 'Sistem Manajemen Logistik & SJT-BAST PT Petro Pacific',
        theme_color: '#101838',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/images/logos/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/logos/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/images/logos/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})