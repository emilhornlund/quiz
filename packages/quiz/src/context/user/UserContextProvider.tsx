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
        .then(({ id, email, unverifiedEmail, defaultNickname }) => {
          setCurrentUser({ id, email, unverifiedEmail, defaultNickname })
        })
        .catch(() => {
          clearCurrentUser()
        })
        .finally(() => {
          if (inflight.current === accessToken) inflight.current = null
        })
    },
    [getUserProfile, setCurrentUser, clearCurrentUser],
  )

  /**
   * Memoized context value to avoid unnecessary re-renders.
   */
  const value = useMemo<UserContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      fetchCurrentUser,
      clearCurrentUser,
    }),
    [currentUser, setCurrentUser, fetchCurrentUser, clearCurrentUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContextProvider
