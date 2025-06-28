import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Post,
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
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { Authority, GameParticipantType, TokenScope } from '@quiz/common'
import { Observable } from 'rxjs'

import {
  PrincipalId,
  RequiredAuthorities,
  RequiresScopes,
} from '../../auth/controllers/decorators'
import { ApiPlayerIDParam } from '../../player/controllers/decorators/api'
import { RoutePlayerIdParam } from '../../player/controllers/decorators/params'
import {
  ParseCorrectAnswerRequestPipe,
  ParseSubmitQuestionAnswerRequestPipe,
} from '../pipes'
import { GameEventSubscriber, GameService } from '../services'

import { ApiGameIdParam } from './decorators/api'
import { AuthorizedGame } from './decorators/auth'
import { RouteGameIdParam } from './decorators/params'
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
@RequiresScopes(TokenScope.Game)
@RequiredAuthorities(Authority.Game)
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
   * Allows a participant to join an existing game as a player.
   *
   * @param participantId - The unique identifier of the authorized participant joining the game.
   * @param gameId - The unique identifier of the game.
   * @param request - The request body containing the player's nickname.
   *
   * @returns A Promise that resolves when the player has successfully joined the game.
   */
  @Post('/:gameID/players')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Join a game',
    description:
      'Allows a participant to join an existing game as a player by providing the game ID. Returns a unique identifier and a token for the participant.',
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
    @PrincipalId() participantId: string,
    @RouteGameIdParam() gameId: string,
    @Body() request: JoinGameRequest,
  ): Promise<void> {
    return this.gameService.joinGame(gameId, participantId, request.nickname)
  }

  /**
   * Removes a player from a game.
   *
   * This endpoint allows an authorized participant (player or host) to remove a player from a game.
   * - Players can only remove themselves from a game.
   * - Hosts can remove any player except themselves.
   *
   * @param participantId - The unique identifier of the authorized participant performing the action.
   * @param gameId - The unique identifier of the game.
   * @param playerId - The unique identifier of the player to remove.
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
    @PrincipalId() participantId: string,
    @RouteGameIdParam() gameId: string,
    @RoutePlayerIdParam() playerId: string,
  ): Promise<void> {
    return this.gameService.leaveGame(participantId, gameId, playerId)
  }

  /**
   * Retrieves a stream of game-related events for a specific game.
   *
   * Participants receive both general and participant-specific game events, including
   * heartbeat events for connection monitoring and game updates relevant to the subscribed game.
   *
   * @param participantId - The unique identifier of the participant requesting the stream.
   * @param gameId - The unique identifier of the game to subscribe to.
   *
   * @returns A stream of events for SSE, each containing data in JSON format.
   */
  @Sse('/:gameID/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Subscribe to game events',
    description:
      'Provides a stream of real-time game events for the specified game ID. Requires an active game subscription and a valid token for access. Events are sent in Server-Sent Events (SSE) format, allowing participants to receive continuous updates.',
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
    @PrincipalId() participantId: string,
    @RouteGameIdParam() gameId: string,
  ): Promise<Observable<MessageEvent>> {
    return this.gameEventSubscriber.subscribe(gameId, participantId)
  }

  /**
   * Completes the current active task for the specified game.
   *
   * Requires the caller to be the host and the current task status to be 'active'.
   *
   * @param gameId - The unique identifier of the game.
   *
   * @returns A Promise that resolves when the task is successfully marked as completed.
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
  public async completeTask(@RouteGameIdParam() gameId: string): Promise<void> {
    await this.gameService.completeCurrentTask(gameId)
  }

  /**
   * Adds a correct answer to the current question result task.
   *
   * Supports multiple correct answers for a single question by appending the provided answer
   * to the list of accepted answers for the current question result.
   * Only allowed when the current task is of type `QuestionResult` and not in an active state.
   *
   * @param gameId - The unique identifier of the game.
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
    @RouteGameIdParam() gameId: string,
    @Body(new ParseCorrectAnswerRequestPipe())
    correctAnswerRequest:
      | MultiChoiceQuestionCorrectAnswerRequest
      | RangeQuestionCorrectAnswerRequest
      | TrueFalseQuestionCorrectAnswerRequest
      | TypeAnswerQuestionCorrectAnswerRequest,
  ): Promise<void> {
    return this.gameService.addCorrectAnswer(gameId, correctAnswerRequest)
  }

  /**
   * Deletes a previously added correct answer from the current question result task.
   *
   * This operation removes a matching correct answer entry from the result task's list of correct answers.
   * Only allowed when the current task is of type `QuestionResult` and not in an active state.
   *
   * @param gameId - The unique identifier of the game.
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
    @RouteGameIdParam() gameId: string,
    @Body(new ParseCorrectAnswerRequestPipe())
    correctAnswerRequest:
      | MultiChoiceQuestionCorrectAnswerRequest
      | RangeQuestionCorrectAnswerRequest
      | TrueFalseQuestionCorrectAnswerRequest
      | TypeAnswerQuestionCorrectAnswerRequest,
  ): Promise<void> {
    return this.gameService.deleteCorrectAnswer(gameId, correctAnswerRequest)
  }

  /**
   * Submits an answer for the current question in a game.
   *
   * @param {string} playerId - The unique identifier of the player submitting the answer.
   * @param {string} gameId - The unique identifier of the game where the answer is being submitted.
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
    @PrincipalId() playerId: string,
    @RouteGameIdParam() gameId: string,
    @Body(new ParseSubmitQuestionAnswerRequestPipe())
    submitQuestionAnswerRequest:
      | SubmitMultiChoiceQuestionAnswerRequest
      | SubmitRangeQuestionAnswerRequest
      | SubmitTrueFalseQuestionAnswerRequest
      | SubmitTypeAnswerQuestionAnswerRequest,
  ): Promise<void> {
    return this.gameService.submitQuestionAnswer(
      gameId,
      playerId,
      submitQuestionAnswerRequest,
    )
  }
}
