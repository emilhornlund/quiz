import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

/**
 * Represents the details extracted from the JWT payload.
 */
export interface JwtUserDetails {
  /**
   * The hashed ID of the client (`sub` claim in the JWT).
   */
  clientIdHash: string
}

/**
 * Extracts `JwtUserDetails` from the request object.
 * Throws an `UnauthorizedException` if the details are missing.
 */
export const JwtUserDetailsParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUserDetails => {
    const request = ctx.switchToHttp().getRequest()

    if (!request.jwtUserDetails) {
      throw new UnauthorizedException('Unauthorized')
    }

    return request.jwtUserDetails as JwtUserDetails
  },
)
