import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { JwtUserDetails, JwtUserDetailsParam } from '../../auth/decorators'
import { PlayerResponse } from '../../player/controller/models'
import { PlayerNotFoundException } from '../../player/exceptions'
import { PlayerService } from '../../player/services'
import { ClientService } from '../services'

/**
 * Controller for managing client-related operations.
 */
@ApiTags('client')
@Controller('client')
export class ClientController {
  /**
   * Initializes the ClientController.
   *
   * @param {ClientService} clientService - Service to manage clients.
   * @param {PlayerService} playerService - Service to manage players.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    private readonly clientService: ClientService,
    private readonly playerService: PlayerService,
    private readonly logger: Logger = new Logger(ClientController.name),
  ) {}

  /**
   * Retrieves the player associated with the authenticated client.
   *
   * @param {JwtUserDetails} jwtUserDetails - Details extracted from the JWT payload.
   * @returns {Promise<PlayerResponse>} The associated player details.
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
    @JwtUserDetailsParam() jwtUserDetails: JwtUserDetails,
  ): Promise<PlayerResponse> {
    const client = await this.clientService.findByClientIdHashOrThrow(
      jwtUserDetails.clientIdHash,
    )

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
}
