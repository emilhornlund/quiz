import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useGameIDQueryParam = (): [string | undefined] => {
  const [searchParams] = useSearchParams()

  const gameID = useMemo<string | undefined>(
    () => searchParams.get('gameID') || undefined,
    [searchParams],
  )

  return [gameID]
}
