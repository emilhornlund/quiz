import {
  Body,
  Controller,
  Delete,
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
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { GameParticipantType } from '@quiz/common'
import { Observable } from 'rxjs'

import {
  AuthorizedClientParam,
  AuthorizedPlayerIdParam,
} from '../../client/controllers/decorators/auth'
import { Client } from '../../client/services/models/schemas'
import { ApiPlayerIDParam } from '../../player/controller/decorators/api'
import {
  ParseCorrectAnswerRequestPipe,
  ParseGamePINPipe,
  ParseSubmitQuestionAnswerRequestPipe,
} from '../pipes'
import { GameEventSubscriber, GameService } from '../services'

import { ApiGameIdParam } from './decorators/api'
import { AuthorizedGame } from './decorators/auth'
import { RouteGameIdParam } from './decorators/route'
import {
  JoinGameRequest,
  MultiChoiceQuestionCorrectAnswerRequest,
  RangeQuestionCorrectAnswerRequest,
  SubmitMultiChoiceQuestionAnswerRequest,
  SubmitRangeQuestionAnswerRequest,
  SubmitTrueFalseQuestionAnswerRequest,
  SubmitTypeAnswerQuestionAnswerRequest,
  TrueFalseQuestionCorrectAnswerRequest,
  TypeAnswerQuestionCorrectAnswerRequest,
} from './models/requests'
import { FindGameResponse } from './models/response'

/**
 * GameController handles incoming HTTP requests related to game operations,
 * such as creating games and subscribing to game events.
 *
 * - Uses the `LegacyAuth` decorator to indicate legacy authentication logic is used.
 */
@ApiBearerAuth()
@ApiExtraModels(
  SubmitMultiChoiceQuestionAnswerRequest,
  SubmitRangeQuestionAnswerRequest,
  SubmitTrueFalseQuestionAnswerRequest,
  SubmitTypeAnswerQuestionAnswerRequest,
  MultiChoiceQuestionCorrectAnswerRequest,
  RangeQuestionCorrectAnswerRequest,
  TrueFalseQuestionCorrectAnswerRequest,
  TypeAnswerQuestionCorrectAnswerRequest,
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
      'Fetches an active game using the provided unique 6-digit game PIN.',
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
   * @param {Client} client - The client object containing details of the authorized client joining the game.
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
  @ApiGameIdParam()
  async joinGame(
    @AuthorizedClientParam() client: Client,
    @RouteGameIdParam() gameID: string,
    @Body() request: JoinGameRequest,
  ): Promise<void> {
    return this.gameService.joinGame(gameID, client, request.nickname)
  }

  /**
   * Removes a player from a game.
   *
   * This endpoint allows an authorized client (player or host) to remove a player from a game.
   * - Players can only remove themselves from a game.
   * - Hosts can remove any player except themselves.
   *
   * @param client - The client object containing details of the authorized client performing the action.
   * @param gameID - The unique identifier of the game.
   * @param playerID - The unique identifier of the player to remove.
   */
  @Delete('/:gameID/players/:playerID')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a player from a game',
    description:
      'Allows an authorized client to remove a player from a specified game.',
  })
  @ApiNoContentResponse({
    description: 'The player has successfully left the game.',
  })
  @ApiForbiddenResponse({
    description: 'The client is not allowed to remove the player.',
  })
  @ApiNotFoundResponse({
    description:
      'No game or player found with the specified unique identifier.',
  })
  @AuthorizedGame()
  @ApiGameIdParam()
  @ApiPlayerIDParam()
  async leaveGame(
    @AuthorizedClientParam() client: Client,
    @RouteGameIdParam() gameID: string,
    @Param('playerID', ParseUUIDPipe) playerID: string,
  ): Promise<void> {
    return this.gameService.leaveGame(client, gameID, playerID)
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
  @ApiGameIdParam()
  @SkipThrottle()
  public async getEventStream(
    @AuthorizedPlayerIdParam() playerId: string,
    @RouteGameIdParam() gameID: string,
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
  @ApiGameIdParam()
  public async completeTask(@RouteGameIdParam() gameID: string): Promise<void> {
    await this.gameService.completeCurrentTask(gameID)
  }

  /**
   * Adds a correct answer to the current question result task.
   *
   * Supports multiple correct answers for a single question by appending the provided answer
   * to the list of accepted answers for the current question result.
   * Only allowed when the current task is of type `QuestionResult` and not in an active state.
   *
   * @param gameID - The ID of the game.
   * @param correctAnswerRequest - The correct answer to add. Type must match the question type.
   */
  @Post('/:gameID/tasks/current/correct_answers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Add a correct answer to the current question result task',
    description:
      'Adds a new correct answer for the current question. Only applicable when the current task is of type "QuestionResult" and in active status. Multiple correct answers can be defined for supported question types.',
  })
  @ApiBody({
    description: 'Request body for adding a correct answer.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(MultiChoiceQuestionCorrectAnswerRequest) },
        { $ref: getSchemaPath(RangeQuestionCorrectAnswerRequest) },
        { $ref: getSchemaPath(TrueFalseQuestionCorrectAnswerRequest) },
        { $ref: getSchemaPath(TypeAnswerQuestionCorrectAnswerRequest) },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No active game found with the specified game ID.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid game ID format or question result task not in active status.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access or invalid client role.',
  })
  @AuthorizedGame(GameParticipantType.HOST)
  @ApiGameIdParam()
  public async addCorrectAnswer(
    @RouteGameIdParam() gameID: string,
    @Body(new ParseCorrectAnswerRequestPipe())
    correctAnswerRequest:
      | MultiChoiceQuestionCorrectAnswerRequest
      | RangeQuestionCorrectAnswerRequest
      | TrueFalseQuestionCorrectAnswerRequest
      | TypeAnswerQuestionCorrectAnswerRequest,
  ): Promise<void> {
    return this.gameService.addCorrectAnswer(gameID, correctAnswerRequest)
  }

  /**
   * Deletes a previously added correct answer from the current question result task.
   *
   * This operation removes a matching correct answer entry from the result task's list of correct answers.
   * Only allowed when the current task is of type `QuestionResult` and not in an active state.
   *
   * @param gameID - The ID of the game.
   * @param correctAnswerRequest - The correct answer to delete. Type must match the question type.
   */
  @Delete('/:gameID/tasks/current/correct_answers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a correct answer from the current question result task',
    description:
      'Deletes an existing correct answer from the current question result task. Only applicable when the current task is of type "QuestionResult" and in active status. Removes a matching entry from the list of accepted correct answers.',
  })
  @ApiBody({
    description: 'Request body for deleting a correct answer.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(MultiChoiceQuestionCorrectAnswerRequest) },
        { $ref: getSchemaPath(RangeQuestionCorrectAnswerRequest) },
        { $ref: getSchemaPath(TrueFalseQuestionCorrectAnswerRequest) },
        { $ref: getSchemaPath(TypeAnswerQuestionCorrectAnswerRequest) },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No active game found with the specified game ID.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid game ID format or question result task not in active status.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access or invalid client role.',
  })
  @AuthorizedGame(GameParticipantType.HOST)
  @ApiGameIdParam()
  public async deleteCorrectAnswer(
    @RouteGameIdParam() gameID: string,
    @Body(new ParseCorrectAnswerRequestPipe())
    correctAnswerRequest:
      | MultiChoiceQuestionCorrectAnswerRequest
      | RangeQuestionCorrectAnswerRequest
      | TrueFalseQuestionCorrectAnswerRequest
      | TypeAnswerQuestionCorrectAnswerRequest,
  ): Promise<void> {
    return this.gameService.deleteCorrectAnswer(gameID, correctAnswerRequest)
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
  @ApiGameIdParam()
  public async submitQuestionAnswer(
    @AuthorizedPlayerIdParam() playerId: string,
    @RouteGameIdParam() gameID: string,
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
