import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    build: { sourcemap: true },
    plugins: [react()],
    server: {
      open: mode === 'development',
      host: mode === 'development' ? true : 'localhost',
      port: parseInt(env.SERVER_PORT ?? '80', 10),
      proxy: {
        [env.VITE_KLURIGO_SERVICE_URL]: {
          target: env.KLURIGO_SERVICE_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.VITE_KLURIGO_SERVICE_URL, ''),
        },
        [env.VITE_KLURIGO_SERVICE_IMAGES_URL]: {
          target: env.KLURIGO_SERVICE_IMAGES_PROXY,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(env.VITE_KLURIGO_SERVICE_IMAGES_URL, ''),
        },
      },
    },
    base: '/',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: 'src/setupTests.ts',
      exclude: ['e2e-tests/**', 'node_modules/**'],
      css: {
        modules: { classNameStrategy: 'non-scoped' },
      },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'node_modules/**',
          'coverage',
          'public/**',
          '**/*.{test,spec,stories}.?(c|m)[jt]s?(x)',
          '**/vite.config.ts',
          '**/src/*.d.ts',
          '**/src/main.ts',
        ],
        reporter: ['text', 'lcov', 'html'],
        reportsDirectory: 'coverage',
      },
      env: {
        TZ: 'UTC',
      },
    },
  }
})
