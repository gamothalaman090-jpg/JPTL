import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || (process.env.CHOKIDAR_USEPOLLING ? 'http://server:8000' : 'http://localhost:8000'),
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

