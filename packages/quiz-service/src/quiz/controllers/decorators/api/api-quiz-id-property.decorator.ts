import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

/**
 * Decorator for Swagger documentation of the `id` property.
 *
 * This decorator applies validation and API documentation to the quiz ID field.
 * It ensures that the property:
 * - Is required.
 * - Is a valid UUID string.
 *
 * Example usage:
 * ```typescript
 * import { QuizIdProperty } from './decorators';
 *
 * export class QuizDto {
 *   @QuizIdProperty()
 *   quizId: string;
 * }
 * ```
 *
 * Applied decorators:
 * - `@ApiProperty` to include metadata in the OpenAPI documentation.
 * - `@IsUUID` to enforce the value must be a valid UUID string.
 *
 * @returns {PropertyDecorator} The combined property decorator.
 */
export function ApiQuizIdProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      description: 'The unique identifier of the quiz.',
      required: true,
      type: String,
      format: 'uuid',
      example: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
    }),
    IsUUID(),
  )
}
