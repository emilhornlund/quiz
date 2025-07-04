import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthorizedClientParam } from '../../client/controllers/decorators/auth'
import { Client } from '../../client/services/models/schemas'
import { GameService } from '../services'

import { GameHistoryPageFilter } from './models'
import {
  GameHistoryHostResponse,
  GameHistoryPlayerResponse,
  PaginatedGameHistoryResponse,
} from './models/response'

/**
 * Controller for retrieving games associated with a client.
 */
@ApiBearerAuth()
@ApiTags('client', 'game')
@ApiExtraModels(GameHistoryHostResponse, GameHistoryPlayerResponse)
@Controller('/client/games')
export class ClientGameController {
  /**
   * Initializes the ClientGameController.
   *
   * @param gameService - Service for managing game operations.
   */
  constructor(private readonly gameService: GameService) {}

  /**
   * Retrieves the games associated with the authenticated client.
   *
   * @param client - The authenticated client making the request.
   * @param filter - The pagination parameters.
   * @returns A paginated list of games where the client is a participant.
   */
  @Get()
  @ApiOperation({
    summary: 'Get client-associated games',
    description:
      'Retrieves a paginated list of games where the authenticated client has participated.',
  })
  @ApiQuery({
    name: 'offset',
    description: 'The number of games to skip before starting retrieval.',
    type: Number,
    required: false,
    example: 0,
  })
  @ApiQuery({
    name: 'limit',
    description: 'The maximum number of games to retrieve per page.',
    type: Number,
    required: false,
    example: 10,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of associated games.',
    type: PaginatedGameHistoryResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @HttpCode(HttpStatus.OK)
  public async getClientAssociatedGames(
    @AuthorizedClientParam() client: Client,
    @Query(new ValidationPipe({ transform: true }))
    filter: GameHistoryPageFilter,
  ): Promise<PaginatedGameHistoryResponse> {
    return this.gameService.findGamesByPlayerId(
      client.player._id,
      filter.offset ?? 0,
      filter.limit ?? 5,
    )
  }
}
