import {
  DEFAULT_QUIZ_PAGINATION_LIMIT,
  GameMode,
  LanguageCode,
  QuizCategory,
} from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import DiscoverPageUI from './components/DiscoverPageUI'

const DiscoverPage: FC = () => {
  const { getPublicQuizzes } = useQuizServiceClient()

  const [searchParams, setSearchParams] = useState<{
    search?: string
    category?: QuizCategory
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

  return (
    <DiscoverPageUI
      results={data?.results ?? []}
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
    />
  )
}

export default DiscoverPage
