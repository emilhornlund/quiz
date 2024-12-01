import { Param, ParseUUIDPipe } from '@nestjs/common'

/**
 * Decorator for validating and extracting the `questionId` route parameter.
 *
 * This decorator ensures that the `questionId` is a valid UUID and makes it available
 * as a parameter in the request handler.
 *
 * Usage:
 * ```typescript
 * @Get(':questionId')
 * public async getQuestion(@RouteQuestionIdParam() questionId: string): Promise<QuestionResponse> {
 *   return this.questionService.findQuestionById(questionId);
 * }
 * ```
 *
 * @returns {ParameterDecorator} The parameter decorator for `questionId`.
 */
export function RouteQuestionIdParam(): ParameterDecorator {
  return Param('questionId', new ParseUUIDPipe())
}
