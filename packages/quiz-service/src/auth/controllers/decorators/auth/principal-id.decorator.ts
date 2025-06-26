import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

import { AuthGuardRequest } from '../../../guards'

/**
 * Parameter decorator that injects the authenticated user's unique identifier.
 *
 * Retrieves `principalId` (the `sub` claim) from the request, as set by AuthGuard.
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
    const req = ctx.switchToHttp().getRequest<AuthGuardRequest>()
    if (!req.principalId) {
      throw new UnauthorizedException('Missing principalId on request')
    }
    return req.principalId
  },
)
