import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { QuizVisibility } from '@quiz/common'

import { AUTHORIZED_QUIZ_ALLOW_PUBLIC } from '../controllers/decorators/auth'
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
   * @param reflector - Used for retrieving metadata, such as if allow public.
   * @param {QuizService} quizService - Service for managing quiz-related operations.
   */
  constructor(
    private reflector: Reflector,
    private readonly quizService: QuizService,
  ) {}

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

    const quiz = await this.quizService.findQuizDocumentByIdOrThrow(quizId)

    const allowPublic =
      this.reflector.getAllAndOverride<boolean>(AUTHORIZED_QUIZ_ALLOW_PUBLIC, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false

    const isOwner = quiz.owner._id === request.client.player._id
    const isPublicQuiz = quiz.visibility === QuizVisibility.Public

    if (
      (!allowPublic && !isOwner) ||
      (allowPublic && !isPublicQuiz && !isOwner)
    ) {
      throw new ForbiddenException()
    }

    return true
  }
}
