import { createContext } from 'react'

import { Client, Player } from '../../models'

/**
 * Represents the structure of the authentication context.
 *
 * @property token - The authentication token (optional).
 * @property client - The client information (optional).
 * @property player - The player information (optional).
 * @property setToken - Function to update the authentication token.
 * @property setClient - Function to update the client information.
 * @property setPlayer - Function to update the player information.
 */
export type AuthContextType = {
  token?: string
  client?: Client
  player?: Player
  setToken: (token: string) => void
  setClient: (client: Client) => void
  setPlayer: (player: Player) => void
}

/**
 * A React context providing authentication-related state and functions.
 *
 * The default context value initializes `setToken`, `setClient`, and `setPlayer`
 * as no-op functions.
 */
export const AuthContext = createContext<AuthContextType>({
  setToken: () => undefined,
  setClient: () => undefined,
  setPlayer: () => undefined,
})
