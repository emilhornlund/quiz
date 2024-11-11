import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GameParticipantType } from '@quiz/common'

import { GAME_CLIENT_ROLES_KEY } from '../decorators'

@Injectable()
export class GameClientRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      GameParticipantType[]
    >(GAME_CLIENT_ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    if (!request.clientRole) {
      throw new UnauthorizedException('Client Role is missing or unauthorized.')
    }

    return requiredRoles.some((role) => role === request.clientRole)
  }
}
