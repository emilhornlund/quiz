import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../../context/auth'

import DiscoverPageUI from './components/DiscoverPageUI'

const DiscoverPage: FC = () => {
  const navigate = useNavigate()

  const { player } = useAuthContext()

  const { getPublicQuizzes, createGame } = useQuizServiceClient()

  const [searchParams, setSearchParams] = useState<{
    search?: string
    limit?: number
    offset?: number
  }>({ limit: 5, offset: 0 })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicQuizzes', searchParams],
    queryFn: () => getPublicQuizzes(searchParams),
  })

  const handleCreateGame = (quizId: string): void => {
    createGame(quizId).then((response) =>
      navigate(`/game?gameID=${response.id}`),
    )
  }

  return (
    <DiscoverPageUI
      playerId={player?.id}
      results={data?.results ?? []}
      pagination={{
        total: data?.total ?? 0,
        limit: data?.limit ?? 0,
        offset: data?.offset ?? 0,
      }}
      isLoading={isLoading}
      isError={isError}
      onChangeSearchParams={(params) =>
        setSearchParams({ ...searchParams, ...params })
      }
      onEditQuiz={(quizID) => navigate(`/quiz/${quizID}`)}
      onHostGame={handleCreateGame}
    />
  )
}

export default DiscoverPage
