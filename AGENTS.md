# AGENTS.md

This document defines **how AI agents and contributors are expected to work in the `klurigo` monorepo**. Follow these instructions strictly to avoid breaking workspace assumptions, CI pipelines, or architectural constraints.

---

## Repository Overview

* **Monorepo**: Yarn workspaces
* **Packages**:

    * `@klurigo/common` – shared domain models, enums, utilities
    * `@klurigo/klurigo-web` – frontend (React + Vite + SCSS modules)
    * `@klurigo/klurigo-service` – backend (NestJS)

All packages are built, linted, and tested **via the root workspace** unless explicitly stated otherwise.

---

## Build, Lint, and Test Commands

### Root-Level Commands (Preferred)

Use these whenever possible.

* `yarn clean` – Clean all package build artifacts
* `yarn build` – Build all packages
* `yarn lint` – Lint all packages
* `yarn lint:fix` – Auto-fix lint issues
* `yarn test` – Run all tests concurrently (common + backend + frontend)
* `yarn test:coverage` – Run all tests with coverage

---

### Development Commands

* `yarn dev` – Run frontend, backend, and Storybook concurrently
* `yarn serve` – Serve built frontend and backend concurrently

---

### Package-Specific Commands

Use these **only when scoping is required**.

#### Common

* `yarn workspace @klurigo/common build`
* `yarn workspace @klurigo/common test`
* `yarn workspace @klurigo/common test:coverage`

#### Frontend (`@klurigo/klurigo-web`)

* `yarn workspace @klurigo/klurigo-web dev`
* `yarn workspace @klurigo/klurigo-web build`
* `yarn workspace @klurigo/klurigo-web test`
* `yarn workspace @klurigo/klurigo-web test:watch`
* `yarn workspace @klurigo/klurigo-web test:coverage`
* `yarn workspace @klurigo/klurigo-web storybook`

#### Backend (`@klurigo/klurigo-service`)

* `yarn workspace @klurigo/klurigo-service dev`
* `yarn workspace @klurigo/klurigo-service build`
* `yarn workspace @klurigo/klurigo-service test`
* `yarn workspace @klurigo/klurigo-service test:coverage`
* `yarn workspace @klurigo/klurigo-service check-circular-deps`

---

### Running a Single Test File

* **Frontend**:

    * `yarn workspace @klurigo/klurigo-web vitest run path/to/file.test.ts`
* **Backend**:

    * `yarn workspace @klurigo/klurigo-service jest path/to/file.spec.ts`
* **Common**:

    * `yarn workspace @klurigo/common jest path/to/file.spec.ts`

---

## Code Style Guidelines

### Formatting

* Prettier enforced via ESLint
* No semicolons
* Single quotes
* 2-space indentation
* Trailing commas where valid
* `printWidth: 80`
* `bracketSpacing: true`
* Frontend only: `bracketSameLine: true`

Do not reformat files unnecessarily.

---

### Imports

* Order strictly as follows:

    1. Built-in
    2. External dependencies
    3. Internal workspace packages
    4. Parent imports
    5. Sibling imports
    6. Index imports
    7. Unknown / side-effect imports

* One empty line between groups

* Alphabetize within groups (case-insensitive)

---

### TypeScript Rules

* `strict` mode enabled everywhere

#### Common

* No `any`
* Strong typing required
* No framework-specific dependencies

#### Backend (`klurigo-service`)

* `any` allowed only when justified
* Explicit return types optional
* Prefer DTOs + validation decorators
* Avoid circular dependencies and `forwardRef` unless unavoidable

#### Frontend (`klurigo-web`)

* React components **must** have explicit return types
* Prefer immutable patterns
* Avoid unnecessary memoization

---

### Naming Conventions

* Components: `PascalCase`
* Files: `kebab-case.ts`
* Functions / variables: `camelCase`
* Classes: `PascalCase`
* Enums: `PascalCase.enum.ts`
* Constants: `UPPER_SNAKE_CASE`

Naming must reflect **domain intent**, not implementation details.

---

## Architecture Guidelines

### Frontend (`@klurigo/klurigo-web`)

* React functional components only
* Hooks + Context API
* SCSS modules only (no global CSS)
* Animations must use existing helpers and patterns
* No direct backend assumptions

---

### Backend (`@klurigo/klurigo-service`)

* NestJS modules with strict responsibility boundaries
* Controllers must be thin
* Business logic belongs in services
* Persistence isolated to repositories
* Prefer event-driven patterns over direct cross-module calls

Circular dependencies are treated as architectural defects.

---

### Common (`@klurigo/common`)

* Pure TypeScript only
* No runtime dependencies on frontend or backend
* Used as a shared contract

---

## Testing Guidelines

* Do not rewrite existing tests unless explicitly requested
* Prefer extending coverage over replacing tests
* Avoid unnecessary mocks
* No commented-out tests

### Frontend

* Vitest + Testing Library
* No mocking of SCSS unless required
* Avoid mocking React state unless unavoidable

### Backend / Common

* Jest
* Favor real implementations over mocks where possible

---

## Git and CI Expectations

* Each logical change should be a separate commit
* Commits should be small, focused, and reversible
* CI assumes root-level scripts

Breaking any of the rules above may result in rejected changes or failing CI.
