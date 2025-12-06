# AGENTS.md

## Build/Lint/Test Commands

### Root Commands

- `yarn build` - Build all packages
- `yarn lint` - Lint all packages
- `yarn lint:fix` - Auto-fix linting issues across all packages
- `yarn test` - Run tests for all packages concurrently
- `yarn test:coverage` - Run tests with coverage for all packages

### Package-Specific Commands

#### Frontend (@quiz/quiz - Vitest)

- `yarn workspace @quiz/quiz test` - Run all frontend tests
- `yarn workspace @quiz/quiz test:watch` - Run tests in watch mode
- `yarn workspace @quiz/quiz test:update` - Update snapshots
- `yarn workspace @quiz/quiz test:coverage` - Run tests with coverage
- `yarn workspace @quiz/quiz vitest run path/to/file.test.ts` - Run single test file

#### Backend (@quiz/quiz-service - Jest)

- `yarn workspace @quiz/quiz-service test` - Run all backend tests
- `yarn workspace @quiz/quiz-service test:coverage` - Run tests with coverage
- `yarn workspace @quiz/quiz-service jest path/to/file.spec.ts` - Run single test file

#### Common (@quiz/common - Jest)

- `yarn workspace @quiz/common test` - Run all common tests
- `yarn workspace @quiz/common test:coverage` - Run tests with coverage
- `yarn workspace @quiz/common jest path/to/file.spec.ts` - Run single test file

## Code Style Guidelines

### Formatting

- Use Prettier with config: bracketSameLine=true, bracketSpacing=true, printWidth=80, semi=false, singleQuote=true, tabWidth=2, trailingComma=all
- No semicolons, single quotes, 2-space indentation

### Imports

- Group imports: builtin → external → internal → parent → sibling → index → unknown
- Add newlines between import groups
- Alphabetize imports within groups (case-insensitive ascending)
- Use `sort-imports` rule with ignoreCase=true, ignoreDeclarationSort=true

### TypeScript

- Strict typing enabled
- Backend allows `any` types (@typescript-eslint/no-explicit-any: off)
- Backend doesn't require explicit function return types (@typescript-eslint/explicit-function-return-type: off)
- Frontend requires explicit return types for React components

### Naming Conventions

- Components: PascalCase (e.g., `Button`, `AuthLoginPage`)
- Files: kebab-case (e.g., `auth-login-page.tsx`, `email.service.ts`)
- Variables/Functions: camelCase
- Classes: PascalCase
- Enums: PascalCase with .enum.ts extension
- Constants: UPPER_SNAKE_CASE

### Error Handling

- Backend: Use NestJS Logger for logging, try-catch blocks with proper error messages
- Frontend: React Error Boundaries and proper error states
- Log errors with context (message, stack trace)

### Comments

- Use JSDoc comments for classes, methods, and complex logic
- Prefer self-documenting code over comments
- Backend services include detailed JSDoc for all public methods

### Architecture Patterns

- Frontend: React functional components with hooks, Context API for state management
- Backend: NestJS with dependency injection, modules, controllers, services
- Shared: Common package for shared types and utilities
- Testing: Vitest for frontend, Jest for backend/common, comprehensive test coverage</content>
  <parameter name="filePath">/home/emilhornlund/projects/quiz/AGENTS.md
