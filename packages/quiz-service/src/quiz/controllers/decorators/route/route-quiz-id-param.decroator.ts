import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `quizId` route parameter.
 *
 * This decorator ensures that the `quizId` is a valid UUID and makes it available
 * as a parameter in the request handler.
 *
 * Usage:
 * ```typescript
 * @Get(':quizId')
 * public async getQuiz(@RouteQuizIdParam() quizId: string): Promise<QuizResponse> {
 *   return this.quizService.findQuizById(quizId);
 * }
 * ```
 *
 * @returns {ParameterDecorator} The parameter decorator for `quizId`.
 */
export function RouteQuizIdParam(): ParameterDecorator {
  return Param('quizId', new ParseUUIDPipe())
}
