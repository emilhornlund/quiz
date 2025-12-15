# Circular Dependency Elimination Plan

## Overview

This document provides a comprehensive refactoring plan to eliminate the 12 circular dependencies currently present in the quiz-service codebase. The plan establishes a clear module hierarchy and introduces orchestration patterns to prevent future regressions.

## Current State

The codebase currently has 12 circular dependencies as identified by madge:

1. Authentication decorators → guards coupling
2. User repository → service utils coupling
3. Game utils complex web (4 related cycles)
4. Auth service → User service coupling
5. Module-level dependencies (3 related cycles)

## A) Dependency Hierarchy Proposal

### Layer Structure (Bottom → Top)

#### 1. Core/Shared Layer (`modules/shared/`)

- **Purpose:** Common utilities, constants, interfaces
- **Contents:** Base classes, abstract types, pure functions
- **Dependencies:** None (no dependencies on other modules)
- **Modules:** `shared/auth/`, `shared/user/`, `shared/game/`

#### 2. Domain Layer (`modules/{domain}/`)

- **Purpose:** Pure domain logic and data access
- **Contents:** Repositories, models, domain services
- **Dependencies:** Core/Shared layer only
- **Modules:** `user/`, `game/`, `quiz/`, `authentication/`

#### 3. Cross-Cutting Layer (`modules/cross-cutting/`)

- **Purpose:** Shared concerns and orchestration
- **Contents:** Guards, decorators, middleware, event handlers
- **Dependencies:** Domain layer, Core/Shared layer
- **Modules:** `cross-cutting/user-auth-orchestrator/`

#### 4. Application Layer (`modules/app/`)

- **Purpose:** Application coordination and entry points
- **Contents:** Controllers, orchestration modules, DI setup
- **Dependencies:** All layers below
- **Modules:** `app/orchestration/`

### Allowed Dependencies Rules

```
✓ Domain → Core/Shared
✓ Cross-Cutting → Domain, Core/Shared
✓ Application → Cross-Cutting, Domain, Core/Shared
✗ Domain ↔ Domain (use orchestrator)
✗ Cross-Cutting ↔ Cross-Cutting
```

## B) Cycle-by-Cycle Diagnosis and Fix Strategy

### Cycles 1, 8, 9: Decorator → Guard Coupling

**Current Cycle Path:**

```
decorators/index.ts → decorators/auth/index.ts → jwt-payload.decorator.ts → guards/index.ts → auth.guard.ts
```

**Root Cause:** Decorators import guards for type definitions (`AuthGuardRequest<T>`), creating circular dependencies through barrel exports.

**Fix Strategy:** Extract shared interfaces to `modules/shared/auth/`

- Create `auth-guard.interface.ts` with `AuthGuardRequest<T>` type
- Move decorator constants to `modules/shared/auth/decorator-constants.ts`
- Guards depend on shared interfaces, decorators depend only on constants

**Desired After State:** Decorators and guards are independent, both depend on shared interfaces.

### Cycle 2: Repository → Service Utils Coupling

**Current Cycle Path:**

```
repositories/index.ts → user.repository.ts → services/utils/index.ts → user.utils.ts
```

**Root Cause:** Repository imports service utilities for type guards (`isGoogleUser`, `isLocalUser`).

**Fix Strategy:** Extract type guards to `modules/shared/user/type-guards.ts`

- Move `isGoogleUser`, `isLocalUser`, etc. to shared location
- Repository and services both import from shared

**Desired After State:** Repository and services are independent, both depend on shared type guards.

### Cycles 3, 4, 5, 6: Game Utils Complex Web

**Current Cycle Paths:**

```
question-answer.utils.ts → events/index.ts → distribution.utils.ts
game-event.utils.ts → game-question-event.utils.ts → question-answer.utils.ts → events/index.ts
game-question-event.utils.ts → question-answer.utils.ts → events/index.ts
question-answer.utils.ts → events/index.ts → game-result-event.utils.ts → tasks/index.ts → task-question-result.utils.ts → scoring/index.ts → scoring-engine.ts
```

