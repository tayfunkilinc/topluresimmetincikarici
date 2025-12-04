import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages alt dizin için düzgün base path ayarı
export default defineConfig({ plugins: [react()], optimizeDeps: { exclude: ['lucide-react'], }, });
