import { useContext } from 'react'

import { MigrationContext } from './migration-context'

/**
 * A custom hook for accessing the `MigrationContext`.
 *
 * @returns The current migration state and actions:
 *          `{ clientId, playerId, migrated, completeMigration }`
 */
export const useMigrationContext = () => useContext(MigrationContext)
