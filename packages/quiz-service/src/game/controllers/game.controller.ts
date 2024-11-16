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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { GameParticipantType } from '@quiz/common'
import { Observable } from 'rxjs'

import {
  AuthorizedClientID,
  AuthorizedGameID,
  GameClientRoles,
  Public,
} from '../../auth/decorators'
import {
  ParseCreateGameRequestPipe,
  ParseGamePINPipe,
  ParseSubmitQuestionAnswerRequestPipe,
} from '../pipes'
import { GameEventSubscriber, GameService } from '../services'

import { GameIdParam } from './decorators'
import {
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
  JoinGameRequest,
  SubmitMultiChoiceQuestionAnswerRequest,
  SubmitRangeQuestionAnswerRequest,
  SubmitTrueFalseQuestionAnswerRequest,
  SubmitTypeAnswerQuestionAnswerRequest,
} from './models/requests'
import { FindGameResponse, GameAuthResponse } from './models/response'

/**
 * GameController handles incoming HTTP requests related to game operations,
 * such as creating games and subscribing to game events.
 */
@ApiExtraModels(
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
  SubmitMultiChoiceQuestionAnswerRequest,
  SubmitRangeQuestionAnswerRequest,
  SubmitTrueFalseQuestionAnswerRequest,
  SubmitTypeAnswerQuestionAnswerRequest,
)
@ApiTags('game')
@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameEventSubscriber: GameEventSubscriber,
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
    type: GameAuthResponse,
  })
  async createGame(
    @Body(new ParseCreateGameRequestPipe())
    createGameRequest:
      | CreateClassicModeGameRequest
      | CreateZeroToOneHundredModeGameRequest,
  ): Promise<GameAuthResponse> {
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
    type: GameAuthResponse,
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
  ): Promise<GameAuthResponse> {
    return this.gameService.joinGame(gameID, request.nickname)
  }

  /**
   * Subscribes a client to game events via Server-Sent Events (SSE).
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
    return this.gameEventSubscriber.subscribe(gameID, clientId)
  }

  /**
   * Completes the current active task for the specified game.
   *
   * Requires the caller to be the host and the current task status to be 'active'.
   *
   * @param {string} gameID - The ID of the game.
   * @param {string} authorizedGameID - The ID of the game verified by the guard.
   *
   * @throws {UnauthorizedException} if the caller does not have host privileges
   *                                 or the game ID does not match the authorized game ID.
   * @throws {BadRequestException} if the current task is not in 'active' status.
   */
  @Post('/:gameID/tasks/current/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marks the current task as complete for the active game session.',
    description:
      'This endpoint allows a game host to mark the active task as complete when all players have responded or the task has otherwise been concluded.',
  })
  @ApiNotFoundResponse({
    description: 'No active game found with the specified game ID.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid game ID format or task not in active status.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access or invalid client role.',
  })
  @GameClientRoles(GameParticipantType.HOST)
  @GameIdParam()
  public async completeTask(
    @Param('gameID', ParseUUIDPipe) gameID: string,
    @AuthorizedGameID() authorizedGameID: string,
  ): Promise<void> {
    if (gameID !== authorizedGameID) {
      throw new UnauthorizedException('Unauthorized game access')
    }
    await this.gameService.completeCurrentTask(gameID)
  }

  /**
   * Handles the submission of an answer for the current question in a game.
   *
   * @param {string} gameID - The ID of the game.
   * @param {string} authorizedGameID - The ID of the game verified by the guard.
   * @param {string} clientId - The ID of the client submitting the answer.
   * @param {object} submitQuestionAnswerRequest - The request body containing the answer details.
   */
  @Post('/:gameID/answers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Submit an answer for the current question',
    description:
      'Allows a player to submit their answer for the current active question in the game.',
  })
  @ApiBody({
    description: 'Request body for submitting an answer.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(SubmitMultiChoiceQuestionAnswerRequest) },
        { $ref: getSchemaPath(SubmitRangeQuestionAnswerRequest) },
        { $ref: getSchemaPath(SubmitTrueFalseQuestionAnswerRequest) },
        { $ref: getSchemaPath(SubmitTypeAnswerQuestionAnswerRequest) },
      ],
    },
  })
  @ApiNoContentResponse({
    description: 'The answer has been successfully submitted.',
  })
  @GameClientRoles(GameParticipantType.PLAYER)
  @GameIdParam()
  public async submitQuestionAnswer(
    @Param('gameID', ParseUUIDPipe) gameID: string,
    @AuthorizedGameID() authorizedGameID: string,
    @AuthorizedClientID() clientId: string,
    @Body(new ParseSubmitQuestionAnswerRequestPipe())
    submitQuestionAnswerRequest:
      | SubmitMultiChoiceQuestionAnswerRequest
      | SubmitRangeQuestionAnswerRequest
      | SubmitTrueFalseQuestionAnswerRequest
      | SubmitTypeAnswerQuestionAnswerRequest,
  ): Promise<void> {
    if (gameID !== authorizedGameID) {
      throw new UnauthorizedException('Unauthorized game access')
    }
    return this.gameService.submitQuestionAnswer(
      gameID,
      clientId,
      submitQuestionAnswerRequest,
    )
  }
}
