import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

/**
 * Decorator for documenting and validating the `updated` property of a quiz.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsDateString` to validate the value as an ISO 8601 date string.
 */
export function ApiQuizUpdatedProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Updated',
      description: 'The date and time when the quiz was last updated.',
      type: Date,
      format: 'date-time',
      example: '2024-11-28T12:34:56.789Z',
      required: true,
    }),
    IsDateString(
      {},
      {
        message: 'The updated date must be a valid ISO 8601 date string.',
      },
    ),
  )
}
