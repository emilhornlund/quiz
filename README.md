<img src="https://github.com/emilhornlund/quiz/blob/main/.github/screenshot.png" alt="klurigo banner" align="center" />

# Klurigo – formerly “Quiz”

[![Main](https://github.com/emilhornlund/quiz/actions/workflows/main.yml/badge.svg)](https://github.com/emilhornlund/quiz/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/emilhornlund/quiz/graph/badge.svg?token=TO2S69Y1MZ)](https://codecov.io/gh/emilhornlund/quiz)

> **Branding update:** The game platform is now branded **Klurigo**, even though the repository, packages, and build artefacts still use the original *quiz* namespace.
>
> • **Website:** [https://klurigo.com](https://klurigo.com) | **Public Beta:** [https://beta.klurigo.com](https://beta.klurigo.com)

A full‑stack quiz game platform built with a modern monorepo setup. It features a shared type system, a NestJS backend, and a Vite‑powered React frontend.

---

## Prerequisites

Before you get started, make sure you have the following installed on your machine:

- **Node.js** v22.12.0 or higher  
  We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage your Node versions.

- **Yarn** v1.22.22 or higher  
  Install via `npm install --global yarn` if you don’t already have it.

- **Git**  
  To clone and manage the repository.

- **Docker & Docker Compose** (optional)  
  If you prefer to run your database and cache in containers.

## Monorepo Structure

This project uses [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to manage multiple packages:

```text
quiz/
├── packages/
│   ├── common          # Shared models and utilities
│   ├── quiz            # Frontend app (Vite + React)
│   └── quiz-service    # Backend service (NestJS)
```

## Scripts

The root `package.json` contains orchestration scripts for development, building, and testing:

**Scripts:**

- `yarn dev` – Run frontend, backend, and Storybook in parallel.
- `yarn serve` – Serve both frontend and backend builds.
- `yarn build` – Build all packages.
- `yarn clean` – Clean all packages.
- `yarn lint` / `yarn lint:fix` – Run linting across all packages.
- `yarn test` – Run all tests concurrently.
- `yarn prepare` – Initialize `husky` (if configured).

## Packages

### [`@quiz/common`](./packages/common)

Shared models and validation logic between the backend and frontend.

- Outputs both CommonJS and ESM modules.
- Consumed by `@quiz/quiz` and `@quiz/quiz-service`.

**Scripts:**

- `yarn build` – Clean and compile.
- `yarn lint` / `yarn lint:fix` – Lint the codebase.

### [`@quiz/quiz`](./packages/quiz)

Frontend application built with **React**, **Vite**, and **Storybook**.

**Features:**

- Vite dev server and production builds.
- Component testing with Vitest.
- Storybook integration for UI components.

**Scripts:**

- `yarn dev` – Start the Vite dev server.
- `yarn build` – Production build.
- `yarn serve` – Preview the built app.
- `yarn test` / `test:watch` / `test:update` – Run tests.
- `yarn storybook` / `build-storybook` – Start or build Storybook.
- `yarn lint` / `lint:fix` – Lint the codebase.

### [`@quiz/quiz-service`](./packages/quiz-service)

Backend API built with **NestJS**, using SSE for real‑time updates.

**Features:**

- Game state and lifecycle management.
- Shared types from `@quiz/common`.
- Jest-based test suite.
- Circular dependency detection.

**Scripts:**

- `yarn dev` – Start the NestJS app in watch mode.
- `yarn build` – Compile for production.
- `yarn serve` – Run the compiled app.
- `yarn test` / `test:watch` / `test:coverage` – Run backend tests.
- `yarn check-circular-deps` – Check for circular imports.
- `yarn lint` / `lint:fix` – Lint the codebase.

---

## Development

Clone the repo and install dependencies:

```sh
git clone git@github.com:emilhornlund/quiz.git
cd quiz
yarn install
yarn workspace @quiz/common build
```

To start everything in dev mode:

```sh
yarn dev
```

### Running individual workspaces

```sh
# Frontend
yarn workspace @quiz/quiz dev

# Backend
yarn workspace @quiz/quiz-service dev

# Storybook
yarn workspace @quiz/quiz storybook
```

### Local infrastructure helpers

Spin up **MongoDB** and **Redis** containers the quick way:

```sh
docker compose up -d
```

The default `docker-compose.yml` provides sensible development‑only images with exposed ports matching the backend configuration.

---

## End-to-End Tests (Playwright)

The frontend application includes end-to-end tests written with **Playwright**. These tests run against the real frontend and backend, using a dedicated test database and Redis instance that is automatically reset and seeded before execution.

### Prerequisites

Playwright requires browser binaries to be installed once on your machine.

```sh
yarn workspace @quiz/quiz playwright install
```

On Linux (for example in CI), system dependencies may also be required:

```sh
yarn workspace @quiz/quiz playwright install --with-deps
```

### Run locally

```sh
yarn workspace @quiz/quiz test:e2e
```

This will:
- Start the frontend (Vite dev server)
- Start the backend in test mode
- Reset and seed MongoDB and Redis
- Run Playwright tests across Chromium, Firefox, and WebKit

### CI behavior

End-to-end tests are **disabled by default** in CI and are only executed for selected workflows (for example on `main` and production deploys).

---

## CI/CD & Deployment

All build, test, release, and deployment steps are now handled automatically by **GitHub Actions**. On every push and pull request the pipeline validates the codebase, and on merges to `main` it:

1. Builds the frontend and backend Docker images.
2. Runs the test suites.
3. Tags the images with the current commit SHA and a semver tag (on release).
4. Pushes artefacts to the configured container registry.
5. Updates the production environment via the deployment workflow.

---

## License

This project is source-available and licensed for non-commercial use only.

You are free to read, learn from, and modify the code for personal or
educational purposes. Commercial use, including offering the software
as a hosted or SaaS service, is not permitted without explicit written
permission from the author.

If you are interested in using this project commercially, please
contact the author to discuss licensing options.

[See the LICENSE file for full terms.](./LICENSE)
