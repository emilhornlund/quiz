import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating a participant's score.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to validate the property as a number.
 * - `@Min` to ensure the score is not negative.
 * - `@Max` to ensure the score does not exceed the maximum possible score.
 */
export function ApiGameParticipantScoreProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'description here.',
      required: true,
      type: Number,
      minimum: 0,
      maximum: QUIZ_QUESTION_MAX * 2000,
      example: 7689,
    }),
    IsNumber(),
    Min(0),
    Max(QUIZ_QUESTION_MAX * 2000),
  )
}
