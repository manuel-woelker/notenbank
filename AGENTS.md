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

Note: These commands are not yet set up but should be configured when creating the project structure.

- **Install dependencies**: `pnpm install`
- **Start dev server**: `pnpm dev` (typical Vite setup)
- **Build for production**: `pnpm build`
- **Run tests**: `pnpm test`
- **Run tests in watch mode**: `pnpm test:watch`
- **Run single test file**: `pnpm test path/to/test.spec.ts`

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
