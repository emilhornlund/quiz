import { defineConfig } from 'vitest/config'

export default defineConfig({
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
})
