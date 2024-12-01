import { applyDecorators } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'

/**
 * Decorator for Swagger documentation of the `questionId` route parameter.
 *
 * Usage:
 * ```typescript
 * @Put(':questionId')
 * @ApiQuestionIdParam()
 * public async updateQuestion(
 *   @RouteQuestionIdParam() questionId: string,
 *   @Body() questionRequest: QuestionRequest,
 * ): Promise<QuestionResponse> {
 *   // Your logic here
 * }
 * ```
 *
 * @returns {MethodDecorator} The Swagger API parameter decorator.
 */
export function ApiQuestionIdParam(): MethodDecorator {
  return applyDecorators(
    ApiParam({
      name: 'questionId',
      description: 'The unique identifier of the question.',
      required: true,
      type: String,
      format: 'uuid',
      example: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
    }),
  )
}
