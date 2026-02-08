/// <reference types="vite/client" />
/// <reference types="vitest" />

// Ensure TypeScript fully type-checks code inside `if (import.meta.vitest)` blocks
interface ImportMeta {
  readonly vitest?: typeof import('vitest')
}
