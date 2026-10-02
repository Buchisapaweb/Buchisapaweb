import { defineConfig } from 'vite'

// Configuración de Vite para servir HTML5, CSS y JavaScript sin React/TSX
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  build: {
    target: ['es2015', 'chrome60', 'edge79', 'firefox60', 'safari12'],
  },
})
