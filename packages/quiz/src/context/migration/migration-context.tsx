import { createContext } from 'react'

/**
 * Defines the shape of the migration context value.
 *
 * Provides:
 * - `completeMigration`: Function to clear legacy identifiers and mark migration as done.
 */
export interface MigrationContextType {
  completeMigration: () => void
}

/**
 * React context for migration state.
 *
 * Defaults to:
 * - `completeMigration` no-op
 */
export const MigrationContext = createContext<MigrationContextType>({
  completeMigration: () => undefined,
})
