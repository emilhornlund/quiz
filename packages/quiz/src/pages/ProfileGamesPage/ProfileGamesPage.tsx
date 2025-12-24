import { GameStatus } from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'
import { parseNumber } from '../../utils/helpers.ts'

import ProfileGamesPageUI from './ProfileGamesPageUI'

const ProfileGamesPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const offset = useMemo(
    () => Math.max(parseNumber(searchParams.get('offset'), 0), 0),
    [location.search],
  )

  const setOffset = (nextOffset: number) => {
    const normalized = Math.max(nextOffset ?? 0, 0)
    const cur = searchParams.get('offset') ?? '0'
    if (cur !== String(normalized)) {
      const params = new URLSearchParams(searchParams)
      params.set('offset', String(normalized))
      setSearchParams(params, { replace: true })
    }
  }

  const { getProfileGames, authenticateGame } = useQuizServiceClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myProfileGames', offset],
    queryFn: () => getProfileGames({ offset, limit: 5 }),
  })

  const handleClickGame = (id: string, status: GameStatus) => {
    if (status === GameStatus.Active) {
      authenticateGame({ gameId: id }).then(() => navigate('/game'))
    } else if (status === GameStatus.Completed) {
      navigate(`/game/results/${id}`)
    }
  }

  useEffect(() => {
    if (isError) navigate('/')
  }, [isError, navigate])

  if (isLoading || !data) {
    return (
      <Page align="center" discover profile>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <ProfileGamesPageUI
      items={data.results}
      total={data.total}
      limit={data.limit}
      offset={data.offset}
      onClick={handleClickGame}
      onChangePagination={(_, nextOffset) => setOffset(nextOffset)}
    />
  )
}

export default ProfileGamesPage
