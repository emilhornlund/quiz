import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import { notifySuccess } from '../../utils/notification.ts'
import { sha256 } from '../../utils/oauth.ts'
import useLocalStorage from '../../utils/use-local-storage.tsx'

import { MigrationContext, MigrationContextType } from './migration-context.tsx'

const LEGACY_HOST = 'quiz.emilhornlund.com'
const TARGET_HOST = 'klurigo.com'

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
  const [searchParams] = useSearchParams()

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
  )

  const [, setMigrationToken, clearMigrationToken] = useLocalStorage<
    string | undefined
  >('migrationToken', undefined)

  const [migrated, setMigrated] = useLocalStorage<boolean>('migrated', false)

  const migrationTokenSearchParam = searchParams.get('migrationToken')

  const hasRedirected = useRef<boolean>(false)

  useEffect(() => {
    if (hasRedirected.current) return

    async function migrationProcess(): Promise<void> {
      let newMigrationToken: string | undefined = undefined
      if (!migrated) {
        if (migrationTokenSearchParam) {
          newMigrationToken = migrationTokenSearchParam
          notifySuccess(
            'Yay, migration is in hand! Are you set for more brain-busting quizzes?',
          )
        } else if (client?.id && player?.id) {
          newMigrationToken = await sha256(`${client.id}:${player.id}`)
        }
        if (newMigrationToken) {
          setMigrationToken(newMigrationToken)
        }
      }

      const url = new URL(window.location.href)

      if (url.host === LEGACY_HOST) {
        if (newMigrationToken) {
          url.searchParams.set('migrationToken', newMigrationToken)
        }

        const searchParamString =
          url.searchParams.size > 0 ? `?${url.searchParams.toString()}` : ''

        hasRedirected.current = true

        window.location.replace(
          `https://${TARGET_HOST}${url.pathname}${searchParamString}`,
        )
      }
    }

    migrationProcess()
  }, [
    client?.id,
    player?.id,
    migrated,
    migrationTokenSearchParam,
    setMigrationToken,
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
