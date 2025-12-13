import { GameEventType, GameQuitEvent, GameStatus } from '@quiz/common'

/**
 * Builds a quit event for the game.
 *
 * @param status - The current status of the game.
 * @returns A quit event for the game, indicating that the game is terminated.
 */
export function buildGameQuitEvent(status: GameStatus): GameQuitEvent {
  return { type: GameEventType.GameQuitEvent, status }
}