**Root Cause:** Game utility modules have circular dependencies through event distribution and scoring workflows.

**Fix Strategy:** Create `modules/game/orchestration/` with:

- `GameEventOrchestrator` - coordinates event building and distribution
- `GameScoringOrchestrator` - coordinates scoring workflows
- Extract pure utilities to `modules/shared/game/`

**Desired After State:** Utils are pure functions, orchestrators handle coordination.

### Cycle 7: Auth Service → User Service Coupling

**Current Cycle Path:**

```
services/index.ts → auth.service.ts → user/services/index.ts → user.service.ts
```

**Root Cause:** Auth service directly imports User service for user-related operations.

**Fix Strategy:** Create `modules/cross-cutting/user-auth-orchestrator/`

- Move user-related auth logic to orchestrator
- Auth service depends on orchestrator interface
- User service remains independent

**Desired After State:** Auth and User services are independent, orchestrator mediates.

### Cycles 10, 11, 12: Module-Level Dependencies

**Current Cycle Paths:**

```
authentication/index.ts → authentication.module.ts → game/index.ts → game.module.ts → user/index.ts → user.module.ts
game/index.ts → game.module.ts → user/index.ts → user.module.ts → migration/index.ts → migration.module.ts
user/index.ts → user.module.ts → migration/index.ts → migration.module.ts
```

**Root Cause:** Module imports create cycles through `forwardRef()` usage.

**Fix Strategy:** Create `modules/app/orchestration/` with:

- `UserGameMigrationOrchestrator` - handles cross-module workflows
- Remove direct module dependencies
- Use dependency injection at service level

**Desired After State:** Modules are independent, orchestrator handles cross-module coordination.

## C) New Modules to Introduce

### 1. `modules/shared/auth/`

**Location:** `packages/quiz-service/src/modules/shared/auth`

**Responsibility:** Shared authentication types and constants

**Exports:**

- `AuthGuardRequest<T>` interface
- Decorator constants (`IS_PUBLIC_KEY`, `REQUIRED_AUTHORITIES_KEY`, `REQUIRED_SCOPES_KEY`)
- Auth-related interfaces

**Must NOT import:** Any domain modules

### 2. `modules/shared/user/`

**Location:** `packages/quiz-service/src/modules/shared/user`

**Responsibility:** User type guards and shared utilities

**Exports:**

- `isGoogleUser`, `isLocalUser`, `isNoneUser` type guards
- User type utilities
- User-related constants

**Must NOT import:** User service or repository

### 3. `modules/shared/game/`

**Location:** `packages/quiz-service/src/modules/shared/game`

**Responsibility:** Pure game utilities and constants

**Exports:**

- Game constants
- Pure utility functions (non-coordinating)
- Game-related type guards

**Must NOT import:** Game services or repositories

### 4. `modules/game/orchestration/`

**Location:** `packages/quiz-service/src/modules/game/orchestration`

**Responsibility:** Game event and scoring orchestration

**Exports:**

- `GameEventOrchestrator` - coordinates event building and distribution
- `GameScoringOrchestrator` - coordinates scoring workflows
- Orchestration interfaces

**Must NOT import:** Other orchestrators

### 5. `modules/cross-cutting/user-auth-orchestrator/`

**Location:** `packages/quiz-service/src/modules/cross-cutting/user-auth-orchestrator`

**Responsibility:** User-authentication coordination

**Exports:**

- `UserAuthOrchestrator` interface and implementation
- User-auth coordination utilities

**Must NOT import:** Direct service dependencies

### 6. `modules/app/orchestration/`

**Location:** `packages/quiz-service/src/modules/app/orchestration`

**Responsibility:** Cross-module workflow orchestration

**Exports:**

- `UserGameMigrationOrchestrator`
- Cross-module coordination interfaces

**Must NOT import:** Direct module dependencies

## D) Implementation Sequence

