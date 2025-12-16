import { GameParticipantType } from '@quiz/common'

import {
  Participant,
  ParticipantPlayerWithBase,
} from '../../../game-core/repositories/models/schemas'

/**
 * Checks if the given participant is of type `PLAYER`.
 *
 * @param participant - The participant object to check.
 *
 * @returns Returns `true` if the participant is of type `PLAYER`, otherwise `false`.
 */
export function isParticipantPlayer(
  participant?: Participant,
): participant is ParticipantPlayerWithBase & {
  type: GameParticipantType.PLAYER
} {
  return participant?.type === GameParticipantType.PLAYER
}
