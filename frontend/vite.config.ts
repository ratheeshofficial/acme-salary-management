import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.APP_BASE_URL || env.VITE_APP_BASE_URL || 'http://localhost:5000';
  const proxyTarget = rawTarget.replace(/\/api\/?$/, '') || 'http://localhost:5000';

  return {
    envPrefix: ['VITE_', 'APP_'],
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
