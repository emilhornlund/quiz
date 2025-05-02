import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `score` property of a participant.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum value.
 * - `@Max` to enforce the maximum value.
 */
export function ApiGameParticipantScoreProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Score',
      description: 'The total score the participant earned during the game.',
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
