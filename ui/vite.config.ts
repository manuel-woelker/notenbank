import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // 📖 # Why use conditional base path?
  // GitHub Pages deploys to a subdirectory (/notenbank/), requiring all asset paths
  // to be rewritten. Local development uses root (/) for simplicity.
  // The GITHUB_PAGES env var switches between these environments.
  const base = env.GITHUB_PAGES === 'true' ? '/notenbank/' : '/'

  return {
    base,
    plugins: [react()],
    test: {
      includeSource: ['src/**/!(*.d).{ts,tsx,js,jsx}'],
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
  }
})
