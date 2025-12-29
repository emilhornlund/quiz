import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `gameID` params parameter.
 *
 * Applies:
 * - `@Param` to bind the params parameter.
 * - `@ParseUUIDPipe` to ensure the value is a valid UUID.
 */
export function RouteGameIdParam(): ParameterDecorator {
  return Param('gameID', new ParseUUIDPipe())
}
