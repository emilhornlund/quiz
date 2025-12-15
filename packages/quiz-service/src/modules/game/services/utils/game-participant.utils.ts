import { GameParticipantType } from '@quiz/common'

import {
  Participant,
  ParticipantBase,
  ParticipantPlayer,
} from '../../repositories/models/schemas'

/**
 * Checks if the given participant is of type `PLAYER`.
 *
 * @param participant - The participant object to check.
 *
 * @returns Returns `true` if the participant is of type `PLAYER`, otherwise `false`.
 */
export function isParticipantPlayer(
  participant?: Participant,
): participant is ParticipantBase &
  ParticipantPlayer & {
    type: GameParticipantType.PLAYER
  } {
  return participant?.type === GameParticipantType.PLAYER
}
