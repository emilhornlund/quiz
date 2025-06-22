import { SetMetadata } from '@nestjs/common'
import { TokenScope } from '@quiz/common'

/**
 * Metadata key under which the required token scopes for a route/controller are stored.
 */
export const REQUIRED_SCOPES_KEY = 'required_scopes'

/**
 * Decorator that specifies which broad token scopes a request must carry
 * in order to access the decorated route or controller. The AuthGuard will
 * read this metadata and throw a ForbiddenException if the token’s scope
 * is not one of the listed values.
 *
 * @param scopes  One or more TokenScope enum values allowed for access.
 */
export const RequiresScopes = (...scopes: TokenScope[]) =>
  SetMetadata(REQUIRED_SCOPES_KEY, scopes)
