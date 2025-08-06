import { AuthProvider } from '@quiz/common'

import { GoogleUser, LocalUser, NoneUser, User } from '../../repositories'

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

/**
 * Type guard to check whether a User document is a google‐auth user.
 *
 * @param user - The User document to inspect.
 * @returns True if `user.authProvider === AuthProvider.Google`, narrowing to GoogleUser.
 */
export function isGoogleUser(
  user: User,
): user is GoogleUser & { authProvider: AuthProvider.Google } {
  return user.authProvider === AuthProvider.Google
}

/**
 * Type guard to check whether a User document is a none migrated user.
 *
 * @param user - The User document to inspect.
 * @returns True if `user.authProvider === AuthProvider.None`, narrowing to NoneUser.
 */
export function isNoneMigratedUser(
  user: User,
): user is NoneUser & { authProvider: AuthProvider.None } {
  return user.authProvider === AuthProvider.None
}
