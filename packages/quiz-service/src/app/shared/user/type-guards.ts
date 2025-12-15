import { AuthProvider } from '@quiz/common'

import type {
  SharedGoogleUser,
  SharedLocalUser,
  SharedNoneUser,
} from './user.types'

type Obj = Record<string, unknown>

/**
 * Narrowing helper used by the shared structural type guards.
 */
const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null

/**
 * Type guard that checks whether the value is a local-auth user shape.
 *
 * This guard is intentionally structural and framework-agnostic so it can be used
 * with Mongoose documents and plain objects alike.
 *
 * The `hashedPassword` property is validated as a string to ensure downstream calls
 * (e.g. `bcrypt.compare`) are type-safe.
 *
 * @param user - Value to inspect.
 * @returns True if the value matches the local-auth user shape.
 */
export function isLocalUser(user: unknown): user is SharedLocalUser {
  return (
    isObject(user) &&
    user.authProvider === AuthProvider.Local &&
    typeof user.hashedPassword === 'string'
  )
}

/**
 * Type guard that checks whether the value is a Google-auth user shape.
 *
 * @param user - Value to inspect.
 * @returns True if the value matches the Google-auth user shape.
 */
export function isGoogleUser(user: unknown): user is SharedGoogleUser {
  return (
    isObject(user) &&
    user.authProvider === AuthProvider.Google &&
    typeof user.googleUserId === 'string'
  )
}

/**
 * Type guard that checks whether the value is a none/legacy user shape.
 *
 * @param user - Value to inspect.
 * @returns True if the value matches the none/legacy user shape.
 */
export function isNoneMigratedUser(user: unknown): user is SharedNoneUser {
  return isObject(user) && user.authProvider === AuthProvider.None
}
