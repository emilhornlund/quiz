import { applyDecorators, UseGuards } from '@nestjs/common'

import { QuizRatingGuard } from '../../../guards'

/**
 * Decorator for guarding quiz rating endpoints with quiz-rating authorization.
 *
 * Applies:
 * - `@UseGuards` to enforce access control via `QuizRatingGuard`.
 */
export function AuthorizedQuizRating(): MethodDecorator {
  return applyDecorators(UseGuards(QuizRatingGuard))
}
