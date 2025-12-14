import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { TokenDto } from '@quiz/common'

import { AuthGuardRequest } from '../../../guards'

/**
 * Parameter decorator that extracts the full JWT payload from the request.
 *
 * Applies:
 * - Retrieves the `TokenDto` payload attached by `AuthGuard`.
 * - Throws `UnauthorizedException` if no payload is present.
 */
export const JwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenDto => {
    const request = ctx.switchToHttp().getRequest<AuthGuardRequest<TokenDto>>()
    if (!request.payload) {
      throw new UnauthorizedException('Unauthorized')
    }
    return request.payload
  },
)
