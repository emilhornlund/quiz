import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  PlayerResponse,
  UpdatePlayerRequest,
} from '../../player/controller/models'
import { PlayerNotFoundException } from '../../player/exceptions'
import { PlayerService } from '../../player/services'
import { PaginatedQuizResponse } from '../../quiz/controllers/models'
import { QuizService } from '../../quiz/services'
import { ClientService } from '../services'
import { Client } from '../services/models/schemas'

import { ApiQuizPageQueryFilter } from './decorators/api'
import { AuthorizedClientParam } from './decorators/auth'
import { PlayerLinkCodeRequest, PlayerLinkCodeResponse } from './models'

/**
 * Controller for managing client-related operations.
 */
@ApiBearerAuth()
@ApiTags('client')
@Controller('client')
export class ClientController {
  /**
   * Initializes the ClientController.
   *
   * @param {PlayerService} playerService - Service to manage players.
   * @param {ClientService} clientService - Service to manage client data.
   * @param {QuizService} quizService - Service responsible for managing quiz-related operations.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    private readonly playerService: PlayerService,
    private readonly clientService: ClientService,
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
   * Updates the authenticated client's associated player profile.
   *
   * @param client - The authenticated client making the request.
   * @param request - The update details for the player profile.
   *
   * @throws {PlayerNotFoundException} If the associated player does not exist.
   *
   * @returns {Promise<PlayerResponse>} The updated player details.
   */
  @Put('/player')
  @ApiOperation({
    summary: 'Update the associated player',
    description:
      'Updates the nickname of the authenticated client’s associated player.',
  })
  @ApiBody({
    description: 'Payload containing the new nickname for the player.',
    type: UpdatePlayerRequest,
  })
  @ApiOkResponse({
    description: 'Successfully updated the player’s profile.',
    type: PlayerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. The client must be authenticated.',
  })
  @ApiNotFoundResponse({
    description: 'The player associated with the client was not found.',
  })
  @HttpCode(HttpStatus.OK)
  public async updateClientAssociatedPlayer(
    @AuthorizedClientParam() client: Client,
    @Body() request: UpdatePlayerRequest,
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
    } = await this.playerService.updatePlayer(
      client.player._id,
      request.nickname,
    )

    return { id, nickname, created, modified }
  }

  /**
   * Retrieves the client's associated player link code.
   *
   * @param {Client} client - The authenticated client making the request.
   *
   * @returns {Promise<PlayerLinkCodeResponseDto>} The associated player's link code and expiration details.
   */
  @Get('/player/link')
  @ApiOperation({
    summary: 'Retrieve the associated player link code.',
    description:
      'This endpoint retrieves the link code that is associated with the authenticated client.',
  })
  @ApiOkResponse({
    description: "Successfully retrieved the associated player's link code.",
    type: PlayerLinkCodeResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiNotFoundResponse({
    description: 'The associated player or client was not found.',
  })
  @HttpCode(HttpStatus.OK)
  public async getClientAssociatedPlayerLinkCode(
    @AuthorizedClientParam() client: Client,
  ): Promise<PlayerLinkCodeResponse> {
    return this.playerService.generateLinkCode(client)
  }

  /**
   * Associates a player from a valid link code.
   *
   * @param {Client} client - The authenticated client making the request.
   * @param {PlayerLinkCodeRequest} request - The request containing the link code.
   *
   * @returns {Promise<PlayerResponse>} The associated player's details.
   */
  @Post('/player/link')
  @ApiOperation({
    summary: 'Associate a player using a link code.',
    description: 'This endpoint associates a player with a valid link code.',
  })
  @ApiOkResponse({
    description: 'Successfully associated the player with the link code.',
    type: PlayerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiNotFoundResponse({
    description: 'The associated player or client was not found.',
  })
  @HttpCode(HttpStatus.OK)
  public async setClientAssociatedPlayerFromLinkCode(
    @AuthorizedClientParam() client: Client,
    @Body() request: PlayerLinkCodeRequest,
  ): Promise<PlayerResponse> {
    const player = await this.playerService.findPlayerByLinkCodeOrThrow(
      request.code,
    )

    await this.clientService.setPlayer(client, player)

    const { _id, nickname, created, modified } = player

    return { id: _id, nickname, created, modified }
  }

  /**
   * Retrieves the quizzes associated with the authenticated client.
   *
   * @param {Client} client - The authenticated client making the request.
   *
   * @param {ApiQuizPageQueryFilter} queryParams - The pagination and filtering query parameters for retrieving quizzes.
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
    queryParams: ApiQuizPageQueryFilter,
  ): Promise<PaginatedQuizResponse> {
    return this.quizService.findQuizzesByOwnerId(
      client.player._id,
      queryParams.search,
      queryParams.mode,
      queryParams.visibility,
      queryParams.category,
      queryParams.languageCode,
      queryParams.sort,
      queryParams.order,
      queryParams.limit,
      queryParams.offset,
    )
  }
}
