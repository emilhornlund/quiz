import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QUIZ_QUESTION_MAX, QUIZ_QUESTION_MIN } from '@quiz/common'
import { IsNumber, Max, Min } from 'class-validator'

/**
 * Decorator for documenting and validating the `numberOfQuestions` property.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsNumber` to validate the value as a number.
 * - `@Min` to enforce a minimum of `QUIZ_QUESTION_MIN`.
 * - `@Max` to enforce a maximum of `QUIZ_QUESTION_MAX`.
 */
export function ApiGameResultNumberOfQuestionsProperty() {
  return applyDecorators(
    ApiProperty({
      title: 'Number Of Questions',
      description: 'Total number of questions included in this game session.',
      required: true,
      type: Number,
      minimum: QUIZ_QUESTION_MIN,
      maximum: QUIZ_QUESTION_MAX,
      example: 10,
    }),
    IsNumber(),
    Min(QUIZ_QUESTION_MIN),
    Max(QUIZ_QUESTION_MAX),
  )
}
