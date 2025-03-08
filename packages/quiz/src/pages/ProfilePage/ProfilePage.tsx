import {
  DEFAULT_QUIZ_PAGINATION_LIMIT,
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../../context/auth'

import { ProfilePageUI } from './components'

const ProfilePage: FC = () => {
  const navigate = useNavigate()

  const { player, setPlayer } = useAuthContext()

  const { updateCurrentPlayer, getCurrentPlayerQuizzes } =
    useQuizServiceClient()

  const [searchParams, setSearchParams] = useState<{
    search?: string
    visibility?: QuizVisibility
    category?: QuizCategory
    languageCode?: LanguageCode
    mode?: GameMode
    sort?: 'title' | 'created' | 'updated'
    order?: 'asc' | 'desc'
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

  const handleNicknameChange = (nickname: string): void => {
    if (player) {
      updateCurrentPlayer(nickname).then(() => {
        setPlayer({ ...player, nickname })
      })
    }
  }

  return (
    <ProfilePageUI
      player={player}
      quizzes={quizzes?.results ?? []}
      pagination={{
        total: quizzes?.total ?? 0,
        limit: quizzes?.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
        offset: quizzes?.offset ?? 0,
      }}
      isLoading={isQuizzesLoading}
      isError={isQuizzesError}
      onNicknameChange={handleNicknameChange}
      onChangeSearchParams={(params) =>
        setSearchParams({ ...searchParams, ...params })
      }
      onCreateQuiz={() => navigate('/quiz/create')}
    />
  )
}

export default ProfilePage
