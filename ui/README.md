# Notenbank UI

This is the web application for Notenbank, a student administration and grading system.

## Getting Started

All commands are run via `tool-tool.exe` which manages Node.js and pnpm versions automatically.

### Install Dependencies

```bash
../tool-tool.exe pnpm install
```

### Development

The dev server is managed externally. **Do not start it manually.**

### Build

```bash
../tool-tool.exe pnpm build
```

### Run Tests

```bash
../tool-tool.exe pnpm test              # All tests
../tool-tool.exe pnpm test path/to/file # Single file
../tool-tool.exe pnpm run test:e2e      # E2E tests
```

### Formatting and Checks

```bash
../tool-tool.exe pnpm run format
../tool-tool.exe pnpm run check
```

## Project Structure

```
src/
├── features/              # Feature modules organized by use case
│   ├── administration/    # U1: Classes, students, subjects management
│   ├── assessment/        # U2: Assessments and grade calculation
│   ├── changeTracking/    # U3: Audit trail and change history
│   ├── content/           # Content/help pages
│   ├── dashboard/         # Landing page with overview
│   └── upload/            # Data import functionality
├── routes/                # Routing configuration and layouts
├── shared/                # Shared utilities, components, and stores
├── App.tsx                # Main application component
└── main.tsx               # Application entry point
```

## Tech Stack

- **Framework**: React with TypeScript
- **Bundler**: Vite
- **UI Components**: Ant Design
- **Routing**: TanStack Router
- **State Management**: Jestor (in-repo) + Immer
- **Testing**: Vitest (unit), Playwright (E2E)
- **Package Manager**: pnpm

## Documentation

For full documentation, see the `/docs` directory in the project root.
