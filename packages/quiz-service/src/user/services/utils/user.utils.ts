import { AuthProvider } from '@quiz/common'

import { LocalUser, User } from '../../repositories'

/**
 * Type guard to check whether a User document is a local‐auth user.
 *
 * @param user - The User document to inspect.
 * @returns True if `user.authProvider === AuthProvider.Local`, narrowing to LocalUser.
 */
export function isLocalUser(
  user: User,
): user is LocalUser & { authProvider: AuthProvider.Local } {
  return user.authProvider === AuthProvider.Local
}
