import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { TokenDto } from '@quiz/common'

import { AuthGuardRequest } from '../../../../shared/auth'
import { User } from '../../../../user/repositories'

/**
 * Parameter decorator that injects the authenticated user's unique identifier.
 *
 * Retrieves `principalId` (the `sub` claim) from the request, as set by AuthGuard.
 *
 * The request is typed as `AuthGuardRequest<TokenDto, User>` to reflect both the JWT payload
 * and the resolved principal attached by the guard.
 *
 * @example
 * ```ts
 * @Get('me')
 * getProfile(@PrincipalId() userId: string) {
 *   return this.userService.findById(userId);
 * }
 * ```
 *
 * @param _unused Always ignored.
 * @param ctx     Nest execution context, used to access the raw request.
 * @returns       The authenticated user's principal ID.
 * @throws        {UnauthorizedException} if no `principalId` is found on the request.
 */
export const PrincipalId = createParamDecorator(
  (_unused: unknown, ctx: ExecutionContext): string => {
    const req = ctx
      .switchToHttp()
      .getRequest<AuthGuardRequest<TokenDto, User>>()
    if (!req.payload.sub) {
      throw new UnauthorizedException('Missing principalId on request')
    }
    return req.payload.sub
  },
)
