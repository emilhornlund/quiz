import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { TokenDto } from '@quiz/common'

import { AuthGuardRequest } from '../../../../shared/auth'
import { User } from '../../../../user/repositories'

/**
 * Parameter decorator that extracts the full JWT payload from the request.
 *
 * The request is typed as `AuthGuardRequest<TokenDto, User>` to reflect both the JWT payload
 * and the resolved principal attached by the guard.
 *
 * Applies:
 * - Retrieves the `TokenDto` payload attached by `AuthGuard`.
 * - Throws `UnauthorizedException` if no payload is present.
 */
export const JwtPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenDto => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthGuardRequest<TokenDto, User>>()
    if (!request.payload) {
      throw new UnauthorizedException('Unauthorized')
    }
    return request.payload
  },
)
