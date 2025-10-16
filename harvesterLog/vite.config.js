import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Harvester_logx-frontend/', // 👈 critical for GitHub Pages
});