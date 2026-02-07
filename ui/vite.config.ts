import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
