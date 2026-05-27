import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En dev proxiamos /uploads/* al backend Node, así las URLs relativas
    // que guardamos en la DB (ej. /uploads/cv/cv_123.pdf) funcionan tanto
    // local como en producción (donde Nginx hace el mismo proxy).
    proxy: {
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
