import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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

import { Public } from '../../app/decorators'
import { ParseCreateGameRequestPipe, ParseGamePINPipe } from '../pipes'
import { GameService } from '../services'

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
  constructor(private readonly gameService: GameService) {}

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
}
