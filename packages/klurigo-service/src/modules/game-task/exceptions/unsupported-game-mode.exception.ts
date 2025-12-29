import { GameMode } from '@klurigo/common'
import { BadRequestException } from '@nestjs/common'

export class UnsupportedGameModeException extends BadRequestException {
  constructor(mode: GameMode) {
    super(`Unsupported game mode ${String(mode)}`)
  }
}
