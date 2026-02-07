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
- **UI Component Library**: Ant Design (see https://ant.design/llms.txt for component docs)


## Development Commands

**IMPORTANT:** Use `./tool-tool.exe` to ensure the correct Node.js and pnpm versions are used. tool-tool automatically downloads and runs the correct versions specified in the project configuration.

```bash
cd ui
../tool-tool.exe pnpm install         # Install dependencies
../tool-tool.exe pnpm build           # Build for production
../tool-tool.exe node <script.js>     # Run Node.js scripts
```

**Never** start the dev server, it is already running.

Note: These commands are not yet set up but should be configured when creating the project structure.

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
- `src/` - Source code (to be created)

## Use Cases

Use case requirements are documented in `docs/use-cases/`. Each use case has its own subfolder with a markdown file describing the requirements.

Current use cases:
- **U1 Administration**: Student administration (adding/removing students)

## Development Workflow

When implementing new features, refer to the relevant use case documentation in `docs/use-cases/` for requirements.


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