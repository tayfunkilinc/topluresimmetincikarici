import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages alt dizin için düzgün base path ayarı
export default defineConfig({
  base: '/topluresimcevirici/',

  plugins: [react()],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
