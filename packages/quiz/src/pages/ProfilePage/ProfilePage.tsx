import { DEFAULT_QUIZ_PAGINATION_LIMIT } from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../../context/auth'

import { ProfilePageUI } from './components'

const ProfilePage: FC = () => {
  const navigate = useNavigate()

  const { player } = useAuthContext()

  const { getCurrentPlayerQuizzes, createGame } = useQuizServiceClient()

  const [searchParams, setSearchParams] = useState<{
    search?: string
    limit: number
    offset: number
  }>({ limit: DEFAULT_QUIZ_PAGINATION_LIMIT, offset: 0 })

  const {
    data: quizzes,
    isLoading: isQuizzesLoading,
    isError: isQuizzesError,
  } = useQuery({
    queryKey: ['currentPlayerQuizzes', searchParams],
    queryFn: () => getCurrentPlayerQuizzes(searchParams),
  })

  const handleCreateGame = (quizId: string): void => {
    createGame(quizId).then((response) =>
      navigate(`/game?gameID=${response.id}`),
    )
  }

  return (
    <ProfilePageUI
      playerId={player?.id}
      quizzes={quizzes?.results ?? []}
      pagination={{
        total: quizzes?.total ?? 0,
        limit: quizzes?.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
        offset: quizzes?.offset ?? 0,
      }}
      isLoading={isQuizzesLoading}
      isError={isQuizzesError}
      onChangeSearchParams={(params) =>
        setSearchParams({ ...searchParams, ...params })
      }
      onCreateQuiz={() => navigate('/quiz/create')}
      onEditQuiz={(quizID) => navigate(`/quiz/${quizID}`)}
      onHostGame={handleCreateGame}
    />
  )
}

export default ProfilePage
