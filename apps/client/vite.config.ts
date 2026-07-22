import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
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
