import { createContext } from 'react'

import { AuthState } from '../../models'

/**
 * Represents the structure of the authentication context.
 *
 * @property accessToken - The access authentication token (optional).
 * @property refreshToken - The refresh authentication token (optional).
 * @property setAuth - Function to update the authentication information.
 */
export type AuthContextType = {
  accessToken?: string
  refreshToken?: string
  setAuth: (auth?: AuthState) => void
  isLoggedIn: () => boolean
}

/**
 * A React context providing authentication-related state and functions.
 *
 * The default context value initializes `setAuth` and `isLoggedIn`
 * as no-op functions.
 */
export const AuthContext = createContext<AuthContextType>({
  setAuth: () => undefined,
  isLoggedIn: () => false,
})
