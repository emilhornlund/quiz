import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX, QUIZ_QUESTION_MIN } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for the unanswered field in a question's aggregated metrics.
 *
 * Validates the number value and generates Swagger documentation.
 */
export function ApiGameResultQuestionMetricUnansweredProperty() {
  return applyDecorators(
    ApiProperty({
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
