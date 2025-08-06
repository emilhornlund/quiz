import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Authority, TokenScope } from '@quiz/common'

import {
  Principal,
  RequiredAuthorities,
  RequiresScopes,
} from '../../auth/controllers/decorators'
import { ApiQuizIdParam } from '../../quiz/controllers/decorators/api'
import { AuthorizedQuiz } from '../../quiz/controllers/decorators/auth'
import { RouteQuizIdParam } from '../../quiz/controllers/decorators/params'
import { User } from '../../user/repositories'
import { GameService } from '../services'

import { CreateGameResponse } from './models/response'

/**
 * Controller for managing quiz-game-related operations.
 */
@ApiBearerAuth()
@ApiTags('quiz', 'game')
@RequiresScopes(TokenScope.User)
@RequiredAuthorities(Authority.Game)
@Controller('/quizzes/:quizId/games')
export class QuizGameController {
  /**
   * Initializes a new instance of the QuizGameController class.
   *
   * @param {GameService} gameService - The service responsible for handling game logic.
   */
  constructor(private readonly gameService: GameService) {}

  /**
   * Creates a new game and assigns it to the authorized user.
   *
   * @param quizId - The ID of the quiz to create a game from.
   * @param user - The user object containing details of the authorized user creating the game.
   *
   * @returns A response containing the details of the created game.
   */
  @Post()
  @AuthorizedQuiz({ allowPublic: true })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new game',
    description: 'Allows users to create a new game from an existing quiz.',
  })
  @ApiQuizIdParam()
  @ApiCreatedResponse({
    description: 'The game has been successfully created.',
    type: CreateGameResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The user does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  async createGame(
    @RouteQuizIdParam() quizId: string,
    @Principal() user: User,
  ): Promise<CreateGameResponse> {
    return this.gameService.createGame(quizId, user)
  }
}
