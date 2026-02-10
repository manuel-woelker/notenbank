export const createE2eRunId = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
