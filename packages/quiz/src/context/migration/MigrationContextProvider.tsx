import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import { MigrationContext, MigrationContextType } from './migration-context.tsx'

const LEGACY_HOST = 'quiz.emilhornlund.com'
const TARGET_HOST = 'klurigo.com'

/**
 * Safely parse a JSON‐stringified object containing an `id` field.
 *
 * @param value - A JSON string like `{"id":"…"}`
 * @returns The extracted `id` if parsing succeeds, otherwise `undefined`
 */
const extractObjectIdFromString = (
  value: string | undefined,
): string | undefined => {
  try {
    const parsedIdObject: { id: string } | undefined = value
      ? (JSON.parse(value) as { id: string })
      : undefined
    return parsedIdObject?.id
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error
  ) {
    return undefined
  }
}

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

  const [clientId, setClientId] = useState<string | undefined>(undefined)
  const [playerId, setPlayerId] = useState<string | undefined>(undefined)

  const tmpLegacyPlayerId = searchParams.get('legacyPlayerId')

  const hasRedirected = useRef<boolean>(false)

  useEffect(() => {
    if (hasRedirected.current) return

    let newClientId: string | undefined
    const rawClient = localStorage.getItem('client')
    if (rawClient) {
      newClientId = extractObjectIdFromString(rawClient)
      if (newClientId) {
        setClientId(newClientId)
      }
    }

    let newPlayerId: string | undefined
    if (tmpLegacyPlayerId) {
      newPlayerId = tmpLegacyPlayerId
      localStorage.setItem('player', JSON.stringify({ id: newPlayerId }))
      setPlayerId(newPlayerId)
    } else {
      const rawPlayer = localStorage.getItem('player')
      if (rawPlayer && !tmpLegacyPlayerId) {
        newPlayerId = extractObjectIdFromString(rawPlayer)
        if (newPlayerId) {
          setPlayerId(newPlayerId)
        }
      }
    }

    const url = new URL(window.location.href)

    if (url.host === LEGACY_HOST) {
      if (newPlayerId) {
        url.searchParams.set('legacyPlayerId', newPlayerId)
      }

      const searchParamString =
        url.searchParams.size > 0 ? `?${url.searchParams.toString()}` : ''

      hasRedirected.current = true

      window.location.replace(
        `https://${TARGET_HOST}${url.pathname}${searchParamString}`,
      )
    }
  }, [tmpLegacyPlayerId])

  const handleCompleteMigration: () => void = useCallback((): void => {
    localStorage.removeItem('client')
    localStorage.removeItem('player')
    localStorage.removeItem('token')

    setClientId(undefined)
    setPlayerId(undefined)
  }, [])

  const value = useMemo<MigrationContextType>(
    () => ({
      clientId,
      playerId,
      migrated: !clientId && !playerId,
      completeMigration: handleCompleteMigration,
    }),
    [clientId, playerId, handleCompleteMigration],
  )

  return (
    <MigrationContext.Provider value={value}>
      {children}
    </MigrationContext.Provider>
  )
}

export default MigrationContextProvider
