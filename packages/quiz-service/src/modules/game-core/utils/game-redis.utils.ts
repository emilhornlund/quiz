/**
 * Returns the Redis key used to store the answers of a player in a game.
 *
 * @param {string} gameID - The ID of the game.
 *
 * @returns {string} - The Redis key for the player's answers in the game.
 */
export function getRedisPlayerParticipantAnswerKey(gameID: string): string {
  return `${gameID}-player-participant-answers`
}
