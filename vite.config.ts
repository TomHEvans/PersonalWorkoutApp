import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite builds the front end into ./dist, which Cloudflare Pages serves.
// The /functions directory is picked up by Wrangler/Pages separately.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
