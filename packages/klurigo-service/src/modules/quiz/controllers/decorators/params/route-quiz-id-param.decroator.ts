import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `quizId` params parameter.
 *
 * Applies:
 * - `@Param` to bind the params parameter.
 * - `@ParseUUIDPipe` to ensure the value is a valid UUID.
 */
export function RouteQuizIdParam(): ParameterDecorator {
  return Param('quizId', new ParseUUIDPipe())
}
