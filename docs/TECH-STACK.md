# What does the tech stack look like?

## UI Platform: HTML

The UI Platform is **HTML** inside a web browser, because this makes it simple to deploy and easily accessible.

## UI Language: TypeScript

We use **TypeScript** because of its type safety features in order catch more bugs at compile time.

## Package manager: pnpm

UI Packages are installed with **pnpm**, because pnpm offers great performance.

## Bundler: vite

The application is bundled with **vite**, because it offers a good developer experience with features like hot reload, and good bundling performance.

## Unit-Test framework: vitest

**vitest** is used for unit testing since it allows for fast feedback cycles.

## UI Toolkit: React

**React** offers the broadest eco-system, and delivers decent performance.

## UI Component Library: Antd

**Ant Design** offers a good selection of UI components and healthy community.

## Routing: TanStack Router

**TanStack Router** is an ergonomic way to handle routing.

## State Management: Jestor + Immer

**Jestor** is a small, in-repo store helper (see `ui/src/shared/store/jestor.ts`) that
exposes `createStore`, action dispatchers, and selector hooks. It uses **Immer**
to keep mutation ergonomics while producing immutable updates.

