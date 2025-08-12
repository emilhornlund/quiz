import { MIGRATION_TOKEN_REGEX } from '@quiz/common'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage } from 'usehooks-ts'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { notifySuccess } from '../../utils/notification.ts'
import { sha256 } from '../../utils/oauth.ts'
import { useAuthContext } from '../auth'

import { MigrationContext, MigrationContextType } from './migration-context.tsx'

/**
 * Props for the MigrationContextProvider component.
 *
 * @property children - The React nodes to be wrapped by the provider.
 */
export interface MigrationContextProviderProps {
  children: ReactNode
}

/**
 * The `MigrationContextProvider` component.
 *
 * @param children - The React nodes to be wrapped by the provider.
 */
const MigrationContextProvider: FC<MigrationContextProviderProps> = ({
  children,
}) => {
  const { isUserAuthenticated } = useAuthContext()

  const { migrateUser } = useQuizServiceClient()

  const [searchParams, setSearchParams] = useSearchParams()

  const [client, , clearClient] = useLocalStorage<{ id: string } | undefined>(
    'client',
    undefined,
  )

  const [player, , clearPlayer] = useLocalStorage<{ id: string } | undefined>(
    'player',
    undefined,
  )

  const [, , clearToken] = useLocalStorage<string | undefined>(
    'token',
    undefined,
    { deserializer: (value) => `${value}` },
  )

  const [migrationToken, setMigrationToken, clearMigrationToken] =
    useLocalStorage<string | undefined>('migrationToken', undefined)

  const [, setMigrated] = useLocalStorage<boolean>('migrated', false)

  const migrationTokenSearchParam = searchParams.get('migrationToken')

  // Track tokens we’ve already acted on to avoid duplicate migrations / notifications
  const handledTokens = useRef<Set<string>>(new Set())
  // Track latest client:player pair to avoid stale sha256 writes
  const latestPairRef = useRef<string | null>(null)

  // Remove a query param safely without mutating the original instance
  const removeQueryParam = useCallback(
    (key: string) => {
      const next = new URLSearchParams(searchParams)
      next.delete(key)
      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    // 1) If URL carries a migration token, handle that path first
    if (
      migrationTokenSearchParam &&
      MIGRATION_TOKEN_REGEX.test(migrationTokenSearchParam)
    ) {
      const token = migrationTokenSearchParam
      // Always clear the query param (prevents loops if the page re-renders)
      removeQueryParam('migrationToken')

      if (handledTokens.current.has(token)) {
        // Already handled this token (migration or notification) — noop
        return
      }

      if (isUserAuthenticated) {
        handledTokens.current.add(token)
        console.log(
          `Begin migrating authenticated user using migration token '${token}'.`,
        )
        // Fire and forget; if you want, you can await and set a local 'migrated' flag too
        void migrateUser({ migrationToken: token })
      } else {
        // Only write to LS + notify if different
        if (migrationToken !== token) {
          console.log(`Received migration token: '${token}'.`)
          setMigrationToken(token)
          // Notify once per token
          handledTokens.current.add(token)
          notifySuccess(
            'Yay, migration is in hand! Are you set for more brain-busting quizzes?',
          )
        }
      }
      return
    }

    // 2) Otherwise derive a deterministic token from client:player if both exist
    if (client?.id && player?.id) {
      const pair = `${client.id}:${player.id}`
      latestPairRef.current = pair

      sha256(pair).then((derived) => {
        // Ignore stale resolutions
        if (latestPairRef.current !== pair) return

        if (derived && derived !== migrationToken) {
          console.log(
            `Generated migration token '${derived}' from client '${client.id}' and player '${player.id}'.`,
          )
          setMigrationToken(derived)
        }
      })
    }
  }, [
    isUserAuthenticated,
    client?.id,
    player?.id,
    migrationTokenSearchParam,
    migrationToken,
    setMigrationToken,
    searchParams,
    setSearchParams,
    migrateUser,
    removeQueryParam,
  ])

  const handleCompleteMigration: () => void = useCallback((): void => {
    clearClient()
    clearPlayer()
    clearToken()
    clearMigrationToken()
    setMigrated(true)
  }, [clearClient, clearPlayer, clearToken, clearMigrationToken, setMigrated])

  const value = useMemo<MigrationContextType>(
    () => ({
      completeMigration: handleCompleteMigration,
    }),
    [handleCompleteMigration],
  )

  return (
    <MigrationContext.Provider value={value}>
      {children}
    </MigrationContext.Provider>
  )
}

export default MigrationContextProvider
