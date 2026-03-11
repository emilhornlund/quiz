import { GameStatus } from '@klurigo/common'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { FC } from 'react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { DeviceType } from '../../utils/device-size.types'
import { useDeviceSizeType } from '../../utils/useDeviceSizeType'

import { ProfileGamesPageUI } from './components'

const ProfileGamesPage: FC = () => {
  const navigate = useNavigate()

  const { getProfileGames, authenticateGame } = useKlurigoServiceClient()

  const deviceType = useDeviceSizeType()

  // Calculate items per page based on device to avoid partial rows
  // Desktop: 4 cols × 5 rows = 20
  // Tablet: 3 cols × 5 rows = 15
  // Mobile: 2 cols × 5 rows = 10
  const itemsPerPage = useMemo(() => {
    if (deviceType === DeviceType.Desktop) return 20
    if (deviceType === DeviceType.Tablet) return 15
    return 10
  }, [deviceType])

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['myProfileGames', itemsPerPage],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getProfileGames({ limit: itemsPerPage, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.flatMap((page) => page.results).length
      return loadedCount < lastPage.total ? loadedCount : undefined
    },
  })

  const games = data?.pages.flatMap((page) => page.results) ?? []

  const handleLoadMore = useCallback(() => {
    fetchNextPage().then()
  }, [fetchNextPage])

  const handleClickGame = useCallback(
    async (id: string, status: GameStatus) => {
      if (status === GameStatus.Active) {
        try {
          await authenticateGame({ gameId: id })
          navigate('/game')
        } catch {
          // Authentication failed — do not navigate
        }
      } else if (status === GameStatus.Completed) {
        navigate(`/game/results/${id}`)
      }
    },
    [authenticateGame, navigate],
  )

  return (
    <ProfileGamesPageUI
      games={games}
      isLoading={isLoading}
      isLoadingMore={isFetchingNextPage}
      isError={isError}
      hasMore={hasNextPage}
      skeletonCount={itemsPerPage}
      onLoadMore={handleLoadMore}
      onClick={handleClickGame}
    />
  )
}

export default ProfileGamesPage
