import { GameParticipantType } from '@quiz/common'

import { GameDocument } from '../models/schemas'

/**
 * Checks whether a player is unique in the list of game participants.
 *
 * @param {(Participant & (ParticipantHost | ParticipantPlayer))[]} participants - The list of participants in the game.
 * @param {string} playerId - The unique identifier of the player to be checked.
 *
 * @returns {boolean} Returns `true` if the player ID does not already exist in the participants list, otherwise `false`.
 */
export const isPlayerUnique = (
  participants: GameDocument['participants'],
  playerId: string,
): boolean =>
  !participants.find((participant) => participant.player._id === playerId)

/**
 * Checks whether a nickname is unique among players in the game participants list.
 *
 * @param {(Participant & (ParticipantHost | ParticipantPlayer))[]} participants - The list of participants in the game.
 * @param {string} nickname - The nickname to check for uniqueness.
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
      participant.nickname === nickname,
  )
