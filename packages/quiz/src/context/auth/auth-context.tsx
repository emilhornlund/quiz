import { TokenScope } from '@quiz/common'
import { createContext } from 'react'

import type { AuthState } from '../../models'

/**
 * AuthContextType defines the shape of authentication-related data
 * and actions available throughout the app.
 *
 * @property user               Decoded token payloads for the User scope.
 * @property game               Decoded token payloads for the Game scope.
 * @property isUserAuthenticated Indicates if the User scope has valid tokens.
 * @property isGameAuthenticated Indicates if the Game scope has valid tokens.
 * @property setTokenPair       Function to store new tokens for a given scope.
 * @property revokeUser         Function to revoke User-scope tokens.
 * @property revokeGame         Function to revoke Game-scope tokens.
 */
export type AuthContextType = {
  user?: AuthState[TokenScope.User]
  game?: AuthState[TokenScope.Game]
  isUserAuthenticated: boolean
  isGameAuthenticated: boolean
  setTokenPair: (
    scope: TokenScope,
    accessToken: string,
    refreshToken: string,
  ) => void
  revokeUser: () => void
  revokeGame: () => void
}

/**
 * React context providing authentication state (tokens + flags)
 * and actions (setTokenPair, revokeUser/Game).
 */
export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  game: undefined,
  isUserAuthenticated: false,
  isGameAuthenticated: false,
  setTokenPair: () => undefined,
  revokeUser: () => undefined,
  revokeGame: () => undefined,
})
