import { GameParticipantType } from './game-participant-type.enum'

export interface GameTokenDto {
  gameID: string
  role: GameParticipantType
  sub: string
  exp: number
}
