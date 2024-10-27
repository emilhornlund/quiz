import React, { createContext, FC, ReactNode, useMemo } from 'react'

import { IGameContext } from '../../utils/types.ts'
import { useGameStorage } from '../../utils/use-game-storage.tsx'

export const GameContext = createContext<IGameContext>({})

export interface GameProviderProps {
  children: ReactNode | ReactNode[]
}

export const GameProvider: FC<GameProviderProps> = ({ children }) => {
  const [data] = useGameStorage()

  const contextValue = useMemo<IGameContext>(
    () => ({
      gameID: data.gameID,
      token: data.token,
    }),
    [data],
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
