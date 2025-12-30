import { DEFAULT_QUIZ_PAGINATION_LIMIT } from '@klurigo/common'
import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { useKlurigoServiceClient } from '../../api'
import { useQuizzesSearchOptions } from '../../utils/useQuizzesSearchOptions.tsx'

import { ProfileQuizzesPageUI } from './components'

const ProfileQuizzesPage: FC = () => {
  const navigate = useNavigate()

  const { getProfileQuizzes } = useKlurigoServiceClient()
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
