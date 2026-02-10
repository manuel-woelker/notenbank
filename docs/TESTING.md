# Testing Strategy

This project uses a layered testing strategy with a focus on deterministic, reproducible results.

## Goals

- Ensure correctness of business logic
- Prevent regressions
- Validate UI workflows
- Keep tests independent and deterministic

## Test Types

### Unit Tests (Vitest)

- Framework: Vitest
- Tests are colocated with production code (same file)
- Prefer data-driven tests
- Prefer black-box testing and avoid mocking where possible
- Use snapshots when appropriate

### UI/Integration Tests

- Test UI logic through realistic user flows
- Avoid coupling to internal implementation details

### E2E Tests (Playwright)

- Runner: Playwright
- E2E tests validate complete user journeys
- Each E2E session must use an isolated, temporary test database
- The database is controlled via the `db` URL query parameter
  - Example: `http://localhost:5173/?db=e2e-<run-id>`
  - Each test run uses a unique `db` identifier
  - This keeps tests deterministic and prevents cross-test interference

## Running Tests

All commands must be executed via `./tool-tool.exe`.

```bash
cd ui
../tool-tool.exe pnpm test
```

Single test file:

```bash
cd ui
../tool-tool.exe pnpm test path/to/test.spec.ts
```

E2E tests (separate script):

```bash
cd ui
../tool-tool.exe pnpm run test:e2e
```

## Checks and Formatting

After completing a unit of work:

```bash
cd ui
../tool-tool.exe pnpm run format
../tool-tool.exe pnpm run check
```

## Notes

- Never start the dev server (it is already running)
- Always run tests after feature changes
