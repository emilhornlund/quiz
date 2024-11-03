import { GameTokenDto } from '@quiz/common'
import { jwtDecode } from 'jwt-decode'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useGameTokenQueryParam = (): [
  string | undefined,
  string | undefined,
] => {
  const [searchParams] = useSearchParams()

  const token = useMemo<string | undefined>(
    () => searchParams.get('token') || undefined,
    [searchParams],
  )

  const gameID = useMemo<string | undefined>(() => {
    if (token) {
      const { gameID } = jwtDecode<GameTokenDto>(token)
      return gameID
    }
    return undefined
  }, [token])

  return [token, gameID]
}
