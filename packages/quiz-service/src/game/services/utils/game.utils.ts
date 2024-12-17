import { GameParticipantType } from '@quiz/common'

import { GameDocument } from '../models/schemas'

/**
 * Checks whether a client is unique in the list of game participants.
 *
 * @param {(Participant & (ParticipantHost | ParticipantPlayer))[]} participants - The list of participants in the game.
 * @param {string} clientId - The unique identifier of the client to be checked.
 *
 * @returns {boolean} Returns `true` if the client ID does not already exist in the participants list, otherwise `false`.
 */
export const isClientUnique = (
  participants: GameDocument['participants'],
  clientId: string,
): boolean =>
  !participants.find((participant) => participant.client._id === clientId)

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
      participant.client.player.nickname === nickname,
  )
