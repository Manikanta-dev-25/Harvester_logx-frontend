import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '/Harvester_logx-frontend/', // 👈 critical for GitHub Pages
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),       // Main app
        reset: resolve(__dirname, 'reset.html'),       // Independent reset page
      },
    },
  },
});