| Step | Cycles Eliminated | Expected Count After | Validation Commands                                                                                                                         |
|------|-------------------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| 1    | 1, 2, 8, 9        | 8                    | `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test`                                           |
| 2    | 3, 4, 5, 6        | 4                    | `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test`                                           |
| 3    | 7                 | 3                    | `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test`                                           |
| 4    | 10, 11, 12        | 0                    | `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test`                                           |
| 5    | N/A               | 0                    | `yarn workspace @quiz/quiz-service test && yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service lint` |

### Step 1: Create Shared Infrastructure

**Scope:** Create `modules/shared/` structure

**Actions:**

1. Create `modules/shared/auth/` with interfaces and constants
2. Create `modules/shared/user/` with type guards
3. Create `modules/shared/game/` with pure utilities
4. Update imports in dependent files
5. Remove old barrel exports that cause cycles

**Files Affected:**

- `modules/authentication/controllers/decorators/auth/jwt-payload.decorator.ts`
- `modules/authentication/guards/auth.guard.ts`
- `modules/user/repositories/user.repository.ts`
- `modules/user/services/utils/user.utils.ts`
- All related index.ts files

**Validation:**

```bash
yarn workspace @quiz/quiz-service check-circular-deps  # Expect 8 cycles remaining
yarn workspace @quiz/quiz-service test                 # Ensure all tests pass
yarn workspace @quiz/quiz-service lint                 # Ensure code quality
yarn workspace @quiz/quiz-service build                # Build to ensure no compilation errors
```

**Expected Impact:** Eliminates cycles 1, 2, 8, 9

#### Definition of Done

- Cycles eliminated: 1, 2, 8, 9
- Expected cycle count after step: 8
- `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test` passes
- Shared extractions completed:
  - `modules/shared/auth/` contains `AuthGuardRequest<T>` (or equivalent) and decorator constants
  - `modules/shared/user/` contains user type guards (`isGoogleUser`, `isLocalUser`, `isNoneUser` or equivalent)
- Affected files no longer import across the previous boundaries:
  - Decorators do not import guards (directly or via barrels)
  - User repository does not import service utils (directly or via barrels)

#### Rollback

- `git revert <commit>` for the Step 1 change set
- Roll back if any of the following occur:
  - `yarn workspace @quiz/quiz-service test` fails
  - `yarn workspace @quiz/quiz-service check-circular-deps` reports more than 8 cycles
  - `yarn workspace @quiz/quiz-service build` fails (if run in CI for this repo)

### Step 2: Extract Game Orchestration

**Scope:** Game utils and event handling

**Actions:**

1. Create `modules/game/orchestration/` module
2. Move coordination logic to `GameEventOrchestrator` and `GameScoringOrchestrator`
3. Refactor utils to pure functions in `modules/shared/game/`
4. Update service imports to use orchestrators
5. Remove circular imports between game utils

**Files Affected:**

- `modules/game/services/utils/question-answer.utils.ts`
- `modules/game/services/utils/events/*`
- `modules/game/services/utils/tasks/*`
- `modules/game/services/utils/scoring/*`
- Game service files

**Validation:**

```bash
yarn workspace @quiz/quiz-service check-circular-deps  # Expect 4 cycles remaining
yarn workspace @quiz/quiz-service test                 # Ensure all tests pass
yarn workspace @quiz/quiz-service lint                 # Ensure code quality
yarn workspace @quiz/quiz-service build                # Build to ensure no compilation errors
```

**Expected Impact:** Eliminates cycles 3, 4, 5, 6

#### Definition of Done

- Cycles eliminated: 3, 4, 5, 6
- Expected cycle count after step: 4
- `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test` passes
- After constraints for Step 2:
  - `modules/game/services/utils/**` contains no imports from `modules/game/orchestration/**` and does not instantiate or coordinate scoring/event workflows (only pure helpers/types)
  - orchestration exists under `modules/game/orchestration/**` and coordinates event/scoring workflows
  - cycle paths 3-6 can no longer occur (no imports from question-answer utils into events barrels causing loops)

#### Rollback

- `git revert <commit>` for the Step 2 change set
- Roll back if any of the following occur:
  - `yarn workspace @quiz/quiz-service test` fails
  - `yarn workspace @quiz/quiz-service check-circular-deps` reports more than 4 cycles
  - `yarn workspace @quiz/quiz-service build` fails

