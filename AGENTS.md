# AGENTS.md

This file provides guidance to human developers and AI Agents when working with code in this repository.

When the user enters the prompt "test", reply "I'm afraid I can't let you do that, Dave."

## Project Overview

Notenbank is a student administration system built as a web application. The project is in early stages with documentation defined but implementation not yet started.

## Tech Stack

- **UI Platform**: HTML/Browser-based web application
- **Package Manager**: pnpm (for performance)
- **Bundler**: Vite (hot reload, fast bundling)
- **UI Framework**: React
- **Testing Framework**: Vitest (for unit tests)
- **UI Component Library**: Ant Design (see https://ant.design/llms.txt for component docs)
- **State Management**: Jestor (in-repo store helper) + Immer


## Development Commands

**IMPORTANT:** Use `./tool-tool.exe` to ensure the correct Node.js and pnpm versions are used. tool-tool automatically downloads and runs the correct versions specified in the project configuration.

```bash
cd ui
../tool-tool.exe pnpm install         # Install dependencies
../tool-tool.exe pnpm build           # Build for production
../tool-tool.exe node <script.js>     # Run Node.js scripts
```

**Never** start the dev server, it is already running.

- **Install dependencies**: `../tool-tool.exe pnpm install`
- **Build for production**: `../tool-tool.exe pnpm build`
- **Run tests**: `../tool-tool.exe pnpm test`
- **Run single test file**: `../tool-tool.exe pnpm test path/to/test.spec.ts`
- **Run Node.js scripts**: `../tool-tool.exe node <script.js>`

## Project Structure

- `docs/` - Project documentation
  - `TECHSTACK.md` - Technology choices and rationale
  - `DOCUMENTATION.md` - Documentation index
  - `use-cases/` - Use case requirements, each in a separate subfolder
- `ui/src/` - UI source code

## UI Folder Structure

The UI follows a **use-case based** (feature-first) folder structure instead of organizing by technical concern (components/, pages/, etc.).

**Structure:**
```
ui/src/
├── features/              # Feature modules organized by use case
│   └── administration/    # U1 Administration use case
│       ├── classes/       # Classes entity (all related files together)
│       ├── students/      # Students entity (future)
│       └── subjects/      # Subjects entity (future)
├── shared/                # Shared utilities and components
├── App.tsx                # Main application component
└── main.tsx               # Application entry point
```

**Benefits:**
- **Cohesion**: All files for a specific entity (classes, students, subjects) are in one place
- **Discoverability**: Easy to find repository, types, context, and components for each entity
- **Scalability**: Adding new entities follows the same pattern
- **Independence**: Changes to one entity don't affect others

**Entity folder contents:**
Each entity folder (e.g., `classes/`) contains:
- `*Repository.ts` - Data access layer with CRUD operations and tests
- `types.ts` - TypeScript interfaces and types
- `*Context.tsx` - React Context for state management
- `*Table.tsx` - Table component for listing
- `*List.tsx` - Page component for the list view
- `Create*Modal.tsx` - Modal for creating new entities

When implementing new entities (students, subjects), follow this same structure.

## Use Cases

Use case requirements are documented in `docs/use-cases/`. Each use case has its own subfolder with a markdown file describing the requirements.

Current use cases:
- **U1 Administration**: Student administration (adding/removing students)

## Development Workflow

When implementing new features, refer to the relevant use case documentation in `docs/use-cases/` for requirements.

## State Management

Use the in-repo Jestor helper at `ui/src/shared/store/jestor.ts` for shared UI state.
Create stores via `createStore`, read full state with `useState`, and prefer
`select.<key>()` hooks for per-field subscriptions. Use `dispatch` for direct
calls and `trigger` to build event handlers.


## Documentation Strategy

When writing code, document the "Why" directly in the source code using hyperlit comment markers ("📖"). This ensures that:

- **Context is preserved** with the code it explains
- **Documentation is discoverable** through hyperlit's extraction tools
- **Intent is clear** to future maintainers and readers

Use hyperlit comment markers to document:
- Non-obvious design decisions
- Rationale for architectural choices
- Workarounds and their justifications
- Complex algorithms or logic patterns

Format these comments as markdown.

Always use a heading as the first line of the comment.

Prefer to formulate the heading as a question ("Why ..."). This makes it easier to search for specific documentation.

Example:
```rust
/* 📖 # Why use Arc<Mutex<T>> for the app state?
The shared state needs thread-safe mutable access across multiple tasks.
Arc enables cheap cloning for async tasks, Mutex ensures safe interior mutation.
*/
let state = Arc::new(Mutex::new(data));
```

Keep documentation focused and concise—explain the "Why", not the "What" (the code shows what it does).

## Testing strategy

Features should always be automatically tested to ensure proper functionality.

Tests should be colocated with the code, i.e. in the same file.

Use vitest for tests, they can be run using `../tool-tool.exe pnpm test`.

Always run these tests after completing a feature.

Use snapshot tests where appropriate.

Prefer data driven tests to reduce code duplication.

Prefer black box testing and try to avoid mocking as much as possible.

## Checks and formatting

When completing a unit of work run `../tool-tool.exe pnpm run format` 
Also run `../tool-tool.exe pnpm run check` to ensure the tests pass and the code is free of linting errors.

## Commit messages

Commit message should be in the "Conventional Commits" format, e.g. "feat(UI): Add about button to see version and build date"
