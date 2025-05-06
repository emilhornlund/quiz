# Quiz

A full-stack quiz game platform built with a modern monorepo setup. It features a shared type system, a NestJS backend, and a Vite-powered React frontend.

## Monorepo Structure

This project uses [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to manage multiple packages:

```
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
Backend API built with **NestJS**, using SSE for real-time updates.

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

## Development

Clone the repo and install dependencies:

```sh
git clone git@github.com:emilhornlund/quiz.git
cd quiz
yarn install
```

To start everything in dev mode:

```sh
yarn dev
```

Or start individual packages:

```sh
# Frontend
yarn workspace @quiz/quiz dev

# Backend
yarn workspace @quiz/quiz-service dev

# Storybook
yarn workspace @quiz/quiz storybook
```

## Deployment

Deploy to my local NAS Docker registry using:

```sh
./deploy-nas.sh
```

This script:

* Builds Docker images for both the backend and frontend.
* Tags them with the current Git commit SHA.
* Pushes to your registry at `192.168.0.65:9500`.

## License

MIT
