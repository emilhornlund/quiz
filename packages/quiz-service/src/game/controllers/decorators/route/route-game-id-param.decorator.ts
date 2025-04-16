import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `gameID` route parameter.
 *
 * This decorator ensures that the `gameID` is a valid UUID and makes it available
 * as a parameter in the request handler.
 *
 * Usage:
 * ```typescript
 * @Get(':gameID')
 * public async getGame(@RouteGameIdParam() gameID: string): Promise<GameResponse> {
 *   return this.gameService.findGameByID(gameID);
 * }
 * ```
 *
 * @returns {ParameterDecorator} The parameter decorator for `gameID`.
 */
export function RouteGameIdParam(): ParameterDecorator {
  return Param('gameID', new ParseUUIDPipe())
}
