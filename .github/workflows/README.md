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

# Run tests with coverage (same as CI)
../tool-tool.exe pnpm test:ci

# Or just run tests with coverage without JSON output
../tool-tool.exe pnpm test:coverage

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

## UI Deploy to GitHub Pages Workflow

**File:** `ui-deploy-pages.yml`

### Purpose

Automatically builds and deploys the UI to GitHub Pages on every push to the master branch. The site is publicly accessible at:

**🌐 https://manuel-woelker.github.io/notenbank/**

### Triggers

- **Push** to `master` branch (when `ui/**` or workflow file changes)
- **Manual Dispatch** - Can be triggered manually via the Actions tab

### Jobs

The workflow consists of two jobs:

#### 1. Build Job

Builds the UI with GitHub Pages configuration:

1. **Checkout** - Checks out the repository code
2. **Setup** - Installs Node.js 22 and pnpm 9
3. **Install** - Installs dependencies with frozen lockfile
4. **Build** - Runs `pnpm build` with `GITHUB_PAGES=true` environment variable
5. **Upload** - Uploads the `ui/dist` directory as a Pages artifact

**Key Configuration:**
- Sets `GITHUB_PAGES=true` environment variable during build
- This triggers Vite to use `/notenbank/` as the base path instead of `/`
- All asset paths are rewritten to work in the subdirectory deployment

#### 2. Deploy Job

Deploys the built artifact to GitHub Pages:

1. **Deploy** - Uses official GitHub Pages deployment action
2. **Output** - Provides deployment URL in job output

**Environment:**
- Name: `github-pages`
- URL: Automatically set to the deployment URL
- Visible in the "Environments" tab for deployment history

### Base Path Configuration

The UI uses conditional base path configuration in `ui/vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/notenbank/' : '/'
```

**Why this is needed:**
- GitHub Pages deploys to `https://manuel-woelker.github.io/notenbank/` (subdirectory)
- Without base path, assets would be requested from wrong paths (e.g., `/assets/index.js` instead of `/notenbank/assets/index.js`)
- Local development uses root path `/` for simplicity
- Hash-based routing (TanStack Router with `createHashHistory`) works perfectly with this setup

### Permissions

The workflow uses OIDC authentication with these permissions:
- `contents: read` - Read repository code
- `pages: write` - Create GitHub Pages deployments
- `id-token: write` - Request OIDC JWT for authentication

No personal access tokens required - uses GitHub's built-in security.

### Concurrency Control

- Only one deployment runs at a time (group: "pages")
- Queued deployments are skipped if a newer one is queued
- In-progress deployments are NOT cancelled (complete production deploys)

### Repository Settings Required

**One-time setup** (manual step):

1. Go to repository **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to **GitHub Actions**
3. Save settings

This enables the repository to accept deployments from GitHub Actions.

### Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab
2. Select "Deploy UI to GitHub Pages" workflow
3. Click **Run workflow**
4. Select `master` branch
5. Click **Run workflow**

### Viewing Deployment Status

- **Actions tab** - Shows workflow runs and logs
- **Environments tab** - Shows deployment history with URLs
- Each deployment is tracked with timestamp and commit SHA

### Running the Build Locally

To test the GitHub Pages build locally:

```bash
cd ui

# Build with GitHub Pages configuration
GITHUB_PAGES=true ../tool-tool.exe pnpm build

# Preview the build (note: base path will be /notenbank/)
../tool-tool.exe pnpm preview
```

**Note:** When previewing locally, the app will expect to be at `/notenbank/` path. You may see routing issues - this is expected and will work correctly when deployed.

### Troubleshooting

**Build fails:**
- Check that all CI checks pass first (`ui-ci.yml` workflow)
- Review build logs in the Actions tab
- Test locally with `GITHUB_PAGES=true ../tool-tool.exe pnpm build`

**Assets return 404:**
- Verify base path is configured correctly in `vite.config.ts`
- Check browser console for incorrect asset paths
- Ensure `GITHUB_PAGES=true` is set in build job

**Site not accessible:**
- Verify repository Settings → Pages → Source is set to "GitHub Actions"
- Check deployment completed successfully in Environments tab
- Wait a few minutes for DNS propagation

**Deployment stuck or failed:**
- Check concurrency - only one deployment runs at a time
- Review deploy job logs for errors
- Verify repository has Pages enabled in settings

### Build Process Details

The `pnpm build` command runs these steps:

1. **Pre-build script:** `scripts/generate-git-info.js` creates `src/git-info.ts` with commit metadata
2. **TypeScript compilation:** `tsc -b` validates types
3. **Vite build:** Bundles, minifies, and hashes assets into `dist/`

The git info (commit SHA, branch, etc.) is included in the deployed build.

### Rollback

To rollback to a previous deployment:

1. **Option A - Revert commit:**
   - Revert the problematic commit(s)
   - Push to master
   - New deployment will trigger automatically

2. **Option B - Redeploy previous workflow:**
   - Go to Actions tab
   - Find the successful workflow run to restore
   - Click "Re-run all jobs"

GitHub maintains full deployment history in the Environments tab.
