import { AuthProvider, LocalUser, User } from '../models/schemas'

/**
 * Type guard to check whether a User document is a local‐auth user.
 *
 * @param user - The User document to inspect.
 * @returns True if `user.provider === AuthProvider.Local`, narrowing to LocalUser.
 */
export function isLocalUser(
  user: User,
): user is User & LocalUser & { provider: AuthProvider.Local } {
  return user.provider === AuthProvider.Local
}
