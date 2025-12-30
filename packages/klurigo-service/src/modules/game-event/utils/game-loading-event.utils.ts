import { GameEventType, GameLoadingEvent } from '@klurigo/common'

/**
 * Builds a loading event for the game.
 *
 * @returns A loading event for the game, indicating that the game is in a loading state.
 */
export function buildGameLoadingEvent(): GameLoadingEvent {
  return { type: GameEventType.GameLoading }
}
