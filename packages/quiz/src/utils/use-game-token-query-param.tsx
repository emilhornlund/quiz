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

  const gameID = useMemo<string | undefined>(
    () => searchParams.get('gameID') || undefined,
    [searchParams],
  )

  return [token, gameID]
}
