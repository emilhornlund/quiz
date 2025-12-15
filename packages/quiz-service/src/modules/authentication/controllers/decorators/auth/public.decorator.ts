import { SetMetadata } from '@nestjs/common'

import { IS_PUBLIC_KEY } from '../../../../shared/auth'

/**
 * Decorator that marks a route or controller as public, opt-out of
 * authentication and authorization checks. When applied, the AuthGuard
 * will allow requests through without requiring a valid JWT.
 *
 * @returns A decorator function that sets `IS_PUBLIC_KEY` metadata to `true`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
