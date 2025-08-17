import { setContext, setUser } from '@sentry/react'
import React, { FC, ReactNode, useCallback, useMemo, useRef } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import { UserContext, UserContextType } from './UserContext.tsx'

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
            setCurrentUser({ id, email, unverifiedEmail, defaultNickname })
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
