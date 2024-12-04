import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

/**
 * Extracts the `playerId` from the request object and verifies authorization.
 *
 * @throws {UnauthorizedException} if the `playerId` is missing or invalid.
 *
 * Usage:
 * ```typescript
 * @Get('/example')
 * public async exampleEndpoint(@AuthorizedPlayerIdParam() playerId: string): Promise<void> {
 *   console.log(playerId);
 * }
 * ```
 *
 * @param {ExecutionContext} ctx - The execution context for the request.
 * @returns The authorized `playerId` as a string.
 */
export const AuthorizedPlayerIdParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()

    const playerId = request?.client?.player?._id as string

    if (!playerId) {
      throw new UnauthorizedException('Unauthorized')
    }

    return playerId
  },
)
