import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX, QUIZ_QUESTION_MIN } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the longest correct streak field in a player's performance metrics.
 *
 * Validates that the value is a number and provides Swagger documentation.
 */
export function ApiGameResultPlayerMetricLongestCorrectStreakProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The longest streak of consecutive correct answers by the player.',
      required: true,
      type: Number,
      minimum: QUIZ_QUESTION_MIN,
      maximum: QUIZ_QUESTION_MAX,
      example: 3,
    }),
    IsNumber(),
    Min(QUIZ_QUESTION_MIN),
    Max(QUIZ_QUESTION_MAX),
  )
}
