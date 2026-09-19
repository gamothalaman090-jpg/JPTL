import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com; connect-src 'self' http://localhost:8000 http://localhost:5000 https:; worker-src 'self' blob:;",
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    headers: securityHeaders,
    fs: {
      strict: true,
      deny: ['**/.env', '**/.env.*', '**/node_modules/**/.env'],
    },
    proxy: {
      '/api': {
        target: (process.env.VITE_PROXY_TARGET && process.env.VITE_PROXY_TARGET !== 'http://localhost:8000')
          ? process.env.VITE_PROXY_TARGET
          : (process.env.CHOKIDAR_USEPOLLING ? 'http://server:8000' : (process.env.VITE_PROXY_TARGET || 'http://localhost:8000')),
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
  esbuild: {
    legalComments: 'none',
  },
})
