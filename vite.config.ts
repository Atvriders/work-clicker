import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3015,
    proxy: {
      '/api': 'http://localhost:3014',
      '/ws': { target: 'ws://localhost:3014', ws: true },
    },
  },
  build: { outDir: 'dist' },
});
