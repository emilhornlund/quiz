import { setContext, setUser } from '@sentry/react'
import type { FC, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useIsMounted, useLocalStorage } from 'usehooks-ts'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import type { UserContextType } from './UserContext.tsx'
import { UserContext } from './UserContext.tsx'

/**
 * Provides the current user profile to descendants.
 *
 * Exposes helpers to:
 * - fetch and store the profile once using an access token, and
 * - clear the stored profile (e.g., on revoke/logout).
 */
export interface UserContextProviderProps {
  /** React children that will have access to the user context. */
  children: ReactNode | ReactNode[]
}

/**
 * Context provider for current user state.
 *
 * @param children - React nodes that should consume the user context.
 */
const UserContextProvider: FC<UserContextProviderProps> = ({ children }) => {
  /**
   * API client function for retrieving the current user's profile using an access token.
   */
  const { getUserProfile } = useQuizServiceClient()

  /**
   * Persisted snapshot of the current user profile.
   * Defaults to `undefined` when no profile is loaded.
   */
  const [currentUser, setCurrentUser, clearCurrentUser] = useLocalStorage<
    UserContextType['currentUser'] | undefined
  >('currentUser', undefined)

  /**
   * Tracks the token of the currently in-flight `getUserProfile` request.
   */
  const inflight = useRef<string | null>(null)

  /**
   * Clears the current user from app state and Sentry.
   *
   * Intended for sign-out flows and auth failures. Performs:
   * - Local cleanup via `clearCurrentUser()`.
   * - `Sentry.setUser(null)` so subsequent events aren’t attributed to the user.
   */
  const handleClearCurrentUser = useCallback(() => {
    console.debug('Cleaning up user...')
    clearCurrentUser()
    setUser(null)
    setContext('auth', null)
  }, [clearCurrentUser])

  /**
   * Fetches the current user profile using the provided access token
   * and stores a minimal snapshot of it.
   *
   * @param accessToken - The access token to authenticate the request.
   */
  const fetchCurrentUser = useCallback(
    async (accessToken: string) => {
      if (inflight.current === accessToken) return Promise.resolve()
      inflight.current = accessToken
      return getUserProfile(accessToken)
        .then(
          ({ id, email, unverifiedEmail, defaultNickname, authProvider }) => {
            console.debug('Setting up user...')
            setCurrentUser({
              id,
              email,
              unverifiedEmail,
              defaultNickname,
              authProvider,
            })
            setUser({ id, email, username: defaultNickname })
            setContext('auth', { provider: authProvider })
          },
        )
        .catch(() => {
          handleClearCurrentUser()
        })
        .finally(() => {
          if (inflight.current === accessToken) inflight.current = null
        })
    },
    [getUserProfile, setCurrentUser, handleClearCurrentUser],
  )

  /**
   * Tracks whether the component is still mounted.
   * Prevents state updates if the component unmounts during async operations.
   */
  const isMounted = useIsMounted()

  /**
   * Remember the last Sentry context we applied to avoid duplicate updates/logs.
   */
  const lastAppliedContextKeyRef = useRef<string | null>(null)

  /**
   * Build a stable fingerprint for the Sentry context.
   * This keeps the dependency array size constant across renders.
   */
  const sentryContextKey = useMemo(() => {
    if (!currentUser) return 'NO_USER'
    const {
      id = '',
      email = '',
      defaultNickname = '',
      authProvider = '',
    } = currentUser
    return [id, email, defaultNickname, authProvider].join('|')
  }, [currentUser])

  /**
   * Synchronize the current user with the monitoring context (Sentry).
   * Idempotent and StrictMode-safe.
   */
  useEffect(() => {
    if (!isMounted()) return

    // Skip if we already applied this exact context
    if (lastAppliedContextKeyRef.current === sentryContextKey) return
    lastAppliedContextKeyRef.current = sentryContextKey

    if (sentryContextKey !== 'NO_USER' && currentUser) {
      // We know currentUser is defined if key isn't "NO_USER"
      const { id, email, defaultNickname, authProvider } = currentUser
      console.debug('Setting up Sentry user context...')
      setUser({ id, email, username: defaultNickname })
      setContext('auth', { provider: authProvider })
    } else {
      console.debug('Cleaning up Sentry user context...')
      setUser(null)
      setContext('auth', null)
    }
  }, [isMounted, sentryContextKey])

  /**
   * Memoized context value to avoid unnecessary re-renders.
   */
  const value = useMemo<UserContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      fetchCurrentUser,
      clearCurrentUser: handleClearCurrentUser,
    }),
    [currentUser, setCurrentUser, fetchCurrentUser, handleClearCurrentUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContextProvider
