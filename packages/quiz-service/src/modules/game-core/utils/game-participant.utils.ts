import { GameParticipantType } from '@quiz/common'

import {
  Participant,
  ParticipantHostWithBase,
  ParticipantPlayerWithBase,
} from '../repositories/models/schemas'

/**
 * Checks if the given participant is of type `HOST`.
 *
 * @param participant - The participant object to check.
 *
 * @returns Returns `true` if the participant is of type `HOST`, otherwise `false`.
 */
export function isParticipantHost(
  participant?: Participant,
): participant is ParticipantHostWithBase {
  return participant?.type === GameParticipantType.HOST
}

/**
 * Checks if the given participant is of type `PLAYER`.
 *
 * @param participant - The participant object to check.
 *
 * @returns Returns `true` if the participant is of type `PLAYER`, otherwise `false`.
 */
export function isParticipantPlayer(
  participant?: Participant,
): participant is ParticipantPlayerWithBase {
  return participant?.type === GameParticipantType.PLAYER
}
