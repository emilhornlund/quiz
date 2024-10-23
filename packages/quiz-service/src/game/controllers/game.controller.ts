import { Body, Controller, Post } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

import { ParseCreateGameRequestPipe } from '../pipes'
import { GameService } from '../services'

import {
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
} from './models/requests'
import { CreateGameResponse } from './models/response'

@ApiExtraModels(
  CreateClassicModeGameRequest,
  CreateZeroToOneHundredModeGameRequest,
)
@ApiTags('game')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
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
}
