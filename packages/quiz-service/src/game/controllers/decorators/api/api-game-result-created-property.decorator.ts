import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

/**
 * Decorator for documenting and validating the `created` property of a game result.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsDateString` to validate the property as an ISO 8601 date string.
 */
export function ApiGameResultCreatedProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Created',
      description: 'The date and time when the game session was created.',
      type: Date,
      format: 'date-time',
      required: true,
      example: '2024-11-28T12:34:56.789Z',
    }),
    IsDateString(
      {},
      {
        message: 'The created date must be a valid ISO 8601 date string.',
      },
    ),
  )
}
