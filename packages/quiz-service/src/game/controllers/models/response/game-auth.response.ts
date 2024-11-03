import { GameAuthResponseDto } from '@quiz/common'

import { GameTokenProperty } from '../../decorators'

export class GameAuthResponse implements GameAuthResponseDto {
  @GameTokenProperty()
  token: string
}
