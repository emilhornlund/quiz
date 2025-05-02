import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `playerId` params parameter.
 *
 * Applies:
 * - `@Param` to bind the params parameter.
 * - `@ParseUUIDPipe` to ensure the value is a valid UUID.
 */
export function RoutePlayerIdParam(): ParameterDecorator {
  return Param('playerID', ParseUUIDPipe)
}
