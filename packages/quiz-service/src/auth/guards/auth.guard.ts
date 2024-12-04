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
import { AuthService } from '../services'

/**
 * Custom authorization guard that ensures requests are authenticated.
 *
 * This guard checks if the request contains a valid JWT token in the
 * Authorization header. For public routes marked with the `@Public`
 * decorator, the guard allows access without requiring authentication.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Creates a new instance of the AuthGuard.
   *
   * @param reflector - Used to retrieve metadata such as the `IS_PUBLIC_KEY`
   *                    to determine if the route is public.
   * @param authService - Service for validating and decoding game tokens.
   * @param clientService - Service for retrieving client information.
   */
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private clientService: ClientService,
  ) {}

  /**
   * Determines whether the current request is authorized.
   *
   * If the route is public, the method allows access without further checks.
   * Otherwise, it verifies the JWT token and ensures the client exists in the system.
   *
   * @param context - The execution context of the current request.
   * @returns A promise that resolves to `true` if the request is authorized,
   *          otherwise throws an `UnauthorizedException`.
   *
   * @throws UnauthorizedException if the token is missing, invalid, or
   *         if the associated client cannot be found.
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
      const { sub } = await this.authService.verifyToken(token)

      request['client'] =
        await this.clientService.findByClientIdHashOrThrow(sub)
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  /**
   * Extracts the JWT token from the Authorization header of the HTTP request.
   *
   * @param request - The incoming HTTP request.
   * @returns The extracted token as a string if the header is present and valid;
   *          otherwise, `undefined`.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
