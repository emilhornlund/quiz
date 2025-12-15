import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX, QUIZ_QUESTION_MIN } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `unanswered` question count for a player.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum question count.
 * - `@Max` to enforce the maximum question count.
 */
export function ApiGameResultPlayerMetricUnansweredProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Unanswered',
      description: 'The total number of questions the player left unanswered.',
      required: true,
      type: Number,
      minimum: QUIZ_QUESTION_MIN,
      maximum: QUIZ_QUESTION_MAX,
      example: 1,
    }),
    IsNumber(),
    Min(QUIZ_QUESTION_MIN),
    Max(QUIZ_QUESTION_MAX),
  )
}
