import { applyDecorators, UseGuards } from '@nestjs/common'

import { QuizAuthGuard } from '../../../guards'

/**
 * Decorator for authorizing quiz-related requests.
 *
 * Applies the `QuizAuthGuard` to ensure the user has the appropriate permissions
 * to access or modify a quiz resource.
 *
 * @returns {MethodDecorator} The method decorator to apply guards.
 */
export function AuthorizedQuiz(): MethodDecorator {
  return applyDecorators(UseGuards(QuizAuthGuard))
}