### Step 3: Create User-Auth Orchestrator

**Scope:** Auth and User service coupling

**Actions:**

1. Create `modules/cross-cutting/user-auth-orchestrator/`
2. Move user-related auth logic to orchestrator
3. Update Auth service to use orchestrator interface
4. Remove direct Auth → User service dependency
5. Update module imports

**Files Affected:**

- `modules/authentication/services/auth.service.ts`
- `modules/user/services/user.service.ts`
- `modules/authentication/authentication.module.ts`
- New orchestrator files

**Validation:**

```bash
yarn workspace @quiz/quiz-service check-circular-deps  # Expect 3 cycles remaining
yarn workspace @quiz/quiz-service test                 # Ensure all tests pass
yarn workspace @quiz/quiz-service lint                 # Ensure code quality
yarn workspace @quiz/quiz-service build                # Build to ensure no compilation errors
```

**Expected Impact:** Eliminates cycle 7

#### Definition of Done

- Cycles eliminated: 7
- Expected cycle count after step: 3
- `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test` passes
- Auth no longer imports User service (directly or via barrel index)
- New orchestrator exists at `modules/cross-cutting/user-auth-orchestrator/` and is the only allowed integration point between auth and user services
- `AuthService` depends on an orchestrator interface/token (provided by `user-auth-orchestrator`) and has no imports from `modules/user/services/**`

#### Rollback

- `git revert <commit>` for the Step 3 change set
- Roll back if any of the following occur:
  - `yarn workspace @quiz/quiz-service test` fails
  - `yarn workspace @quiz/quiz-service check-circular-deps` reports more than 3 cycles
  - `yarn workspace @quiz/quiz-service build` fails

### Step 4: Create App-Level Orchestration

**Scope:** Module-level dependencies

**Actions:**

1. Create `modules/app/orchestration/` module
2. Create `UserGameMigrationOrchestrator` for cross-module workflows
3. Remove `forwardRef()` from module definitions
4. Update module imports to use orchestrators
5. Refactor cross-module service dependencies

**Files Affected:**

- `modules/authentication/authentication.module.ts`
- `modules/game/game.module.ts`
- `modules/user/user.module.ts`
- `modules/migration/migration.module.ts`
- All module index.ts files

**Validation:**

```bash
yarn workspace @quiz/quiz-service check-circular-deps  # Expect 0 cycles remaining
yarn workspace @quiz/quiz-service test                 # Ensure all tests pass
yarn workspace @quiz/quiz-service lint                 # Ensure code quality
yarn workspace @quiz/quiz-service build                # Build to ensure no compilation errors
```

**Expected Impact:** Eliminates cycles 10, 11, 12

#### Definition of Done

- Cycles eliminated: 10, 11, 12
- Expected cycle count after step: 0
- `yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service test` passes
- No `forwardRef()` remains in module definitions under `modules/authentication/**`, `modules/game/**`, `modules/user/**`, `modules/migration/**`
- Orchestration module exists at `modules/app/orchestration/` and is the only allowed place for cross-module coordination between game/user/migration/authentication
- Module-level circular import chain shown in cycles 10–12 can no longer occur (no module barrels pulling in each other)

#### Rollback

- `git revert <commit>` for the Step 4 change set
- Roll back if any of the following occur:
  - `yarn workspace @quiz/quiz-service test` fails
  - `yarn workspace @quiz/quiz-service check-circular-deps` reports more than 0 cycles
  - `yarn workspace @quiz/quiz-service build` fails

### Step 5: Barrel File Cleanup

**Scope:** All index.ts files

**Actions:**

1. Review and remove unnecessary barrel exports
2. Split public API vs internal exports
3. Update direct imports where needed
4. Establish barrel file policy compliance

**Files Affected:**

- All `index.ts` files in the codebase
- Files that use barrel imports

**Validation:**

```bash
yarn workspace @quiz/quiz-service test                 # Ensure all tests pass
yarn workspace @quiz/quiz-service check-circular-deps  # Confirm 0 cycles
yarn workspace @quiz/quiz-service lint                 # Ensure code quality
yarn workspace @quiz/quiz-service build                # Build to ensure no compilation errors
```

