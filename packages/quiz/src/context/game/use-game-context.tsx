import { useContext } from 'react'

import { GameContext } from './game-context.tsx'

/**
 * A custom hook for accessing the `GameContext`.
 *
 * Provides convenient access to the game state and actions, such as the game ID,
 * task completion, and question answer submission.
 *
 * @returns The current value of the `GameContext`.
 */
export const useGameContext = () => useContext(GameContext)
