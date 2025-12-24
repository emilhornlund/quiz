import type { UserProfileResponseDto } from '@quiz/common'
import { createContext } from 'react'

/**
 * The shape of the user context.
 *
 * @property currentUser - A minimal snapshot of the authenticated user's profile,
 *                         or `undefined` when no user is loaded.
 * @property setCurrentUser - Sets/replaces the current user snapshot.
 * @property fetchCurrentUser - Fetches and stores the current user snapshot using an access token.
 * @property clearCurrentUser - Clears the stored user snapshot.
 */
export type UserContextType = {
  currentUser?: Pick<
    UserProfileResponseDto,
    'id' | 'email' | 'unverifiedEmail' | 'defaultNickname' | 'authProvider'
  >
  setCurrentUser: (
    currentUser: Pick<
      UserProfileResponseDto,
      'id' | 'email' | 'unverifiedEmail' | 'defaultNickname' | 'authProvider'
    >,
  ) => void
  fetchCurrentUser: (accessToken: string) => Promise<void>
  clearCurrentUser: () => void
}

/**
 * React context for managing the current user profile.
 *
 * The default value provides no-ops and `undefined` for `currentUser`. Use
 * `<UserContextProvider>` to supply a real implementation.
 */
export const UserContext = createContext<UserContextType>({
  currentUser: undefined,
  setCurrentUser: () => undefined,
  fetchCurrentUser: () => Promise.reject(),
  clearCurrentUser: () => undefined,
})
