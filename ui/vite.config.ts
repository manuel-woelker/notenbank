import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // 📖 # Why are coverage thresholds currently low?
      // The project is in early stages with some untested UI components.
      // These thresholds should be gradually increased as test coverage improves.
      // Target: 80% for all metrics once the codebase matures.
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 20,
        statements: 40,
      },
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
