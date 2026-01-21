import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'

/**
 * Decorator for documenting and validating the `duration` property of a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to validate the value as a number.
 * - `@IsIn` to restrict the value to a predefined set.
 */
export function ApiQuestionDurationProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Duration',
      description:
        'The time limit for answering the question, in seconds. The allowed values are 5, 10, 20, 30, 45, 60, 90, 120, 180 or 240.',
      example: '30',
      required: true,
      enum: [5, 10, 20, 30, 45, 60, 90, 120, 180, 240],
    }),
    IsNumber(),
    IsIn([5, 10, 20, 30, 45, 60, 90, 120, 180, 240]),
  )
}
