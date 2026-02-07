# AGENTS.md

This file provides guidance to human developers and AI Agents when working with code in this repository.

## Project Overview

Notenbank is a student administration system built as a web application. The project is in early stages with documentation defined but implementation not yet started.

## Tech Stack

- **UI Platform**: HTML/Browser-based web application
- **Package Manager**: pnpm (for performance)
- **Bundler**: Vite (hot reload, fast bundling)
- **UI Framework**: React
- **Testing Framework**: Vitest (for unit tests)



## Development Commands

**IMPORTANT:** Use `./tool-tool.exe` to ensure the correct Node.js and pnpm versions are used. tool-tool automatically downloads and runs the correct versions specified in the project configuration.

```bash
cd ui
../tool-tool.exe pnpm install         # Install dependencies
../tool-tool.exe pnpm build           # Build for production
../tool-tool.exe pnpm dev             # Start development server
```

Note: These commands are not yet set up but should be configured when creating the project structure.

- **Install dependencies**: `../tool-tool.exe pnpm install`
- **Start dev server**: `../tool-tool.exe pnpm dev` (typical Vite setup)
- **Build for production**: `../tool-tool.exe pnpm build`
- **Run tests**: `../tool-tool.exe pnpm test`
- **Run tests in watch mode**: `../tool-tool.exe pnpm test:watch`
- **Run single test file**: `../tool-tool.exe pnpm test path/to/test.spec.ts`

## Project Structure

- `docs/` - Project documentation
  - `TECHSTACK.md` - Technology choices and rationale
  - `DOCUMENTATION.md` - Documentation index
  - `use-cases/` - Use case requirements, each in a separate subfolder
- `src/` - Source code (to be created)

## Use Cases

Use case requirements are documented in `docs/use-cases/`. Each use case has its own subfolder with a markdown file describing the requirements.

Current use cases:
- **U1 Administration**: Student administration (adding/removing students)

## Development Workflow

When implementing new features, refer to the relevant use case documentation in `docs/use-cases/` for requirements.
