import { GameParticipantType } from '@quiz/common'

import { GameDocument } from '../../repositories/models/schemas'

/**
 * Checks whether a participant is unique in the list of game participants.
 *
 * @param participants - The list of participants in the game.
 * @param participantId - The unique identifier of the participant to be checked.
 *
 * @returns Returns `true` if the player ID does not already exist in the participants list, otherwise `false`.
 */
export const isPlayerUnique = (
  participants: GameDocument['participants'],
  participantId: string,
): boolean =>
  !participants.find(
    (participant) => participant.participantId === participantId,
  )

/**
 * Checks whether a nickname is unique among players in the game participants list.
 *
 * @param participants - The list of participants in the game.
 * @param nickname - The nickname to check for uniqueness.
 *
 * @returns {boolean} Returns `true` if the nickname does not already exist among player participants, otherwise `false`.
 */
export const isNicknameUnique = (
  participants: GameDocument['participants'],
  nickname: string,
): boolean =>
  !participants.find(
    (participant) =>
      participant.type === GameParticipantType.PLAYER &&
      participant.nickname.trim() === nickname.trim(),
  )
