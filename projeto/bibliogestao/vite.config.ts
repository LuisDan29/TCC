import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Repassa ao VIAF (evita o bloqueio de CORS do navegador)
      "/viaf-api": {
        target: "https://www.viaf.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/viaf-api/, "/viaf"),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
  },
})