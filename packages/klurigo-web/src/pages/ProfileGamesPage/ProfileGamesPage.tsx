import { GameStatus } from '@klurigo/common'
import type { FC } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { useResponsiveInfiniteOffsetQuery } from '../../utils/hooks'

import { ProfileGamesPageUI } from './components'

const ProfileGamesPage: FC = () => {
  const navigate = useNavigate()
  const { getProfileGames, authenticateGame } = useKlurigoServiceClient()

  const {
    items: games,
    itemsPerPage,
    isLoading,
    isError,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useResponsiveInfiniteOffsetQuery({
    queryKey: ['myProfileGames'],
    queryFn: ({ limit, offset }) => getProfileGames({ limit, offset }),
    getResults: (page) => page.results,
    getTotal: (page) => page.total,
    pageSize: {
      desktop: 20,
      tablet: 15,
      mobile: 10,
    },
  })

  const handleClickGame = useCallback(
    async (id: string, status: GameStatus) => {
      if (status === GameStatus.Active) {
        try {
          await authenticateGame({ gameId: id })
          navigate('/game')
        } catch {
          // Authentication failed — do not navigate
        }
        return
      }

      if (status === GameStatus.Completed) {
        navigate(`/game/results/${id}`)
      }
    },
    [authenticateGame, navigate],
  )

  return (
    <ProfileGamesPageUI
      games={games}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      isError={isError}
      hasMore={!!hasMore}
      skeletonCount={itemsPerPage ?? 20}
      onLoadMore={loadMore}
      onClick={handleClickGame}
    />
  )
}

export default ProfileGamesPage
