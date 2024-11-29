import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { QuizService } from '../services'

/**
 * Guard to authorize access to quizzes based on ownership.
 *
 * Ensures that the authenticated client owns the quiz they are trying to access
 * or modify. Throws appropriate exceptions if authorization fails.
 */
@Injectable()
export class QuizAuthGuard implements CanActivate {
  /**
   * Initializes the QuizAuthGuard.
   *
   * @param {QuizService} quizService - Service for managing quiz-related operations.
   */
  constructor(private readonly quizService: QuizService) {}

  /**
   * Determines whether the request can proceed based on authorization.
   *
   * @param {ExecutionContext} context - The context of the incoming request.
   *
   * @returns {Promise<boolean>} A boolean indicating whether the request is authorized.
   *
   * @throws {UnauthorizedException} If the client is not authenticated.
   * @throws {BadRequestException} If the `quizId` parameter is missing or invalid.
   * @throws {ForbiddenException} If the client is not the owner of the quiz.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (!request.client || !request.client.player?._id) {
      throw new UnauthorizedException()
    }

    const quizId: string = request.params.quizId
    if (!quizId) {
      throw new BadRequestException()
    }

    const owner = await this.quizService.findOwnerByQuizId(quizId)

    if (owner._id !== request.client.player._id) {
      throw new ForbiddenException()
    }

    return true
  }
}
