import { JoinGameRequestDto } from '@quiz/common'

import { PlayerNicknameProperty } from '../../decorators'

export class JoinGameRequest implements JoinGameRequestDto {
  @PlayerNicknameProperty()
  nickname: string
}
