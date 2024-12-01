import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { QuestionService } from '../services'

/**
 * Guard to authorize access to questions based on ownership.
 *
 * Ensures that the authenticated client owns the question they are trying to access
 * or modify. Throws appropriate exceptions if authorization fails.
 */
@Injectable()
export class QuestionAuthGuard implements CanActivate {
  /**
   * Initializes the QuestionAuthGuard.
   *
   * @param {QuestionService} questionService - Service for managing question-related operations.
   */
  constructor(private readonly questionService: QuestionService) {}

  /**
   * Determines whether the request can proceed based on authorization.
   *
   * @param {ExecutionContext} context - The context of the incoming request.
   *
   * @returns {Promise<boolean>} A boolean indicating whether the request is authorized.
   *
   * @throws {UnauthorizedException} If the client is not authenticated.
   * @throws {BadRequestException} If the `questionId` parameter is missing or invalid.
   * @throws {ForbiddenException} If the client is not the owner of the question.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (!request.client || !request.client.player?._id) {
      throw new UnauthorizedException()
    }

    const questionId: string = request.params.questionId

    if (!questionId) {
      throw new BadRequestException()
    }

    const owner = await this.questionService.findOwnerByQuestionId(questionId)

    if (owner._id !== request.client.player._id) {
      throw new ForbiddenException()
    }

    return true
  }
}
