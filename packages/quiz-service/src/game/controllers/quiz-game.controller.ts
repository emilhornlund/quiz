import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthorizedClientParam } from '../../client/controllers/decorators/auth'
import { Client } from '../../client/services/models/schemas'
import { ApiQuizIdParam } from '../../quiz/controllers/decorators/api'
import { AuthorizedQuiz } from '../../quiz/controllers/decorators/auth'
import { RouteQuizIdParam } from '../../quiz/controllers/decorators/route'
import { GameService } from '../services'

import { CreateGameResponse } from './models/response/create-game.response'

/**
 * Controller for managing quiz-game-related operations.
 */
@ApiTags('quiz', 'game')
@Controller('/quizzes/:quizId/games')
export class QuizGameController {
  /**
   * Initializes a new instance of the QuizGameController class.
   *
   * @param {GameService} gameService - The service responsible for handling game logic.
   */
  constructor(private readonly gameService: GameService) {}

  /**
   * Creates a new game and assigns it to the authorized player.
   *
   * @param {string} quizId - The ID of the quiz to create a game from.
   * @param {Client} client - The client object containing details of the authorized client creating the game.
   *
   * @returns {CreateGameResponse} A response containing the details of the created game.
   */
  @Post()
  @AuthorizedQuiz()
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
    description: 'The client does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  async createGame(
    @RouteQuizIdParam() quizId: string,
    @AuthorizedClientParam() client: Client,
  ): Promise<CreateGameResponse> {
    return this.gameService.createGame(quizId, client)
  }
}
