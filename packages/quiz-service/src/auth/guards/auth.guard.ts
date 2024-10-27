import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

import { IS_PUBLIC_KEY } from '../../app/decorators'

/**
 * Guard to handle JWT-based authentication.
 * Verifies the token from the Authorization header and grants access if valid.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  /**
   * Determines if the current request is authorized.
   * @param context - The execution context of the current request.
   * @returns True if the request is authorized, otherwise false.
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
      await this.jwtService.verifyAsync(token)
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
