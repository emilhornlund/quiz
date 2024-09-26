import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      open: true,
      port: parseInt(env.SERVER_PORT ?? '8080', 10),
      proxy: {
        '/quiz-service/api': {
          target: env.VITE_QUIZ_SERVICE_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/quiz-service\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: 'src/setupTests.ts',
      css: {
        modules: { classNameStrategy: 'non-scoped' },
      },
    },
  }
})
