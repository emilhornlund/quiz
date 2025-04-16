import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'

import { GameIdParam } from './decorators'
import { AuthorizedGame } from './decorators/auth'
import { RouteGameIdParam } from './decorators/route'
import {
  GameResultClassicModeResponse,
  GameResultZeroToOneHundredModeResponse,
} from './models/response'

/**
 * Controller responsible for exposing endpoints related to game results.
 *
 * Handles the retrieval of final game data after a quiz has been completed.
 * Supports multiple game modes, each with their corresponding result structures.
 *
 * All endpoints in this controller require authentication and client-level authorization
 * to access the results of a specific game session.
 */
@ApiBearerAuth()
@ApiTags('game')
@Controller('/games/:gameID/results')
@ApiExtraModels(
  GameResultClassicModeResponse,
  GameResultZeroToOneHundredModeResponse,
)
export class GameResultController {
  /**
   * Retrieves the results of a completed quiz game by its ID.
   *
   * This endpoint returns the final game outcome, including player rankings,
   * individual scores, and per-question performance metrics. The structure of the
   * response depends on the game mode (classic or zero to one hundred).
   *
   * Authorization:
   * - Requires a valid access token (`@ApiBearerAuth`)
   * - The client must have permission to access the requested game results.
   *
   * @param gameID The unique identifier of the game.
   * @returns An array containing the game result, depending on the game mode.
   */
  @Get()
  @AuthorizedGame()
  @ApiOperation({
    summary: 'Get final results of a completed quiz game',
    description:
      'Returns performance metrics for players and questions based on the game mode (classic or zero to one hundred).',
  })
  @GameIdParam()
  @ApiOkResponse({
    description:
      'Returns the final results of the game. The response structure depends on the game mode.',
    schema: {
      type: 'array',
      items: {
        oneOf: [
          { $ref: getSchemaPath(GameResultClassicModeResponse) },
          { $ref: getSchemaPath(GameResultZeroToOneHundredModeResponse) },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access to the endpoint. Token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'The client does not have access to the game results.',
  })
  @ApiNotFoundResponse({
    description: 'No game found with the specified unique identifier.',
  })
  @HttpCode(HttpStatus.OK)
  public async getGameResults(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @RouteGameIdParam() gameID: string,
  ): Promise<
    (GameResultClassicModeResponse | GameResultZeroToOneHundredModeResponse)[]
  > {
    throw new NotImplementedException()
  }
}