**Expected Impact:** Prevents future barrel-induced cycles

#### Definition of Done

- Expected cycle count after step: 0
- `yarn workspace @quiz/quiz-service test && yarn workspace @quiz/quiz-service check-circular-deps && yarn workspace @quiz/quiz-service lint && yarn workspace @quiz/quiz-service build` passes
- Public API barrels exist only at module root `index.ts`
- No internal barrels re-export mixed concerns (services + guards + decorators)
- Deep barrels like `controllers/decorators/auth/index.ts` are no longer imported anywhere in the codebase
- Internal imports within a module use direct file imports, not barrels

#### Rollback

- Git revert of this step's commit
- Rollback conditions: lint failures, test failures, or new circular dependencies introduced

## E) Barrel File Policy

### Allowed Barrel Files

#### Public API Barrels

- **Location:** Module root `index.ts`
- **Purpose:** Export only public interfaces and services
- **Example:**

```typescript
// modules/user/index.ts
export { UserService, UserRepository } from './services'
export { User, UserModel } from './repositories/models'
export type { UserDocument } from './repositories/models/schemas'
```

#### Feature Grouping Barrels

- **Location:** Within shared modules for related utilities
- **Purpose:** Group related pure functions and types
- **Example:**

```typescript
// modules/shared/user/index.ts
export { isGoogleUser, isLocalUser } from './type-guards'
export type { UserGuard } from './types'
```

### Forbidden Barrel Patterns

#### Mixed Barrels

- **Problem:** Don't export services, repositories, and utilities from same index
- **Example of what to avoid:**

```typescript
// ❌ BAD: Mixed barrel
export * from './authentication.module' // Module
export * from './services/auth.service' // Service
export * from './guards/auth.guard' // Guard
export * from './controllers/decorators' // Decorators
```

#### Deep Barrels

- **Problem:** Avoid excessive nesting like `controllers/decorators/auth/index.ts`
- **Solution:** Use direct imports or flatten structure

#### Circular Barrels

- **Problem:** Never export modules that import each other
- **Solution:** Use shared modules or orchestrators

### Direct Import Guidelines

1. **Use direct imports for internal module dependencies**
2. **Reserve barrel imports for external module usage**
3. **Prefer explicit imports over `export *` for internal code**
4. **Import specific files when importing within the same module**

### Recommended Import Patterns

```typescript
// ✅ GOOD: External module usage
import { UserService, UserRepository } from '../user'

// ✅ GOOD: Internal module usage
import { AuthService } from './auth.service'
import { TokenRepository } from './token.repository'

// ✅ GOOD: Shared utilities
import { isGoogleUser } from '../../shared/user'

// ❌ AVOID: Internal barrel imports
import * as AuthServices from './services'
```

## Success Criteria

### Technical Criteria

- [ ] `yarn workspace @quiz/quiz-service check-circular-deps` returns 0 circular dependencies
- [ ] All existing tests pass without modification
- [ ] No `forwardRef()` usage in module definitions
- [ ] Clear dependency hierarchy enforced

### Architectural Criteria

- [ ] Shared modules contain no domain logic
- [ ] Domain modules depend only on shared modules
- [ ] Cross-cutting concerns properly isolated
- [ ] Orchestrators handle all cross-module coordination

### Maintainability Criteria

- [ ] Barrel file policy documented and enforced
- [ ] Import patterns consistent across codebase
- [ ] Module boundaries clearly defined
- [ ] Future dependency cycles prevented by design

## Validation Commands

```bash
# Check circular dependencies
yarn workspace @quiz/quiz-service check-circular-deps

# Run all tests
yarn workspace @quiz/quiz-service test

# Check code quality
yarn workspace @quiz/quiz-service lint

# Build to ensure no compilation errors
yarn workspace @quiz/quiz-service build

# Run with coverage to ensure no regressions
yarn test:coverage
```

This plan provides a systematic approach to eliminating all circular dependencies while establishing a maintainable architecture that prevents future regressions.
