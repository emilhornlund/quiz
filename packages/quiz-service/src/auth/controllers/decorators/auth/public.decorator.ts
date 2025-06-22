import { SetMetadata } from '@nestjs/common'

/**
 * Metadata key used to mark a route or controller as publicly accessible,
 * i.e. no authentication or authorization checks will be applied.
 */
export const IS_PUBLIC_KEY = 'isPublic'

/**
 * Decorator that marks a route or controller as public, opt-out of
 * authentication and authorization checks. When applied, the AuthGuard
 * will allow requests through without requiring a valid JWT.
 *
 * @returns A decorator function that sets `IS_PUBLIC_KEY` metadata to `true`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
