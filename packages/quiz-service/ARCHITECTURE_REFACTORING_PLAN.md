# Quiz-Service Architecture Refactoring - Implementation Plan

## Executive Summary

This document outlines a comprehensive refactoring plan to resolve circular dependencies and improve maintainability in the NestJS quiz-service application. The current application has 12 circular dependencies primarily caused by a monolithic GameModule that handles too many responsibilities.

**Current State:**

- 12 circular dependencies
- GameModule contains 185 files (44% of codebase)
- Excessive use of `forwardRef()` indicating architectural problems
- Scattered authentication logic across modules

**Target State:**

- 0 circular dependencies
- Modular architecture with clear separation of concerns
- Centralized authentication and shared infrastructure
- Domain-driven module organization

## Project Context

### Current Architecture Issues

1. **GameModule God Object**: Handles game lifecycle, scoring, events, tasks, results, and authentication
2. **Circular Dependencies**: AuthModule ↔ GameModule ↔ UserModule ↔ MigrationModule
3. **Scattered Authentication**: Each module has its own auth decorators/guards
4. **Migration Module Dependencies**: Needs access to Game, Quiz, and User repositories
5. **Complex Internal Dependencies**: Utility files importing each other in loops

### Target Architecture

```
packages/quiz-service/src/
├── app/                          # Core application setup
│   ├── config/
│   ├── controllers/
│   ├── decorators/
│   ├── exceptions/
│   ├── filters/
│   ├── shared/                   # Base repository, common interfaces
│   ├── utils/
│   └── app.module.ts
├── modules/                      # All feature modules
│   ├── shared/                   # Infrastructure & shared utilities
│   ├── authentication/           # Centralized auth
│   ├── domain-events/            # Cross-module communication
│   ├── user/                     # Domain module
│   ├── quiz/                     # Domain module
│   ├── game-core/                # Essential game logic only
│   ├── game-scoring/             # Extracted from game
│   ├── game-events/              # Extracted from game
│   ├── game-tasks/               # Extracted from game
│   ├── game-results/             # Extracted from game
│   ├── migration/                # Refactored
│   ├── media/                    # Existing module
│   ├── email/                    # Existing module
│   └── health/                   # Infrastructure
├── main.ts
└── instrument.ts
```

## Implementation Phases

### Phase 0: Preparation (No Breaking Changes)

#### Step 0.1: Create Migration Scripts

**Objective:** Establish monitoring and testing infrastructure

**Tasks:**

1. **Enhance Circular Dependency Script**
   - Location: `packages/quiz-service/scripts/check_circular_deps.sh`
   - Update to set error limit to 0 for final state
   - Add detailed output showing dependency chains
   - Integrate into CI/CD pipeline

2. **Create Architecture Tests**
   - Create test file: `packages/quiz-service/test/architecture.spec.ts`
   - Add tests to verify module boundaries
   - Add tests to prevent circular dependencies
   - Add tests to verify dependency direction rules

3. **Establish Baseline Metrics**
   - Run circular dependency check: `./scripts/check_circular_deps.sh 12`
   - Document current dependency chains
   - Create performance benchmarks
   - Document test coverage baseline

**Acceptance Criteria:**

- Circular dependency script integrated in CI/CD
- Architecture tests passing
- Baseline metrics documented
- All existing tests passing

**Status:** COMPLETED

#### Step 0.2: Create New Directory Structure

**Objective:** Prepare target directory structure without moving files

**Tasks:**

1. **Create Modules Directory**

   ```bash
   mkdir -p packages/quiz-service/src/modules
   ```

2. **Create Module Sub-directories**

   ```bash
   # Create all target module directories
   mkdir -p packages/quiz-service/src/modules/{shared,authentication,domain-events,user,quiz,game-core,game-scoring,game-events,game-tasks,game-results,migration,media,email,health}
   ```

3. **Add .gitkeep Files**

   ```bash
   # Add .gitkeep to maintain empty directories in git
   touch packages/quiz-service/src/modules/.gitkeep
   touch packages/quiz-service/src/modules/*/.gitkeep
   ```

4. **Create Module Structure Templates**
   - Create basic module file structure for each new module
   - Add placeholder files with TODO comments
   - Create index.ts files for proper exports

**Acceptance Criteria:**

- All target directories created
- .gitkeep files added
- Basic structure templates in place
- No existing functionality affected

**Status:** COMPLETED

### Phase 1: Move Existing Modules (Low Risk)

#### Step 1.1: Move Health Module

**Objective:** Relocate health module to new structure

**Tasks:**

