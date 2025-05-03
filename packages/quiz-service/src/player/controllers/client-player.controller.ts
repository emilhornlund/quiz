import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthorizedClientParam } from '../../client/controllers/decorators/auth'
import { Client } from '../../client/services/models/schemas'
import { PlayerService } from '../services'

import { PlayerLinkCodeRequest, PlayerLinkCodeResponse } from './models'
import { PlayerResponse, UpdatePlayerRequest } from './models'

/**
 * Controller for managing client-player-related operations.
 */
@ApiBearerAuth()
@ApiTags('client', 'player')
@Controller('/client/player')
export class ClientPlayerController {
  /**
   * Initializes the ClientPlayerController.
   *
   * @param playerService - Service for managing player operations.
   * @param eventEmitter - Emits domain events (e.g., when a quiz is deleted).
   */
  constructor(
    private readonly playerService: PlayerService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Retrieves the player associated with the authenticated client.
   *
   * - Uses `AuthorizedClientParam` to extract the authorized `Client` entity.
   * - If the client has no associated player, throws a `PlayerNotFoundException`.
   *
   * @param client - The authenticated client making the request.
   *
   * @returns The associated player's details.
   */
  @Get()
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
   * @returns The updated player details.
   */
  @Put()
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
   * @param client - The authenticated client making the request.
   *
   * @returns {Promise<PlayerLinkCodeResponseDto>} The associated player's link code and expiration details.
   */
  @Get('/link')
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
  @Post('/link')
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

    this.eventEmitter.emit('client.player.association.updated', {
      clientId: client._id,
      playerId: player._id,
    })

    const { _id, nickname, created, modified } = player

    return { id: _id, nickname, created, modified }
  }
}
