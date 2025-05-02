import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `score` metric for a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce a minimum of 0.
 * - `@Max` to enforce a maximum based on quiz configuration.
 */
export function ApiGameResultPlayerMetricScoreProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Score',
      description: "The player's total score at the end of the game.",
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
