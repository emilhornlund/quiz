import { useQuery } from '@tanstack/react-query'
import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner } from '../../components'

import GameHistoryPageUI from './GameHistoryPageUI'

const GameHistoryPage: FC = () => {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useState<{
    limit: number
    offset: number
  }>({ limit: 5, offset: 0 })

  const { getPaginatedGameHistory } = useQuizServiceClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['game_history', searchParams],
    queryFn: () => getPaginatedGameHistory(searchParams),
  })

  useEffect(() => {
    if (isError) {
      navigate('/')
    }
  }, [isError, navigate])

  if (isLoading || !data) {
    return <LoadingSpinner />
  }

  return (
    <GameHistoryPageUI
      items={data.results}
      total={data.total}
      limit={data.limit}
      offset={data.offset}
      onChangePagination={(limit, offset) => setSearchParams({ limit, offset })}
    />
  )
}

export default GameHistoryPage
