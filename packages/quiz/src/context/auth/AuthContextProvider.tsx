import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { AuthState } from '../../models'
import { AUTH_LOCAL_STORAGE_KEY } from '../../utils/constants.ts'

import { AuthContext, AuthContextType } from './auth-context.tsx'

/**
 * Parses a JSON string into an object of type `T`, or returns `undefined` if the string is falsy.
 *
 * @template T - The expected type of the parsed object.
 * @param jsonString - The JSON string to parse.
 * @returns The parsed object of type `T` or `undefined` if the input is invalid.
 */
const parseJSONString = <T extends AuthState>(
  jsonString?: string | null,
): T | undefined => {
  if (!jsonString) {
    return undefined
  }
  return JSON.parse(jsonString) as T
}

/**
 * Props for the `AuthContextProvider` component.
 *
 * @property children - The child components to be wrapped by the provider.
 */
export interface AuthContextProviderProps {
  children: ReactNode | ReactNode[]
}

/**
 * A context provider for managing authentication-related state.
 *
 * It synchronizes the context state with local storage and provides functions to update
 * and persist authentication data.
 *
 * @param children - The child components to be wrapped by the provider.
 * @returns A React component wrapping its children with the `AuthContext` provider.
 */
const AuthContextProvider: FC<AuthContextProviderProps> = ({ children }) => {
  const { revoke } = useQuizServiceClient()

  const navigate = useNavigate()

  const [auth, setAuth] = useState<AuthState>()

  /**
   * Determines whether the user is currently logged in by verifying
   * the presence of both access and refresh tokens in state.
   */
  const isLoggedIn = useMemo(
    () => !!(auth?.accessToken && auth?.refreshToken),
    [auth],
  )

  useEffect(() => {
    setAuth(
      parseJSONString<AuthState>(localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)),
    )
  }, [])

  /**
   * Updates the auth information in the state and persists it to local storage.
   *
   * @param newAuth - The new auth object to set.
   */
  const handleSetAuth = (newAuth?: AuthState) => {
    setAuth(newAuth)
    if (newAuth) {
      localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(newAuth))
    } else {
      localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
    }
  }

  /**
   * Logs out the current user by revoking their authentication token,
   * clearing the stored authentication state, and navigating to the home page.
   *
   * If an access or refresh token exists, it will be sent to the server for revocation.
   */
  const handleLogout = useCallback(() => {
    const token = auth?.accessToken || auth?.refreshToken
    if (token) {
      revoke({ token }).then(() => {
        handleSetAuth(undefined)
        navigate('/')
      })
    }
  }, [auth, revoke, navigate])

  /**
   * Memoized value for the `AuthContext`, containing the current authentication state
   * and update functions.
   */
  const value = useMemo<AuthContextType>(
    () => ({
      accessToken: auth?.accessToken,
      refreshToken: auth?.refreshToken,
      isLoggedIn,
      setAuth: handleSetAuth,
      logout: handleLogout,
    }),
    [auth, isLoggedIn, handleLogout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
