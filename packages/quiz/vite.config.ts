import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      open: mode === 'development',
      host: mode === 'development' ? true : 'localhost',
      port: parseInt(env.SERVER_PORT ?? '80', 10),
      proxy: {
        [env.VITE_QUIZ_SERVICE_URL]: {
          target: env.QUIZ_SERVICE_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.VITE_QUIZ_SERVICE_URL, ''),
        },
        [env.VITE_QUIZ_SERVICE_IMAGES_URL]: {
          target: env.QUIZ_SERVICE_IMAGES_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(env.VITE_QUIZ_SERVICE_IMAGES_URL, ''),
        },
      },
    },
    base: '/',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: 'src/setupTests.ts',
      css: {
        modules: { classNameStrategy: 'non-scoped' },
      },
      coverage: {
        provider: 'istanbul',
        all: true,
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'node_modules/**',
          'coverage',
          'public/**',
          '**/*{.,-}test.ts',
          '**/*{.,-}spec.ts',
          '**/vite.config.ts',
          '**/src/*.d.ts',
          '**/src/main.ts',
        ],
        reporter: ['text', 'lcov', 'html'],
        reportsDirectory: 'coverage',
      },
    },
  }
})
