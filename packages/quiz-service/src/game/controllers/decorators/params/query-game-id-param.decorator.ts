import { Query } from '@nestjs/common'

import { ParseGamePINPipe } from '../../../pipes'

/**
 * Decorator for validating and extracting the `gamePIN` query parameter.
 *
 * Applies:
 * - `@Query` to bind the query parameter.
 * - `@ParseGamePINPipe` to validate and transform the value.
 */
export function QueryGameIdParam(): ParameterDecorator {
  return Query('gamePIN', new ParseGamePINPipe())
}
