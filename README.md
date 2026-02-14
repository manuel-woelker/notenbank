# Notenbank

Notenbank is a student administration and grading system built as a browser-based web application. It enables teachers and administrators to manage classes, students, subjects, and assessments with automatic grade calculation.

## Features

### Administration (U1)

- **Class Management** -- Create, view, edit, and delete classes
- **Student Management** -- Add, view, edit, and remove students within classes
- **Subject Management** -- Add, view, edit, and remove subjects within classes

### Assessment (U2)

- **Assessment Recording** -- Define and record student performance per subject
- **Weighted Grade Calculation** -- Final grades derived from weighted assessment results (e.g., Written: 2 / Oral: 1)
- **Grading Curves** -- Support for point/error-based grading thresholds
- **Grade Increments** -- Grades use 0.25 increments with no rounding

### General

- **Example Database** -- Built-in sample data ("Beispiel-Datenbank") for exploration and testing
- **Product Tour** -- Guided onboarding tour for new users
- **Offline-Capable** -- Data stored locally in IndexedDB, no server required
- **No Authentication Required** -- Since all data is stored locally and never leaves your browser, there is no need for user accounts or login systems

## Tech Stack

| Concern            | Technology                  |
| ------------------ | --------------------------- |
| UI Framework       | React                       |
| Language           | TypeScript                  |
| Component Library  | Ant Design                  |
| Routing            | TanStack Router             |
| State Management   | Jestor (in-repo) + Immer    |
| Bundler            | Vite                        |
| Package Manager    | pnpm                        |
| Testing            | Vitest                      |
| E2E Testing        | Playwright                  |
| CI/CD              | GitHub Actions              |
| Deployment         | GitHub Pages                |

## Getting Started

### Prerequisites

The project uses `tool-tool.exe` to manage Node.js and pnpm versions automatically. No manual Node.js or pnpm installation is required.

### Install Dependencies

```bash
cd ui
../tool-tool.exe pnpm install
```

### Development

The dev server should already be running. **Do not start it manually.**

### Build

```bash
cd ui
../tool-tool.exe pnpm build
```

### Run Tests

```bash
cd ui
../tool-tool.exe pnpm test
```

### Formatting and Checks

```bash
cd ui
../tool-tool.exe pnpm run format
../tool-tool.exe pnpm run check
```

## Project Structure

```
notenbank/
├── docs/                          # Project documentation
│   ├── use-cases/                 # Use case requirements
│   │   ├── U1 Administration/
│   │   └── U2 Assessment/
│   ├── DOCUMENTATION.md
│   ├── EXAMPLE-DATABASE.md
│   ├── TECH-STACK.md
│   └── TESTING.md
├── ui/                            # Web application
│   └── src/
│       ├── features/              # Feature modules (use-case based)
│       │   ├── administration/    # U1: Classes, students, subjects
│       │   ├── assessment/        # U2: Assessments and grading
│       │   ├── dashboard/         # Landing page
│       │   ├── content/           # Content page
│       │   └── upload/            # Upload page
│       ├── shared/                # Shared utilities, components, stores
│       └── routes/                # Routing configuration and layouts
├── .github/workflows/             # CI/CD pipelines
├── AGENTS.md                      # Developer and AI agent guidelines
└── tool-tool.exe                  # Toolchain version manager
```

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Documentation Index](docs/DOCUMENTATION.md)
- [Tech Stack](docs/TECH-STACK.md)
- [Testing Strategy](docs/TESTING.md)
- [Example Database](docs/EXAMPLE-DATABASE.md)
