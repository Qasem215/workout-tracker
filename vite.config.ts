import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/workout-tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['workouts.md'],
      manifest: {
        name: 'Workout Tracker',
        short_name: 'WorkoutTracker',
        description: 'Gamified minimalist workout tracking PWA',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,md}']
      }
    })
  ]
})
