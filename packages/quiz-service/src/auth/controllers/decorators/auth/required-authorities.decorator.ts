import { SetMetadata } from '@nestjs/common'
import { Authority } from '@quiz/common'

/**
 * Metadata key under which the required authorities for a route/controller are stored.
 */
export const REQUIRED_AUTHORITIES_KEY = 'required_authorities'

/**
 * Decorator that specifies which authorities (permissions) a request must have
 * in its JWT in order to access the decorated route or controller.
 * The AuthGuard will read this metadata and throw a ForbiddenException if
 * the token’s authorities do not include *all* of the listed values.
 *
 * @param authorities  One or more Authority enum values required for access.
 */
export const RequiredAuthorities = (...authorities: Authority[]) =>
  SetMetadata(REQUIRED_AUTHORITIES_KEY, authorities)
