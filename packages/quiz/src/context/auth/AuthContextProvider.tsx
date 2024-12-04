import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'

import { Client, Player } from '../../models'
import {
  CLIENT_LOCAL_STORAGE_KEY,
  PLAYER_LOCAL_STORAGE_KEY,
  TOKEN_LOCAL_STORAGE_KEY,
} from '../../utils/constants.ts'

import { AuthContext, AuthContextType } from './auth-context.tsx'

/**
 * Parses a JSON string into an object of type `T`, or returns `undefined` if the string is falsy.
 *
 * @template T - The expected type of the parsed object.
 * @param jsonString - The JSON string to parse.
 * @returns The parsed object of type `T` or `undefined` if the input is invalid.
 */
const parseJSONString = <T extends Client | Player>(
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
 * A context provider for managing authentication-related state, such as tokens, clients, and players.
 *
 * It synchronizes the context state with local storage and provides functions to update
 * and persist authentication data.
 *
 * @param children - The child components to be wrapped by the provider.
 * @returns A React component wrapping its children with the `AuthContext` provider.
 */
const AuthContextProvider: FC<AuthContextProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string>()
  const [client, setClient] = useState<Client>()
  const [player, setPlayer] = useState<Player>()

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY) || undefined)
    setClient(
      parseJSONString<Client>(localStorage.getItem(CLIENT_LOCAL_STORAGE_KEY)),
    )
    setPlayer(
      parseJSONString<Player>(localStorage.getItem(PLAYER_LOCAL_STORAGE_KEY)),
    )
  }, [])

  /**
   * Updates the authentication token in the state and persists it to local storage.
   *
   * @param newToken - The new authentication token to set.
   */
  const handleSetToken = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, newToken)
  }

  /**
   * Updates the client information in the state and persists it to local storage.
   *
   * @param newClient - The new client object to set.
   */
  const handleSetClient = (newClient: Client) => {
    setClient(newClient)
    localStorage.setItem(CLIENT_LOCAL_STORAGE_KEY, JSON.stringify(newClient))
  }

  /**
   * Updates the player information in the state and persists it to local storage.
   *
   * @param newPlayer - The new player object to set.
   */
  const handleSetPlayer = (newPlayer: Player) => {
    setPlayer(newPlayer)
    localStorage.setItem(PLAYER_LOCAL_STORAGE_KEY, JSON.stringify(newPlayer))
  }

  /**
   * Memoized value for the `AuthContext`, containing the current authentication state
   * and update functions.
   */
  const value = useMemo<AuthContextType>(
    () => ({
      token,
      client,
      player,
      setToken: handleSetToken,
      setClient: handleSetClient,
      setPlayer: handleSetPlayer,
    }),
    [token, client, player],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
