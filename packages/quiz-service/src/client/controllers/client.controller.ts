import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { PlayerResponse } from '../../player/controller/models'
import { PlayerNotFoundException } from '../../player/exceptions'
import { PlayerService } from '../../player/services'
import { PaginatedQuizResponse } from '../../quiz/controllers/models'
import { QuizService } from '../../quiz/services'
import { Client } from '../services/models/schemas'

import { ApiQuizPageQuery } from './decorators/api'
import { AuthorizedClientParam } from './decorators/auth'

/**
 * Controller for managing client-related operations.
 */
@ApiTags('client')
@Controller('client')
export class ClientController {
  /**
   * Initializes the ClientController.
   *
   * @param {PlayerService} playerService - Service to manage players.
   * @param {QuizService} quizService - Service responsible for managing quiz-related operations.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    private readonly playerService: PlayerService,
    private readonly quizService: QuizService,
    private readonly logger: Logger = new Logger(ClientController.name),
  ) {}

  /**
   * Retrieves the player associated with the authenticated client.
   *
   * - Uses `AuthorizedClientParam` to extract the authorized `Client` entity.
   * - If the client has no associated player, throws a `PlayerNotFoundException`.
   *
   * @param {Client} client - The authenticated client making the request.
   *
   * @returns {Promise<PlayerResponse>} The associated player's details.
   */
  @Get('/player')
  @ApiOperation({
    summary: 'Retrieve associated player',
    description: 'Fetches the player associated with the authenticated client.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the associated player.',
    type: PlayerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiNotFoundResponse({
    description: 'The associated player or client was not found.',
  })
  @HttpCode(HttpStatus.OK)
  public async getClientAssociatedPlayer(
    @AuthorizedClientParam() client: Client,
  ): Promise<PlayerResponse> {
    if (!client?.player?._id) {
      this.logger.warn(`Player was not found by id 'undefined'.`)
      throw new PlayerNotFoundException('undefined')
    }

    const {
      _id: id,
      nickname,
      created,
      modified,
    } = await this.playerService.findPlayerOrThrow(client.player._id)

    return { id, nickname, created, modified }
  }

  /**
   * Retrieves the quizzes associated with the authenticated client.
   *
   * @param {Client} client - The authenticated client making the request.
   *
   * @param {ApiQuizPageQuery} queryParams - description here
   *
   * @returns {Promise<PaginatedQuizResponse>} A paginated response containing the client's associated quizzes.
   */
  @Get('/quizzes')
  @ApiOperation({
    summary: 'Retrieve associated quizzes',
    description:
      'Fetches a paginated list of quizzes associated with the authenticated client.',
  })
  @ApiOkResponse({
    description: "Successfully retrieved the associated client's quizzes.",
    type: PaginatedQuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  public async getClientAssociatedQuizzes(
    @AuthorizedClientParam() client: Client,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: ApiQuizPageQuery,
  ): Promise<PaginatedQuizResponse> {
    return this.quizService.findQuizzesByOwnerId(
      client.player._id,
      queryParams.limit,
      queryParams.offset,
    )
  }
}
