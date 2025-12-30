import { useContext } from 'react'

import { AuthContext } from './auth-context.tsx'

/**
 * A custom hook for accessing the `AuthContext`.
 *
 * Provides access to authentication state and related update functions, such as
 * `token`, `client`, `player`, `setToken`, `setClient`, and `setPlayer`.
 *
 * @returns The current value of the `AuthContext`.
 */
export const useAuthContext = () => useContext(AuthContext)
