import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { Observable } from 'rxjs'

import { Public } from '../../app/decorators'
import { AuthorizedClientID, AuthorizedGameID } from '../../auth/decorators'
import { ParseCreateGameRequestPipe, ParseGamePINPipe } from '../pipes'
import { GameEventService, GameService } from '../services'

import { GameIdParam } from './decorators'
import {
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
} from './models/requests'
import { JoinGameRequest } from './models/requests/join-game.request'
import {
  CreateGameResponse,
  FindGameResponse,
  JoinGameResponse,
} from './models/response'

@ApiExtraModels(
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
)
@ApiTags('game')
@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameEventService: GameEventService,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new game',
    description:
      'Allows users to create a new game in either Classic Mode or Zero to One Hundred Mode. The request must specify a name and a list of questions for the selected mode.',
  })
  @ApiBody({
    description: 'Request body for creating a new game.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateClassicModeGameRequest) },
        { $ref: getSchemaPath(CreateZeroToOneHundredModeGameRequest) },
      ],
    },
  })
  @ApiCreatedResponse({
    description: 'The game has been successfully created.',
    type: CreateGameResponse,
  })
  async createGame(
    @Body(new ParseCreateGameRequestPipe())
    createGameRequest:
      | CreateClassicModeGameRequest
      | CreateZeroToOneHundredModeGameRequest,
  ): Promise<CreateGameResponse> {
    return await this.gameService.createGame(createGameRequest)
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve an active game by its PIN',
    description:
      'Fetches an active game using the provided unique 6-digit game PIN. The game must have been created within the last 6 hours to be considered active.',
  })
  @ApiQuery({
    name: 'gamePIN',
    type: String,
    description: 'The unique 6-digit PIN for the game to be retrieved.',
    required: true,
    example: '123456',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the active game.',
    type: FindGameResponse,
  })
  @ApiNotFoundResponse({
    description: 'No active game found with the specified game PIN.',
  })
  async findGame(
    @Query('gamePIN', new ParseGamePINPipe()) gamePIN: string,
  ): Promise<FindGameResponse> {
    return this.gameService.findActiveGameByGamePIN(gamePIN)
  }

  @Public()
  @Post('/:gameID/players')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Join a game',
    description:
      'Allows a player to join an existing game by providing the game ID. Returns a unique player identifier and a token for the player.',
  })
  @ApiBody({
    description: 'Request body for joining an existing game.',
    type: JoinGameRequest,
  })
  @ApiCreatedResponse({
    description: 'The game has been successfully joined.',
    type: JoinGameResponse,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request, possibly due to malformed game ID or validation error.',
  })
  @ApiNotFoundResponse({
    description: 'No game found with the specified unique identifier.',
  })
  @GameIdParam()
  async joinGame(
    @Param('gameID', ParseUUIDPipe) gameID: string,
    @Body() request: JoinGameRequest,
  ): Promise<JoinGameResponse> {
    return this.gameService.joinGame(gameID, request.nickname)
  }

  /**
   * Subscribes a client to receive real-time game events through Server-Sent Events (SSE).
   *
   * Clients receive both general and client-specific game events, including
   * heartbeat events for connection monitoring and game updates relevant to the subscribed game.
   *
   * @param gameID - The unique identifier of the game to subscribe to.
   * @param authorizedGameID - The unique identifier of the game to subscribe to, extracted from the authenticated token.
   * @param clientId - The unique identifier of the client, extracted from the authenticated token.
   * @returns An Observable stream of MessageEvent objects for SSE, where each event contains data in JSON format.
   */
  @Sse('/:gameID/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Subscribe to game events',
    description:
      'Provides a stream of real-time game events for the specified game ID. Requires an active game subscription and a valid client token for access. Events are sent in Server-Sent Events (SSE) format, allowing clients to receive continuous updates.',
  })
  @ApiOkResponse({
    description:
      'Successfully subscribed to game events. Returns a continuous stream of events.',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'string', description: 'Event data in JSON format' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No active game found with the specified game ID.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid game ID format or missing authorization token.',
  })
  @GameIdParam()
  public async getEventStream(
    @Param('gameID', ParseUUIDPipe) gameID: string,
    @AuthorizedGameID() authorizedGameID: string,
    @AuthorizedClientID() clientId: string,
  ): Promise<Observable<MessageEvent>> {
    if (gameID !== authorizedGameID) {
      throw new UnauthorizedException('Unauthorized game access')
    }
    return this.gameEventService.getEventStream(gameID, clientId)
  }
}
