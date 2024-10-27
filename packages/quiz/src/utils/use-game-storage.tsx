import { useEffect, useState } from 'react'

import { IGameContext } from './types.ts'

export const useGameStorage = (): [
  IGameContext,
  (gameID: string, token: string) => void,
  () => void,
] => {
  const [data, setData] = useState<IGameContext>({})

  useEffect(() => {
    const raw = localStorage.getItem('game')
    if (raw) {
      setData(JSON.parse(raw) as Required<IGameContext>)
    }
  }, [])

  const store = (gameID: string, token: string) => {
    setData({ gameID, token })
    localStorage.setItem('game', JSON.stringify({ gameID, token }))
  }

  const clear = () => {
    setData({})
    localStorage.removeItem('game')
  }

  return [data, store, clear]
}
