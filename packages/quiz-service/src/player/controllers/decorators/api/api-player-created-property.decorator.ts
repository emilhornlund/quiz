import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

/**
 * Decorator for documenting and validating the `created` property of a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsDateString` to validate the property as a valid ISO 8601 date string.
 */
export function ApiPlayerCreatedProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Created',
      description: 'The date and time when the player was created.',
      type: Date,
      format: 'date-time',
      example: '2024-11-28T12:34:56.789Z',
      required: true,
    }),
    IsDateString(
      {},
      {
        message: 'The created date must be a valid ISO 8601 date string.',
      },
    ),
  )
}
