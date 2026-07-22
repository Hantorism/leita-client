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
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 3001,
    open: true,
    // 배포 환경에서는 nginx가 /api를 server로 프록시한다. 로컬에서도 같은 오리진으로
    // 맞춰 CORS 없이 동작하도록 dev 서버에 동일한 프록시를 둔다.
    proxy: {
      '/api': {
        target: 'https://dev-server.leita.dev',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    cssMinify: true,
  },
});
