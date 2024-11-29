import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { ClientService } from '../../client/services'
import { IS_PUBLIC_KEY } from '../decorators'
import { IS_LEGACY_AUTH_KEY } from '../decorators/legacy-auth.decorator'
import { AuthService } from '../services'

/**
 * Custom authorization guard that checks if the request has a valid game token and,
 * if present, extracts the client ID, game ID, and client role.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private clientService: ClientService,
  ) {}

  /**
   * Validates the game token and extracts essential parameters like client ID,
   * game ID, and client role for further authorization checks.
   *
   * @param context - The execution context of the current request.
   *
   * @returns True if the request is authorized, otherwise false.
   *
   * @throws UnauthorizedException if the token is missing or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const { sub, gameID, role } =
        await this.authService.verifyGameToken(token)

      const isLegacyAuth = this.reflector.getAllAndOverride<boolean>(
        IS_LEGACY_AUTH_KEY,
        [context.getHandler(), context.getClass()],
      )

      if (isLegacyAuth) {
        request['gameID'] = gameID
        request['clientId'] = sub
        request['clientRole'] = role
      } else {
        request['client'] =
          await this.clientService.findByClientIdHashOrThrow(sub)
      }
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  /**
   * Extracts the JWT token from the Authorization header.
   * @param request - The HTTP request.
   * @returns The token if present and valid, undefined otherwise.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
