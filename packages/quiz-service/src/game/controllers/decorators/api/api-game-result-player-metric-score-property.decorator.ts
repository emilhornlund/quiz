import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the score field in a player's performance metrics.
 *
 * Validates that the value is a number and provides Swagger documentation.
 */
export function ApiGameResultPlayerMetricScoreProperty() {
  return applyDecorators(
    ApiProperty({
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
