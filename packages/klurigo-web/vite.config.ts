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
  }
})
