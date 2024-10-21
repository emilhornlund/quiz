import { Injectable } from '@nestjs/common'
import {
  CreateClassicModeGameRequestDto,
  CreateGameResponseDto,
  CreateZeroToOneHundredModeGameRequestDto,
} from '@quiz/common'

@Injectable()
export class GameService {
  public async createGame(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request:
      | CreateClassicModeGameRequestDto
      | CreateZeroToOneHundredModeGameRequestDto,
  ): Promise<CreateGameResponseDto> {
    return { id: 'temporary-dummy-id' }
  }
}
