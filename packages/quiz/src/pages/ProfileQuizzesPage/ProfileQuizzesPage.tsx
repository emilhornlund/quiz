import { DEFAULT_QUIZ_PAGINATION_LIMIT } from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useQuizzesSearchOptions } from '../../utils/useQuizzesSearchOptions.tsx'

import { ProfileQuizzesPageUI } from './components'

const ProfileQuizzesPage: FC = () => {
  const navigate = useNavigate()

  const { getProfileQuizzes } = useQuizServiceClient()
  const { options, setOptions } = useQuizzesSearchOptions()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myProfileQuizzes', options],
    queryFn: () => getProfileQuizzes(options),
  })

  return (
    <ProfileQuizzesPageUI
      quizzes={data?.results ?? []}
      pagination={{
        total: data?.total ?? 0,
        limit: data?.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
        offset: data?.offset ?? 0,
      }}
      filter={options}
      isLoading={isLoading}
      isError={isError}
      onChangeSearchParams={setOptions}
      onCreateQuiz={() => navigate('/quiz/create')}
    />
  )
}

export default ProfileQuizzesPage
