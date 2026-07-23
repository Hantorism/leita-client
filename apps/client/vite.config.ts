import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const envDir = path.resolve(__dirname, '../../');

export default defineConfig(({ mode }) => {
  // VITE_ 접두사가 없는 변수까지 읽는다. 프록시 대상은 로컬 개발 전용이라
  // 번들에 노출될 이유가 없다.
  const env = loadEnv(mode, envDir, '');

  // 배포 환경에서는 nginx가 /api를 server로 프록시한다. 로컬에서도 같은 오리진으로
  // 맞춰 CORS 없이 동작하도록 dev/preview 서버에 동일한 프록시를 둔다.
  const proxy = {
    '/api': {
      target: env.DEV_SERVER_URL,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    envDir,
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 3000,
      open: true,
      proxy,
    },
    preview: {
      proxy,
    },
    build: {
      outDir: 'build',
      cssMinify: true,
    },
  };
});
