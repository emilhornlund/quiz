import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX, QUIZ_QUESTION_MIN } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `unanswered` player count for a question.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to ensure the value is a number.
 * - `@Min` to enforce the minimum player count.
 * - `@Max` to enforce the maximum player count.
 */
export function ApiGameResultQuestionMetricUnansweredProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Unanswered',
      description: 'The number of players who left the question unanswered.',
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
