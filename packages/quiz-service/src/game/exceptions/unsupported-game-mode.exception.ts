import { BadRequestException } from '@nestjs/common'
import { GameMode } from '@quiz/common'

export class UnsupportedGameModeException extends BadRequestException {
  constructor(mode: GameMode) {
    super(`Unsupported game mode ${String(mode)}`)
  }
}
