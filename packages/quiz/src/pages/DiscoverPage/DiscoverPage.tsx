import {
  DEFAULT_QUIZ_PAGINATION_LIMIT,
  GameMode,
  LanguageCode,
} from '@quiz/common'
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
    languageCode?: LanguageCode
    mode?: GameMode
    sort?: 'title' | 'created' | 'updated'
    order?: 'asc' | 'desc'
    limit: number
    offset: number
  }>({ limit: DEFAULT_QUIZ_PAGINATION_LIMIT, offset: 0 })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicQuizzes', searchParams],
    queryFn: () => getPublicQuizzes(searchParams),
  })

  const [isHostingGame, setIsHostingGame] = useState(false)

  const handleCreateGame = (quizId: string): void => {
    setIsHostingGame(true)
    createGame(quizId)
      .then((response) => navigate(`/game?gameID=${response.id}`))
      .finally(() => setIsHostingGame(false))
  }

  return (
    <DiscoverPageUI
      playerId={player?.id}
      results={data?.results ?? []}
      pagination={{
        total: data?.total ?? 0,
        limit: data?.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
        offset: data?.offset ?? 0,
      }}
      isLoading={isLoading}
      isError={isError}
      isHostingGame={isHostingGame}
      onChangeSearchParams={(params) =>
        setSearchParams({ ...searchParams, ...params })
      }
      onEditQuiz={(quizID) => navigate(`/quiz/${quizID}`)}
      onHostGame={handleCreateGame}
    />
  )
}

export default DiscoverPage
