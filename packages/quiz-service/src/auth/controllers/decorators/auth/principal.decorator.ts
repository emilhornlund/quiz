import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

import { User } from '../../../../user/repositories'
import { AuthGuardRequest } from '../../../guards'

/**
 * Parameter decorator that injects the currently authenticated user (principal)
 * into your controller handler.
 *
 * If the request has been successfully authenticated by AuthGuard and the
 * user record was attached to `request.user`, this decorator returns it.
 * Otherwise it throws an UnauthorizedException.
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
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<AuthGuardRequest>()
    if (!request.user) {
      throw new UnauthorizedException('Unauthorized')
    }
    return request.user
  },
)
