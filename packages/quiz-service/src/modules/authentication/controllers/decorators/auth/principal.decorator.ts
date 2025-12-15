import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { TokenDto } from '@quiz/common'

import { AuthGuardRequest } from '../../../../shared/auth'
import { User } from '../../../../user/repositories'

/**
 * Parameter decorator that injects the currently authenticated user (principal)
 * into your controller handler.
 *
 * If the request has been successfully authenticated by AuthGuard and the
 * user record was attached to `request.user`, this decorator returns it.
 * Otherwise it throws an UnauthorizedException.
 *
 * The request is typed as `AuthGuardRequest<TokenDto, User>` to reflect both the JWT payload
 * and the resolved principal attached by the guard.
 *
 * @example
 * ```typescript
 * @Controller('widgets')
 * export class WidgetController {
 *   @Get()
 *   async listWidgets(@Principal() user: User) {
 *     // `user` is the full User document loaded by AuthGuard
 *     console.log('current user:', user);
 *     return this.widgetService.findAllForUser(user._id);
 *   }
 * }
 * ```
 */
export const Principal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthGuardRequest<TokenDto, User>>()
    if (!request.user) {
      throw new UnauthorizedException('Unauthorized')
    }
    return request.user
  },
)
