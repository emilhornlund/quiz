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

  const [, setMigrationToken, clearMigrationToken] = useLocalStorage<
    string | undefined
  >('migrationToken', undefined)

  const [migrated, setMigrated] = useLocalStorage<boolean>('migrated', false)

  const migrationTokenSearchParam = searchParams.get('migrationToken')

  const hasMigrated = useRef<boolean>(false)
  const hasRedirected = useRef<boolean>(false)

  useEffect(() => {
    if (hasRedirected.current || hasMigrated.current) return

    console.log('local storage')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        console.log(key + '=[' + localStorage.getItem(key) + ']')
      }
    }

    async function migrationProcess(): Promise<void> {
      let newMigrationToken: string | undefined = undefined
      if (migrationTokenSearchParam) {
        newMigrationToken = migrationTokenSearchParam
        searchParams.delete('migrationToken')
        setSearchParams(searchParams)

        if (isUserAuthenticated) {
          console.log(
            `Begin migrating authenticated used using migration token '${newMigrationToken}'.`,
          )
          hasMigrated.current = true
          await migrateUser({ migrationToken: newMigrationToken })
        } else {
          console.log(`Received migration token: '${newMigrationToken}'.`)
          setMigrationToken(newMigrationToken)
          notifySuccess(
            'Yay, migration is in hand! Are you set for more brain-busting quizzes?',
          )
        }
      } else if (client?.id && player?.id) {
        newMigrationToken = await sha256(`${client.id}:${player.id}`)
        console.log(
          `Generated migration token '${newMigrationToken}' from client '${client.id}' and player '${player.id}'.`,
        )
        setMigrationToken(newMigrationToken)
      }

      const url = new URL(window.location.href)

      if (url.host === LEGACY_HOST) {
        if (newMigrationToken) {
          url.searchParams.set('migrationToken', newMigrationToken)
        }

        const searchParamString =
          url.searchParams.size > 0 ? `?${url.searchParams.toString()}` : ''

        hasRedirected.current = true

        const redirectURL = `https://${TARGET_HOST}${url.pathname}${searchParamString}`
        console.log(`Redirecting to '${redirectURL}'.`)
        window.location.replace(redirectURL)
      }
    }

    migrationProcess()
  }, [
    isUserAuthenticated,
    client?.id,
    player?.id,
    migrated,
    migrationTokenSearchParam,
    setMigrationToken,
    searchParams,
    setSearchParams,
    migrateUser,
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
