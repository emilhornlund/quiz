import { DEFAULT_QUIZ_PAGINATION_LIMIT } from '@klurigo/common'
import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'

import { useKlurigoServiceClient } from '../../api'
import { useQuizzesSearchOptions } from '../../utils/useQuizzesSearchOptions.tsx'

import QuizDiscoverPageUI from './components/QuizDiscoverPageUI'

const QuizDiscoverPage: FC = () => {
  const { getPublicQuizzes } = useKlurigoServiceClient()

  const { options, setOptions } = useQuizzesSearchOptions()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicQuizzes', options],
    queryFn: () => getPublicQuizzes(options),
  })

  return (
    <QuizDiscoverPageUI
      results={data?.results ?? []}
      pagination={{
        total: data?.total ?? 0,
        limit: data?.limit ?? DEFAULT_QUIZ_PAGINATION_LIMIT,
        offset: data?.offset ?? 0,
      }}
      filter={options}
      isLoading={isLoading}
      isError={isError}
      onChangeSearchParams={setOptions}
    />
  )
}

export default QuizDiscoverPage
