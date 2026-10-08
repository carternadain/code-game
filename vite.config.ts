import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths so the built app works from any sub-path (e.g. GitHub Pages).
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 6000 },
  worker: { format: 'es' },
})
