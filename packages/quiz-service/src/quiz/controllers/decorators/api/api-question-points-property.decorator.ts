import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'

/**
 * Decorator for documenting and validating the `points` property of a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to validate the value as a number.
 * - `@IsIn` to restrict the value to one of the allowed point values.
 */
export function ApiQuestionPointsProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Points',
      description:
        'The number of points awarded for a correct answer. The allowed values are 0, 1000, or 2000.',
      example: '1000',
      required: true,
      enum: [0, 1000, 2000],
    }),
    IsNumber(),
    IsIn([0, 1000, 2000]),
  )
}
