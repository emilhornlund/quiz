import { applyDecorators, UseGuards } from '@nestjs/common'

import { QuestionAuthGuard } from '../../../guards'

/**
 * Decorator for authorizing question-related requests.
 *
 * Applies the `QuestionAuthGuard` to ensure the user has the appropriate permissions
 * to access or modify a question resource.
 *
 * @returns {MethodDecorator} The method decorator to apply guards.
 */
export function AuthorizedQuestion(): MethodDecorator {
  return applyDecorators(UseGuards(QuestionAuthGuard))
}
