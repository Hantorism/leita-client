import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'build',
    cssMinify: true,
  },
});
