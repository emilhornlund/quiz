import { useContext } from 'react'

import { UserContext } from './UserContext'

/**
 * Hook to access the user context.
 *
 * Use this inside a `<UserContextProvider>` to read and mutate the
 * current user state.
 *
 * @returns The user context value.
 */
export const useUserContext = () => useContext(UserContext)
