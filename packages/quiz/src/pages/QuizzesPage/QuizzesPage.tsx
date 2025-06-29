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

import { QuizzesPageUI } from './components'

const QuizzesPage: FC = () => {
  const navigate = useNavigate()

  const { getProfileQuizzes } = useQuizServiceClient()

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myProfileQuizzes', searchParams],
    queryFn: () => getProfileQuizzes(searchParams),
  })

  return (
    <QuizzesPageUI
      quizzes={data?.results ?? []}
      pagination={{
        total: data?.total ?? 0,
        limit: data?.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
        offset: data?.offset ?? 0,
      }}
      isLoading={isLoading}
      isError={isError}
      onChangeSearchParams={(params) =>
        setSearchParams({ ...searchParams, ...params })
      }
      onCreateQuiz={() => navigate('/quiz/create')}
    />
  )
}

export default QuizzesPage