1. **Move Health Module Files**

   ```bash
   mv packages/quiz-service/src/health/* packages/quiz-service/src/modules/health/
   rmdir packages/quiz-service/src/health
   ```

2. **Update Import Paths**
   - Search for imports from `src/health`
   - Replace with `src/modules/health`
   - Update in `app.module.ts`

3. **Update Health Module**
   - Ensure `health.module.ts` exports are correct
   - Verify all imports within health module are relative

4. **Test Health Functionality**
   - Run health-related tests
   - Verify health endpoints work
   - Check CI/CD health checks

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/health`

**Acceptance Criteria:**

- Health module successfully moved
- All import paths updated
- Health functionality working
- All tests passing

**Status:** COMPLETED

#### Step 1.2: Move Email Module

**Objective:** Relocate email module to new structure

**Tasks:**

1. **Move Email Module Files**

   ```bash
   mv packages/quiz-service/src/email/* packages/quiz-service/src/modules/email/
   rmdir packages/quiz-service/src/email
   ```

2. **Update Import Paths**
   - Search for imports from `src/email`
   - Replace with `src/modules/email`
   - Update in `app.module.ts`

3. **Update Email Module**
   - Verify email service configuration
   - Check email templates and static files

4. **Test Email Functionality**
   - Run email-related tests
   - Verify email sending works
   - Check email service integration

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/email`

**Acceptance Criteria:**

- Email module successfully moved
- All import paths updated
- Email functionality working
- All tests passing

**Status:** COMPLETED

#### Step 1.3: Move Media Module

**Objective:** Relocate media module to new structure

**Tasks:**

1. **Move Media Module Files**

   ```bash
   mv packages/quiz-service/src/media/* packages/quiz-service/src/modules/media/
   rmdir packages/quiz-service/src/media
   ```

2. **Update Import Paths**
   - Search for imports from `src/media`
   - Replace with `src/modules/media`
   - Update in `app.module.ts`

3. **Update Media Module**
   - Verify media service configuration
   - Check file upload paths and permissions

4. **Test Media Functionality**
   - Run media-related tests
   - Verify file upload works
   - Check media search functionality

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/media`

**Acceptance Criteria:**

- Media module successfully moved
- All import paths updated
- Media functionality working
- All tests passing

#### Step 1.4: Move User Module

**Objective:** Relocate user module to new structure

**Tasks:**

1. **Move User Module Files**

   ```bash
   mv packages/quiz-service/src/user/* packages/quiz-service/src/modules/user/
   rmdir packages/quiz-service/src/user
   ```

2. **Update Import Paths**
   - Search for imports from `src/user`
   - Replace with `src/modules/user`
   - Update in `app.module.ts`

3. **Update User Module**
   - Verify user service configuration
   - Check user-related repositories and models

4. **Test User Functionality**
   - Run user-related tests
   - Verify user CRUD operations
   - Check user authentication integration

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/user`

**Acceptance Criteria:**

- User module successfully moved
- All import paths updated
- User functionality working
- All tests passing

#### Step 1.5: Move Quiz Module

**Objective:** Relocate quiz module to new structure

**Tasks:**

1. **Move Quiz Module Files**

   ```bash
   mv packages/quiz-service/src/quiz/* packages/quiz-service/src/modules/quiz/
   rmdir packages/quiz-service/src/quiz
   ```

2. **Update Import Paths**
   - Search for imports from `src/quiz`
   - Replace with `src/modules/quiz`
   - Update in `app.module.ts`

3. **Update Quiz Module**
   - Verify quiz service configuration
   - Check quiz-related repositories and models

4. **Test Quiz Functionality**
   - Run quiz-related tests
   - Verify quiz CRUD operations
   - Check quiz game integration

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/quiz`

**Acceptance Criteria:**

- Quiz module successfully moved
- All import paths updated
- Quiz functionality working
- All tests passing

#### Step 1.6: Move Auth Module

**Objective:** Relocate and rename auth module to authentication

**Tasks:**

1. **Move Auth Module Files**

   ```bash
   mv packages/quiz-service/src/auth/* packages/quiz-service/src/modules/authentication/
   rmdir packages/quiz-service/src/auth
   ```

2. **Rename Auth Module**
   - Rename `auth.module.ts` to `authentication.module.ts`
   - Update class name from `AuthModule` to `AuthenticationModule`
   - Update all exports and imports

3. **Update Import Paths**
   - Search for imports from `src/auth`
   - Replace with `src/modules/authentication`
   - Update in `app.module.ts`

4. **Test Authentication Functionality**
   - Run authentication-related tests
   - Verify login/logout works
   - Check JWT token handling

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/auth`
- `packages/quiz-service/src/modules/authentication/authentication.module.ts`

**Acceptance Criteria:**

- Auth module moved and renamed to authentication
- All import paths updated
- Authentication functionality working
- All tests passing

#### Step 1.7: Move Migration Module

**Objective:** Relocate migration module to new structure

**Tasks:**

1. **Move Migration Module Files**

   ```bash
   mv packages/quiz-service/src/migration/* packages/quiz-service/src/modules/migration/
   rmdir packages/quiz-service/src/migration
   ```

2. **Update Import Paths**
   - Search for imports from `src/migration`
   - Replace with `src/modules/migration`
   - Update in `app.module.ts`

3. **Update Migration Module**
   - Verify migration service configuration
   - Check migration-related controllers and services

4. **Test Migration Functionality**
   - Run migration-related tests
   - Verify user migration works
   - Check data integrity after migration

**Files to Modify:**

- `packages/quiz-service/src/app.module.ts`
- Any files importing from `src/migration`

**Acceptance Criteria:**

- Migration module successfully moved
- All import paths updated
- Migration functionality working
- All tests passing

**Phase 1 Completion Criteria:**

- All modules moved to `modules/` directory
- No functional changes
- All import paths updated
- All tests passing
- Circular dependency count unchanged (12)

### Phase 2: Extract Game Scoring (Medium Risk)

#### Step 2.1: Create Game Scoring Module Structure

**Objective:** Set up game-scoring module without affecting existing functionality

**Tasks:**

1. **Create Game Scoring Directory Structure**

   ```bash
   mkdir -p packages/quiz-service/src/modules/game-scoring/{strategies,scoring-engine,interfaces,utils}
   ```

2. **Copy Scoring Files from Game Module**

   ```bash
   # Copy scoring strategies
   cp -r packages/quiz-service/src/modules/game/services/utils/scoring/* packages/quiz-service/src/modules/game-scoring/

   # Organize into proper structure
   mv packages/quiz-service/src/modules/game-scoring/classic packages/quiz-service/src/modules/game-scoring/strategies/
   mv packages/quiz-service/src/modules/game-scoring/zero-to-one-hundred packages/quiz-service/src/modules/game-scoring/strategies/
   mv packages/quiz-service/src/modules/game-scoring/core packages/quiz-service/src/modules/game-scoring/scoring-engine/
   ```

3. **Create Game Scoring Module File**
   - Create `packages/quiz-service/src/modules/game-scoring/game-scoring.module.ts`
   - Define module with proper providers and exports
   - Don't import anywhere yet

4. **Create Index Files**
   - Create `index.ts` files for proper exports
   - Ensure all scoring strategies are exported
   - Create proper barrel exports

**Files to Create:**

- `packages/quiz-service/src/modules/game-scoring/game-scoring.module.ts`
- `packages/quiz-service/src/modules/game-scoring/index.ts`
- Various `index.ts` files in subdirectories

**Acceptance Criteria:**

- Game scoring module structure created
- All scoring files copied successfully
- Module file created but not imported
- No existing functionality affected

#### Step 2.2: Create Scoring Module Exports

**Objective:** Define proper interfaces and exports for scoring module

**Tasks:**

1. **Create Scoring Interfaces**
   - Create `packages/quiz-service/src/modules/game-scoring/interfaces/scoring.interface.ts`
   - Define interfaces for scoring strategies
   - Define interfaces for scoring engine

2. **Update Scoring Strategies**
   - Ensure all strategies implement proper interfaces
   - Update exports in strategy files
   - Add proper TypeScript types

3. **Create Scoring Engine Exports**
   - Update scoring-engine exports
   - Ensure proper dependency injection
   - Add proper TypeScript types

4. **Create Module Exports**
   - Update `game-scoring.module.ts` with proper providers
   - Export all scoring strategies
   - Export scoring engine and interfaces

5. **Add Unit Tests**
   - Create test files for scoring module
   - Test all scoring strategies
   - Test scoring engine functionality

**Files to Modify:**

- `packages/quiz-service/src/modules/game-scoring/game-scoring.module.ts`
- All scoring strategy files
- Scoring engine files

**Acceptance Criteria:**

- All scoring interfaces defined
- Module exports properly configured
- Unit tests passing
- No existing functionality affected

#### Step 2.3: Update Game Module to Use Scoring Module

**Objective:** Replace internal scoring with extracted scoring module

**Tasks:**

1. **Import Game Scoring Module**
   - Add `GameScoringModule` to imports in `game.module.ts`
   - Remove `forwardRef()` if no longer needed
   - Update module dependencies

2. **Update Scoring Imports in Game Module**
   - Search for imports from `services/utils/scoring`
   - Replace with imports from `../game-scoring`
   - Update all scoring-related service injections

3. **Remove Scoring Files from Game Module**

   ```bash
   rm -rf packages/quiz-service/src/modules/game/services/utils/scoring
   ```

4. **Update Game Service Dependencies**
   - Update `game.service.ts` to use scoring module exports
   - Update any other services using scoring
   - Ensure proper dependency injection

5. **Test Scoring Integration**
   - Run game-related tests
   - Verify scoring still works
   - Check scoring strategy selection

**Files to Modify:**

- `packages/quiz-service/src/modules/game/game.module.ts`
- `packages/quiz-service/src/modules/game/services/game.service.ts`
- Any other files using scoring utilities

**Acceptance Criteria:**

- Game module imports scoring module
- Scoring files removed from game module
- Scoring functionality working
- Circular dependency count reduced (target: ~10)
- All tests passing

### Phase 3: Create Shared Module (Low Risk)

#### Step 3.1: Extract Common Utilities

**Objective:** Create shared module for common utilities and infrastructure

**Tasks:**

1. **Create Shared Module Structure**

   ```bash
   mkdir -p packages/quiz-service/src/modules/shared/{repository,interfaces,utils,constants,decorators}
   ```

2. **Move App Shared Components**

   ```bash
   # Move base repository
   mv packages/quiz-service/src/app/shared/* packages/quiz-service/src/modules/shared/repository/
   ```

3. **Extract Common Utilities**
   - Search for duplicate utilities across modules
   - Move common utilities to shared module
   - Create proper interfaces for shared components

4. **Create Shared Module File**
   - Create `packages/quiz-service/src/modules/shared/shared.module.ts`
   - Define module with proper providers and exports
   - Make it a global module if needed

5. **Create Index Files**
   - Create `index.ts` files for proper exports
   - Ensure all shared components are exported
   - Create proper barrel exports

**Files to Create:**

- `packages/quiz-service/src/modules/shared/shared.module.ts`
- `packages/quiz-service/src/modules/shared/index.ts`
- Various `index.ts` files in subdirectories

**Acceptance Criteria:**

- Shared module structure created
- Common utilities extracted
- Module file created with proper exports
- No existing functionality affected

#### Step 3.2: Update Modules to Use Shared

**Objective:** Gradually replace duplicate utilities with shared module

**Tasks:**

1. **Update Authentication Module**
   - Import SharedModule in authentication.module.ts
   - Replace duplicate utilities with shared imports
   - Test authentication functionality

2. **Update User Module**
   - Import SharedModule in user.module.ts
   - Replace duplicate utilities with shared imports
   - Test user functionality

3. **Update Quiz Module**
   - Import SharedModule in quiz.module.ts
   - Replace duplicate utilities with shared imports
   - Test quiz functionality

4. **Update Game Module**
   - Import SharedModule in game.module.ts
   - Replace duplicate utilities with shared imports
   - Test game functionality

5. **Update Remaining Modules**
   - Update migration, media, email, health modules
   - Replace duplicate utilities
   - Test each module independently

**Files to Modify:**

- All module files in `packages/quiz-service/src/modules/`
- Any files using duplicate utilities

**Acceptance Criteria:**

- All modules using shared utilities
- Duplicate code eliminated
- All functionality working
- Code reduced and more maintainable

### Phase 4: Extract Game Events (Medium Risk)

#### Step 4.1: Create Game Events Module

**Objective:** Extract event handling from game module

**Tasks:**

1. **Create Game Events Module Structure**

   ```bash
   mkdir -p packages/quiz-service/src/modules/game-events/{publishers,subscribers,handlers,utils,interfaces}
   ```

2. **Copy Event Files from Game Module**

   ```bash
   # Copy event publishers and subscribers
   cp packages/quiz-service/src/modules/game/services/game-event.publisher.ts packages/quiz-service/src/modules/game-events/publishers/
   cp packages/quiz-service/src/modules/game/services/game-event.subscriber.ts packages/quiz-service/src/modules/game-events/subscribers/

   # Copy event utils
   cp -r packages/quiz-service/src/modules/game/services/utils/events/* packages/quiz-service/src/modules/game-events/utils/
   ```

3. **Create Game Events Module File**
   - Create `packages/quiz-service/src/modules/game-events/game-events.module.ts`
   - Define module with proper providers and exports
   - Include EventEmitterModule dependency

4. **Create Index Files**
   - Create `index.ts` files for proper exports
   - Ensure all event components are exported
   - Create proper barrel exports

**Files to Create:**

- `packages/quiz-service/src/modules/game-events/game-events.module.ts`
- `packages/quiz-service/src/modules/game-events/index.ts`
- Various `index.ts` files in subdirectories

**Acceptance Criteria:**

- Game events module structure created
- All event files copied successfully
- Module file created with proper exports
- No existing functionality affected

#### Step 4.2: Update Game Module

**Objective:** Replace internal event handling with extracted events module

**Tasks:**

1. **Import Game Events Module**
   - Add `GameEventsModule` to imports in `game.module.ts`
   - Remove EventEmitterModule if now handled by GameEventsModule
   - Update module dependencies

2. **Update Event Imports in Game Module**
   - Search for imports from `services/game-event.publisher`
   - Replace with imports from `../game-events`
   - Update all event-related service injections

3. **Remove Event Files from Game Module**

   ```bash
   rm packages/quiz-service/src/modules/game/services/game-event.publisher.ts
   rm packages/quiz-service/src/modules/game/services/game-event.subscriber.ts
   rm -rf packages/quiz-service/src/modules/game/services/utils/events
   ```

4. **Update Game Service Dependencies**
   - Update `game.service.ts` to use events module exports
   - Update any other services using events
   - Ensure proper dependency injection

5. **Test Event Integration**
   - Run game-related tests
   - Verify event publishing still works
   - Check event subscription functionality

**Files to Modify:**

- `packages/quiz-service/src/modules/game/game.module.ts`
- `packages/quiz-service/src/modules/game/services/game.service.ts`
- Any other files using event utilities

**Acceptance Criteria:**

- Game module imports events module
- Event files removed from game module
- Event functionality working
- Circular dependency count reduced (target: ~7)
- All tests passing

### Phase 5: Extract Game Tasks (Medium Risk)

#### Step 5.1: Create Game Tasks Module

**Objective:** Extract task management from game module

**Tasks:**

1. **Create Game Tasks Module Structure**

   ```bash
   mkdir -p packages/quiz-service/src/modules/game-tasks/{schedulers,transition-services,utils,interfaces}
   ```

2. **Copy Task Files from Game Module**

   ```bash
   # Copy task services
   cp packages/quiz-service/src/modules/game/services/game-task-transition*.ts packages/quiz-service/src/modules/game-tasks/transition-services/

   # Copy task utils
   cp -r packages/quiz-service/src/modules/game/services/utils/tasks/* packages/quiz-service/src/modules/game-tasks/utils/
   ```

3. **Create Game Tasks Module File**
   - Create `packages/quiz-service/src/modules/game-tasks/game-tasks.module.ts`
   - Define module with proper providers and exports
   - Include BullModule dependency for task queues

4. **Create Index Files**
   - Create `index.ts` files for proper exports
   - Ensure all task components are exported
   - Create proper barrel exports

**Files to Create:**

- `packages/quiz-service/src/modules/game-tasks/game-tasks.module.ts`
- `packages/quiz-service/src/modules/game-tasks/index.ts`
- Various `index.ts` files in subdirectories

**Acceptance Criteria:**

- Game tasks module structure created
- All task files copied successfully
- Module file created with proper exports
- No existing functionality affected

#### Step 5.2: Update Game Module

**Objective:** Replace internal task management with extracted tasks module

**Tasks:**

1. **Import Game Tasks Module**
   - Add `GameTasksModule` to imports in `game.module.ts`
   - Remove BullModule if now handled by GameTasksModule
   - Update module dependencies

2. **Update Task Imports in Game Module**
   - Search for imports from task services
   - Replace with imports from `../game-tasks`
   - Update all task-related service injections

3. **Remove Task Files from Game Module**

   ```bash
   rm packages/quiz-service/src/modules/game/services/game-task-transition*.ts
   rm -rf packages/quiz-service/src/modules/game/services/utils/tasks
   ```

4. **Update Game Service Dependencies**
   - Update `game.service.ts` to use tasks module exports
   - Update any other services using task utilities
   - Ensure proper dependency injection

5. **Test Task Integration**
   - Run game-related tests
   - Verify task transitions still work
   - Check task scheduling functionality

**Files to Modify:**

- `packages/quiz-service/src/modules/game/game.module.ts`
- `packages/quiz-service/src/modules/game/services/game.service.ts`
- Any other files using task utilities

**Acceptance Criteria:**

- Game module imports tasks module
- Task files removed from game module
- Task functionality working
- Circular dependency count reduced (target: ~5)
- All tests passing

### Phase 6: Extract Game Results (Medium Risk)

#### Step 6.1: Create Game Results Module

**Objective:** Extract result processing from game module

**Tasks:**

1. **Create Game Results Module Structure**

   ```bash
   mkdir -p packages/quiz-service/src/modules/game-results/{processors,converters,repositories,utils,interfaces}
   ```

2. **Copy Result Files from Game Module**

   ```bash
   # Copy result services
   cp packages/quiz-service/src/modules/game/services/game-result.service.ts packages/quiz-service/src/modules/game-results/processors/

   # Copy result repositories
   cp packages/quiz-service/src/modules/game/repositories/game-result.repository.ts packages/quiz-service/src/modules/game-results/repositories/

   # Copy result utils
   cp packages/quiz-service/src/modules/game/services/utils/game-result.converter.ts packages/quiz-service/src/modules/game-results/converters/
   ```

3. **Create Game Results Module File**
   - Create `packages/quiz-service/src/modules/game-results/game-results.module.ts`
   - Define module with proper providers and exports
   - Include MongooseModule for result schemas

4. **Create Index Files**
   - Create `index.ts` files for proper exports
   - Ensure all result components are exported
   - Create proper barrel exports

**Files to Create:**

- `packages/quiz-service/src/modules/game-results/game-results.module.ts`
- `packages/quiz-service/src/modules/game-results/index.ts`
- Various `index.ts` files in subdirectories

**Acceptance Criteria:**

- Game results module structure created
- All result files copied successfully
- Module file created with proper exports
- No existing functionality affected

#### Step 6.2: Update Game Module

**Objective:** Replace internal result processing with extracted results module

**Tasks:**

1. **Import Game Results Module**
   - Add `GameResultsModule` to imports in `game.module.ts`
   - Remove result-related MongooseModule definitions
   - Update module dependencies

2. **Update Result Imports in Game Module**
   - Search for imports from result services and repositories
   - Replace with imports from `../game-results`
   - Update all result-related service injections

3. **Remove Result Files from Game Module**

   ```bash
   rm packages/quiz-service/src/modules/game/services/game-result.service.ts
   rm packages/quiz-service/src/modules/game/repositories/game-result.repository.ts
   rm packages/quiz-service/src/modules/game/services/utils/game-result.converter.ts
   ```

4. **Update Game Service Dependencies**
   - Update `game.service.ts` to use results module exports
   - Update any other services using result utilities
   - Ensure proper dependency injection

5. **Test Result Integration**
   - Run game-related tests
   - Verify result processing still works
   - Check result calculation functionality

**Files to Modify:**

- `packages/quiz-service/src/modules/game/game.module.ts`
- `packages/quiz-service/src/modules/game/services/game.service.ts`
- Any other files using result utilities

**Acceptance Criteria:**

- Game module imports results module
- Result files removed from game module
- Result functionality working
- Circular dependency count reduced (target: ~3)
- All tests passing

### Phase 7: Create Domain Events (High Risk)

#### Step 7.1: Create Domain Events Infrastructure

**Objective:** Implement domain event pattern for cross-module communication

**Tasks:**

1. **Create Domain Events Module Structure**

   ```bash
   mkdir -p packages/quiz-service/src/modules/domain-events/{events,handlers,publishers,interfaces,decorators}
   ```

2. **Create Domain Event Interfaces**
   - Create `packages/quiz-service/src/modules/domain-events/interfaces/domain-event.interface.ts`
   - Create `packages/quiz-service/src/modules/domain-events/interfaces/event-handler.interface.ts`
   - Define base event and handler interfaces

3. **Create Event Bus**
   - Create `packages/quiz-service/src/modules/domain-events/publishers/event-bus.ts`
   - Implement event publishing and subscription
   - Add event filtering and routing

4. **Create Event Decorators**
   - Create `packages/quiz-service/src/modules/domain-events/decorators/event-handler.decorator.ts`
   - Create `packages/quiz-service/src/modules/domain-events/decorators/publish-event.decorator.ts`

5. **Create Domain Events Module**
   - Create `packages/quiz-service/src/modules/domain-events/domain-events.module.ts`
   - Set up event bus as a provider
   - Configure event discovery and registration

**Files to Create:**

- `packages/quiz-service/src/modules/domain-events/domain-events.module.ts`
- `packages/quiz-service/src/modules/domain-events/index.ts`
- Various interface and implementation files

**Acceptance Criteria:**

- Domain events infrastructure created
- Event bus implemented
- Decorators for event handling created
- Module file created with proper exports
- No existing functionality affected

#### Step 7.2: Replace One Circular Dependency

**Objective:** Replace first circular dependency with domain events

**Tasks:**

1. **Identify Target Circular Dependency**
   - Choose AuthModule ↔ UserModule circular dependency
   - Analyze current communication patterns
   - Identify events to be published

2. **Create Domain Events**
   - Create user-related events (e.g., UserCreatedEvent, UserUpdatedEvent)
   - Create auth-related events (e.g., UserLoggedInEvent, UserLoggedOutEvent)
   - Define event payloads and metadata

3. **Implement Event Handlers**
   - Create event handlers in AuthModule for user events
   - Create event handlers in UserModule for auth events
   - Replace direct service calls with event publishing

4. **Update Module Dependencies**
   - Remove direct imports between AuthModule and UserModule
   - Import DomainEventsModule in both modules
   - Remove `forwardRef()` calls if no longer needed

5. **Test Event-Driven Communication**
   - Run tests for auth and user functionality
   - Verify events are published and handled correctly
   - Check that no circular dependencies remain

**Files to Modify:**

- `packages/quiz-service/src/modules/authentication/authentication.module.ts`
- `packages/quiz-service/src/modules/user/user.module.ts`
- Auth and User service files

**Acceptance Criteria:**

- Auth ↔ User circular dependency eliminated
- Event-driven communication working
- All auth and user functionality working
- Circular dependency count reduced

#### Step 7.3: Replace Remaining Circular Dependencies

**Objective:** Eliminate all remaining circular dependencies using domain events

**Tasks:**

1. **Replace GameModule ↔ UserModule Dependency**
   - Create user events for game-related updates
   - Create game events for user-related updates
   - Implement event handlers in both modules
   - Remove direct module dependencies

2. **Replace MigrationModule Dependencies**
   - Create events for data changes that trigger migration
   - Implement event handlers in MigrationModule
   - Remove direct imports from MigrationModule
   - Test migration functionality

3. **Replace GameModule ↔ QuizModule Dependency**
   - Create quiz events for game-related updates
   - Create game events for quiz-related updates
   - Implement event handlers in both modules
   - Remove direct module dependencies

4. **Remove All forwardRef() Calls**
   - Search for remaining `forwardRef()` usage
   - Replace with domain events where appropriate
   - Update module imports and exports

5. **Final Testing**
   - Run full test suite
   - Verify all functionality works
   - Check circular dependency count (should be 0)

**Files to Modify:**

- All module files with circular dependencies
- Service files with direct cross-module calls
- Any remaining files using `forwardRef()`

**Acceptance Criteria:**

- All circular dependencies eliminated
- No `forwardRef()` calls remaining
- All functionality working
- Circular dependency count = 0

### Phase 8: Final Cleanup (Low Risk)

#### Step 8.1: Rename Game Module

**Objective:** Rename game module to game-core to reflect its focused responsibilities

**Tasks:**

1. **Rename Game Module Directory**

   ```bash
   mv packages/quiz-service/src/modules/game packages/quiz-service/src/modules/game-core
   ```

2. **Rename Module File**

   ```bash
   mv packages/quiz-service/src/modules/game-core/game.module.ts packages/quiz-service/src/modules/game-core/game-core.module.ts
   ```

3. **Update Module Class Name**
   - Rename `GameModule` to `GameCoreModule`
   - Update all exports and imports
   - Update module decorators

4. **Update All Import Paths**
   - Search for imports from `modules/game`
   - Replace with `modules/game-core`
   - Update in `app.module.ts` and all other modules

5. **Test Game Core Functionality**
   - Run game-related tests
   - Verify core game functionality works
   - Check integration with extracted modules

**Files to Modify:**

- `packages/quiz-service/src/modules/game-core/game-core.module.ts`
- `packages/quiz-service/src/app.module.ts`
- Any files importing from game module

**Acceptance Criteria:**

- Game module renamed to game-core
- All import paths updated
- Game core functionality working
- All tests passing

#### Step 8.2: Update AppModule

**Objective:** Clean up and optimize the root application module

**Tasks:**

1. **Clean Up Module Imports**
   - Remove unused imports
   - Organize imports alphabetically
   - Add proper import grouping

2. **Optimize Module Loading Order**
   - Ensure shared modules load first
   - Order domain modules appropriately
   - Verify no dependency issues

3. **Update Module Exports**
   - Remove unnecessary exports
   - Ensure proper module boundaries
   - Add global providers if needed

4. **Add Module Documentation**
   - Add JSDoc comments for AppModule
   - Document module dependencies
   - Add architectural notes

5. **Final Integration Testing**
   - Run full application
   - Test all endpoints
   - Verify module interactions

**Files to Modify:**

- `packages/quiz-service/src/app/app.module.ts`

**Acceptance Criteria:**

- AppModule clean and optimized
- Proper module loading order
- All functionality working
- Documentation added

#### Step 8.3: Documentation

**Objective:** Create comprehensive documentation for the new architecture

**Tasks:**

1. **Update README**
   - Document new module structure
   - Add architecture overview
   - Include dependency guidelines

2. **Create Module Documentation**
   - Create README files for each module
   - Document module responsibilities
   - Include usage examples

3. **Create Architecture Decision Records (ADRs)**
   - Document decision to extract game modules
   - Record domain events implementation
   - Document circular dependency resolution

4. **Update Development Guidelines**
   - Add module creation guidelines
   - Include dependency rules
   - Add testing requirements

5. **Create Migration Guide**
   - Document the refactoring process
   - Include lessons learned
   - Provide best practices for future changes

**Files to Create:**

- `packages/quiz-service/README.md`
- `packages/quiz-service/docs/architecture.md`
- `packages/quiz-service/docs/adr/`
- Module-specific README files

**Acceptance Criteria:**

- Comprehensive documentation created
- Architecture decisions documented
- Development guidelines updated
- Migration guide completed

## Success Metrics

### Quantitative Metrics

- **Circular Dependencies**: 12 → 0
- **Game Module Size**: 185 files → ~30 files
- **Number of Modules**: 7 → 14
- **Code Duplication**: Reduce by 30%
- **Test Coverage**: Maintain >90%

### Qualitative Metrics

- **Module Cohesion**: High (single responsibility)
- **Module Coupling**: Low (minimal dependencies)
- **Code Maintainability**: Improved
- **Developer Experience**: Better
- **System Scalability**: Enhanced

## Risk Management

### High-Risk Activities

1. **Domain Events Implementation** (Phase 7)
2. **Circular Dependency Resolution** (Phase 7)
3. **Game Module Extraction** (Phases 2-6)

### Mitigation Strategies

1. **Incremental Approach**: Small, testable changes
2. **Comprehensive Testing**: Unit, integration, and E2E tests
3. **Rollback Planning**: Git commits for each step
4. **Monitoring**: Circular dependency checks in CI/CD

### Rollback Procedures

1. **Git Revert**: Each step is a separate commit
2. **Feature Flags**: Enable/disable new modules
3. **Database Migrations**: Rollback scripts if needed
4. **Configuration**: Environment-based module loading

## Testing Strategy

### Unit Testing

- Test each module independently
- Mock external dependencies
- Verify module boundaries
- Test domain events

### Integration Testing

- Test module interactions
- Verify event-driven communication
- Test database operations
- Check API endpoints

### End-to-End Testing

- Test complete user flows
- Verify game functionality
- Check authentication flows
- Test migration processes

### Architecture Testing

- Verify no circular dependencies
- Check module boundaries
- Test dependency direction
- Verify architectural rules

## Implementation Timeline

### Estimated Duration

- **Phase 0**: 1-2 days
- **Phase 1**: 3-5 days
- **Phase 2**: 2-3 days
- **Phase 3**: 2-3 days
- **Phase 4**: 2-3 days
- **Phase 5**: 2-3 days
- **Phase 6**: 2-3 days
- **Phase 7**: 5-7 days
- **Phase 8**: 2-3 days

**Total Estimated Time**: 21-32 days

### Milestones

1. **Week 1**: Phases 0-1 (Structure setup and module moves)
2. **Week 2**: Phases 2-4 (Game module extractions)
3. **Week 3**: Phases 5-6 (Remaining extractions)
4. **Week 4**: Phases 7-8 (Domain events and cleanup)

## Prerequisites

### Tools and Dependencies

- **Node.js** and **npm/yarn**
- **NestJS CLI**
- **TypeScript**
- **Jest** (testing)
- **Madge** (circular dependency detection)
- **Git** (version control)

### Knowledge Requirements

- **NestJS** framework expertise
- **TypeScript** proficiency
- **Domain-Driven Design** principles
- **Event-Driven Architecture** patterns
- **Circular Dependency** resolution techniques

### Environment Setup

- **Development environment** configured
- **CI/CD pipeline** ready
- **Testing infrastructure** in place
- **Monitoring tools** configured

## Conclusion

This comprehensive refactoring plan will transform the quiz-service application from a monolithic architecture with circular dependencies to a clean, modular, and maintainable system. The incremental approach ensures minimal risk while delivering significant improvements in code quality, maintainability, and scalability.

The successful completion of this plan will result in:

- Zero circular dependencies
- Clear module boundaries
- Improved code organization
- Enhanced developer experience
- Better system scalability

Each phase is designed to be independently testable and reversible, ensuring that the refactoring can be completed safely without disrupting the existing functionality.
