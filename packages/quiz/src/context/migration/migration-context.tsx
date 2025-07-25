import { createContext } from 'react'

/**
 * Defines the shape of the migration context value.
 *
 * Provides:
 * - `clientId`: The legacy client ID retrieved from localStorage, if any.
 * - `playerId`: The legacy player ID retrieved from localStorage, if any.
 * - `migrated`: Whether migration has already been completed.
 * - `completeMigration`: Function to clear legacy identifiers and mark migration as done.
 */
export interface MigrationContextType {
  clientId?: string
  playerId?: string
  migrated: boolean
  completeMigration: () => void
}

/**
 * React context for migration state.
 *
 * Defaults to:
 * - `clientId` and `playerId` undefined
 * - `migrated` false
 * - `completeMigration` no-op
 */
export const MigrationContext = createContext<MigrationContextType>({
  clientId: undefined,
  playerId: undefined,
  migrated: false,
  completeMigration: () => undefined,
})
