import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'

import { QuizAuthGuard } from '../../../guards'

export const AUTHORIZED_QUIZ_ALLOW_PUBLIC = 'authorizedQuizAllowPublic'

/**
 * Decorator for authorizing quiz-related requests.
 *
 * Applies the `QuizAuthGuard` to ensure the user has the appropriate permissions
 * to access or modify a quiz resource.
 *
 * @param options.allowPublic - If `true`, allows access to public quizzes even if the user is not the owner.
 *                              If `false`, only the quiz owner can access private quizzes.
 *
 * @returns {MethodDecorator} The method decorator to apply guards.
 */
export function AuthorizedQuiz(
  options: { allowPublic: boolean } = { allowPublic: false },
): MethodDecorator {
  return applyDecorators(
    SetMetadata(AUTHORIZED_QUIZ_ALLOW_PUBLIC, options.allowPublic),
    UseGuards(QuizAuthGuard),
  )
}
