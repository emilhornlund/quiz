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

import { AuthorizedPlayerIdParam } from '../../client/controllers/decorators/auth'
import {
  ParseCreateGameRequestPipe,
  ParseGamePINPipe,
  ParseSubmitQuestionAnswerRequestPipe,
} from '../pipes'
import { GameEventSubscriber, GameService } from '../services'

import { GameIdParam } from './decorators'
import { AuthorizedGame } from './decorators/auth'
import {
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
  JoinGameRequest,
  SubmitMultiChoiceQuestionAnswerRequest,
  SubmitRangeQuestionAnswerRequest,
  SubmitTrueFalseQuestionAnswerRequest,
  SubmitTypeAnswerQuestionAnswerRequest,
} from './models/requests'
import { FindGameResponse } from './models/response'
import { CreateGameResponse } from './models/response/create-game.response'

/**
 * GameController handles incoming HTTP requests related to game operations,
 * such as creating games and subscribing to game events.
 *
 * - Uses the `LegacyAuth` decorator to indicate legacy authentication logic is used.
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
  /**
   * Initializes a new instance of the GameController class.
   *
   * @param {GameService} gameService - The service responsible for handling game logic.
   * @param {GameEventSubscriber} gameEventSubscriber - The service responsible for managing game event streams.
   */
  constructor(
    private readonly gameService: GameService,
    private readonly gameEventSubscriber: GameEventSubscriber,
  ) {}

  /**
   * Creates a new game and assigns it to the authorized player.
   *
   * @param {string} playerId - The ID of the player creating the game.
   * @param {CreateClassicModeGameRequest | CreateZeroToOneHundredModeGameRequest} createGameRequest - The details of the game to be created.
   *
   * @returns {CreateGameResponse} A response containing the details of the created game.
   */
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
    @AuthorizedPlayerIdParam() playerId: string,
    @Body(new ParseCreateGameRequestPipe())
    createGameRequest:
      | CreateClassicModeGameRequest
      | CreateZeroToOneHundredModeGameRequest,
  ): Promise<CreateGameResponse> {
    return await this.gameService.createGame(createGameRequest, playerId)
  }

  /**
   * Finds an active game by its game PIN.
   *
   * @param {string} gamePIN - The unique 6-digit game PIN used to identify the game.
   *
   * @returns {FindGameResponse} A response object containing details of the active game.
   */
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

  /**
   * Allows a player to join an existing game.
   *
   * @param {string} playerId - The ID of the player joining the game.
   * @param {string} gameID - The unique identifier of the game.
   * @param {JoinGameRequest} request - The request body containing the player's nickname.
   *
   * @returns {Promise<void>} A Promise that resolves when the player has successfully joined the game.
   */
  @Post('/:gameID/players')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Join a game',
    description:
      'Allows a player to join an existing game by providing the game ID. Returns a unique player identifier and a token for the player.',
  })
  @ApiBody({
    description: 'Request body for joining an existing game.',
    type: JoinGameRequest,
  })
  @ApiNoContentResponse({
    description: 'The game has been successfully joined.',
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
    @AuthorizedPlayerIdParam() playerId: string,
    @Param('gameID', ParseUUIDPipe) gameID: string,
    @Body() request: JoinGameRequest,
  ): Promise<void> {
    return this.gameService.joinGame(gameID, request.nickname, playerId)
  }

  /**
   * Retrieves a stream of game-related events for a specific game.
   *
   * Clients receive both general and client-specific game events, including
   * heartbeat events for connection monitoring and game updates relevant to the subscribed game.
   *
   * @param {string} playerId - The ID of the player requesting the stream.
   * @param {string} gameID - The unique identifier of the game to subscribe to.
   *
   * @returns {Observable<MessageEvent>} A stream of events for SSE, each containing data in JSON format.
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
  @AuthorizedGame()
  @GameIdParam()
  public async getEventStream(
    @AuthorizedPlayerIdParam() playerId: string,
    @Param('gameID', ParseUUIDPipe) gameID: string,
  ): Promise<Observable<MessageEvent>> {
    return this.gameEventSubscriber.subscribe(gameID, playerId)
  }

  /**
   * Completes the current active task for the specified game.
   *
   * Requires the caller to be the host and the current task status to be 'active'.
   *
   * @param {string} gameID - The ID of the game.
   *
   * @returns {Promise<void>} A Promise that resolves when the task is successfully marked as completed.
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
  @AuthorizedGame(GameParticipantType.HOST)
  @GameIdParam()
  public async completeTask(
    @Param('gameID', ParseUUIDPipe) gameID: string,
  ): Promise<void> {
    await this.gameService.completeCurrentTask(gameID)
  }

  /**
   * Submits an answer for the current question in a game.
   *
   * @param {string} playerId - The ID of the player submitting the answer.
   * @param {string} gameID - The ID of the game where the answer is being submitted.
   * @param {object} submitQuestionAnswerRequest - The request containing the answer details.
   *
   * @returns {Promise<void>} A Promise that resolves when the answer submission is successful.
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
  @AuthorizedGame(GameParticipantType.PLAYER)
  @GameIdParam()
  public async submitQuestionAnswer(
    @AuthorizedPlayerIdParam() playerId: string,
    @Param('gameID', ParseUUIDPipe) gameID: string,
    @Body(new ParseSubmitQuestionAnswerRequestPipe())
    submitQuestionAnswerRequest:
      | SubmitMultiChoiceQuestionAnswerRequest
      | SubmitRangeQuestionAnswerRequest
      | SubmitTrueFalseQuestionAnswerRequest
      | SubmitTypeAnswerQuestionAnswerRequest,
  ): Promise<void> {
    return this.gameService.submitQuestionAnswer(
      gameID,
      playerId,
      submitQuestionAnswerRequest,
    )
  }
}
