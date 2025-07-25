import React, { FC, ReactNode, useMemo } from 'react'

import { MigrationContext, MigrationContextType } from './migration-context.tsx'

/**
 * Props for the `MigrationContextProvider` component.
 *
 * @property children - The child components to be wrapped by the provider.
 */
export interface MigrationContextProvider {
  children: ReactNode | ReactNode[]
}

/**
 *
 * @param children
 * @constructor
 */
const MigrationContextProvider: FC<MigrationContextProvider> = ({
  children,
}) => {
  const clientId = useMemo(() => {
    const clientObject = localStorage.getItem('client') || undefined
    return clientObject && (JSON.parse(clientObject) as { id: string }).id
  }, [])

  const playerId = useMemo(() => {
    const playerObject = localStorage.getItem('player') || undefined
    return playerObject && (JSON.parse(playerObject) as { id: string }).id
  }, [])

  const handleCompleteMigration = () => {
    localStorage.removeItem('client')
    localStorage.removeItem('player')
    localStorage.removeItem('token')
  }

  const value = useMemo<MigrationContextType>(
    () => ({
      clientId,
      playerId,
      migrated: !clientId && !playerId,
      completeMigration: handleCompleteMigration,
    }),
    [clientId, playerId],
  )

  return (
    <MigrationContext.Provider value={value}>
      {children}
    </MigrationContext.Provider>
  )
}

export default MigrationContextProvider
