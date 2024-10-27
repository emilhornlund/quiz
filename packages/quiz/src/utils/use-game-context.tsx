import { useContext } from 'react'

import { GameContext } from '../pages/GamePage'

export const useGameContext = () => {
  return useContext(GameContext)
}
