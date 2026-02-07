# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD.

## UI CI Workflow

**File:** `ui-ci.yml`

### Purpose

Automatically builds, tests, lints, and format checks the UI on every push and pull request to the master branch.

### Triggers

- **Push** to `master` branch (when `ui/**` or workflow file changes)
- **Pull Request** to `master` branch (when `ui/**` or workflow file changes)

### Jobs

The workflow runs a single job `ui-checks` that performs the following steps:

1. **Type Check** - Validates TypeScript types (`pnpm typecheck`)
2. **Lint** - Runs ESLint with zero warnings allowed (`pnpm lint`)
3. **Format Check** - Validates code formatting with Prettier (`pnpm format:check`)
4. **Test** - Runs all unit tests with coverage (`pnpm test --coverage`)
5. **Build** - Creates production build (`pnpm build`)

### Reports & Artifacts

The workflow generates and uploads the following artifacts (retained for 30 days):

- **test-results** - JSON file containing detailed test results
- **coverage-report** - HTML/LCOV coverage reports in the `coverage/` directory

### Accessing Reports

1. Go to the GitHub Actions tab
2. Click on the workflow run
3. Scroll down to the "Artifacts" section
4. Download the artifacts to view detailed reports

### Coverage Thresholds

The project enforces minimum coverage thresholds:
- Lines: 40%
- Functions: 40%
- Branches: 20%
- Statements: 40%

**Note:** These thresholds are currently set to match the project's early stage. They should be gradually increased as test coverage improves, with a target of 80% for all metrics.

If coverage falls below these thresholds, the build will fail.

### Running Locally

To run the same checks locally before pushing:

```bash
cd ui

# Type check
../tool-tool.exe pnpm typecheck

# Lint
../tool-tool.exe pnpm lint

# Format check
../tool-tool.exe pnpm format:check

# Run tests with coverage
../tool-tool.exe pnpm test --coverage

# Build
../tool-tool.exe pnpm build
```

### Troubleshooting

**Lint failures:** Run `../tool-tool.exe pnpm lint:fix` to auto-fix issues

**Format failures:** Run `../tool-tool.exe pnpm format` to auto-format code

**Test failures:** Check the test output and fix failing tests

**Coverage below threshold:** Add tests to increase coverage

### Node.js and pnpm Versions

The workflow uses:
- Node.js: v22
- pnpm: v9

These are managed by the GitHub Actions setup and should match the versions specified in the project's tool-tool configuration.
