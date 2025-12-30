import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

/**
 * Decorator for documenting and validating the `id` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsUUID` to ensure the value is a valid UUID.
 */
export function ApiQuizIdProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Quiz ID',
      description: 'The unique identifier of the quiz.',
      required: true,
      type: String,
      format: 'uuid',
      example: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
    }),
    IsUUID(),
  )
}
