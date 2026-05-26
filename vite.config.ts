import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const VITE_API_URL = process.env.VITE_API_URL || 'http://localhost:8080';
export default defineConfig({ 
  plugins: [
    react({
      jsxImportSource: undefined,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'window',
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    proxy: {
      '/auth': {
        target: VITE_API_URL,
        changeOrigin: true,
        secure: false,
      },
    }
  }

})