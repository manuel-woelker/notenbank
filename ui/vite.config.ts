import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  /* 📖 # Why use relative base path?
  Using './' makes all asset paths relative to the HTML file location, which works
  in any deployment context (root path or subdirectory like GitHub Pages).
  Combined with hash routing, this eliminates the need for environment-specific configuration.
  */
  base: './',
  plugins: [react()],
  /* 📖 # Why force a single JavaScript bundle?
  The deployment target expects one JS file for simpler hosting and caching.
  inlineDynamicImports disables code splitting, and clearing manualChunks avoids
  extra chunks created by Rollup.
  */
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    globals: true,
    environment: 'happy-dom',
    isolate: false,
    setupFiles: ['./src/testSetup.ts'],
    reporters: process.env.CI
      ? ['default', 'verbose', 'github-actions', 'junit']
      : ['default', 'verbose'],
    outputFile: {
      junit: 'test-results.xml',
    },
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
        lines: 55,
        functions: 55,
        branches: 35,
        statements: 55,
      },
    },
  },
})
