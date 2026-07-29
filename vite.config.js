import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendors de animación: pesados y cambian poco -> cachean aparte del
          // código de la app, y no se re-descargan en cada deploy de contenido.
          vendor_motion: ['framer-motion', 'gsap', 'lenis'],
          vendor_react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
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
