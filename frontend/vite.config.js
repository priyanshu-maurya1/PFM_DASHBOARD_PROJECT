import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // 🔥 CRITICAL: Proxy ALL /api calls to backend:5000
    // Fixes CORS + routes frontend API calls correctly
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Ensure cookies work across proxy
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[VITE PROXY] ${req.method} ${req.url} → backend:5000`);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[VITE PROXY ERROR]', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('[VITE PROXY ERROR]: ' + err.message);
          });
        },
      },
      // Proxy uploads/resources too  
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/resources': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
      }
    }
  },
  // Ensure api.js uses relative paths /api/auth/login → gets proxied
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(''),
  }
})

