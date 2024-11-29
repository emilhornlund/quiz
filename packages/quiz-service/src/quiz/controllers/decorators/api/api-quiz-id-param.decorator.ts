import { applyDecorators } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'

/**
 * Decorator for Swagger documentation of the `quizId` route parameter.
 *
 * Usage:
 * ```typescript
 * @Put(':quizId')
 * @ApiQuizIdParam()
 * public async updateQuiz(
 *   @RouteQuizIdParam() quizId: string,
 *   @Body() quizRequest: QuizRequest,
 * ): Promise<QuizResponse> {
 *   // Your logic here
 * }
 * ```
 *
 * @returns {MethodDecorator} The Swagger API parameter decorator.
 */
export function ApiQuizIdParam(): MethodDecorator {
  return applyDecorators(
    ApiParam({
      name: 'quizId',
      description: 'The unique identifier of the quiz.',
      required: true,
      type: String,
      format: 'uuid',
      example: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
    }),
  )
}
