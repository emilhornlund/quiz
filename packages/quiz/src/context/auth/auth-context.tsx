import { createContext } from 'react'

import { AuthState } from '../../models'

/**
 * AuthContextType defines the shape of authentication-related data
 * and actions available throughout the app.
 *
 * @property accessToken - The current access authentication token, if any.
 * @property refreshToken - The current refresh authentication token, if any.
 * @property isLoggedIn - Indicates whether a user is currently authenticated.
 * @property setAuth - Function to update the authentication state.
 * @property logout - Function to log out the user by revoking tokens and clearing state.
 */
export type AuthContextType = {
  accessToken?: string
  refreshToken?: string
  isLoggedIn: boolean
  setAuth: (auth?: AuthState) => void
  logout: () => void
}

/**
 * A React context providing authentication-related state and functions.
 *
 * This context holds the user's tokens, login status, and methods to
 * update authentication or log out.
 */
export const AuthContext = createContext<AuthContextType>({
  accessToken: undefined,
  refreshToken: undefined,
  isLoggedIn: false,
  setAuth: () => undefined,
  logout: () => undefined,
})
