import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'
import React, { FC } from 'react'

import {
  LoadingSpinner,
  Page,
  QuizTable,
  Typography,
} from '../../../../components'
import QuizTableFilter from '../../../../components/QuizTableFilter'

export interface QuizDiscoverPageUISearchParams {
  search?: string
  visibility?: QuizVisibility
  category?: QuizCategory
  languageCode?: LanguageCode
  mode?: GameMode
  sort?: 'title' | 'created' | 'updated'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface QuizDiscoverPageUIProps {
  filter: QuizDiscoverPageUISearchParams
  results: QuizResponseDto[]
  pagination: { total: number; limit: number; offset: number }
  isLoading: boolean
  isError: boolean
  onChangeSearchParams: (params: {
    search?: string
    visibility?: QuizVisibility
    category?: QuizCategory
    languageCode?: LanguageCode
    mode?: GameMode
    sort?: 'title' | 'created' | 'updated'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) => void
}

const QuizDiscoverPageUI: FC<QuizDiscoverPageUIProps> = ({
  filter,
  results,
  pagination,
  isLoading,
  isError,
  onChangeSearchParams,
}) => (
  <Page align="start" discover profile>
    <Typography variant="subtitle">Discover Exciting Quizzes</Typography>
    <Typography variant="text" size="medium">
      Dive into a world of engaging public quizzes. Explore, filter, and find
      the perfect quiz to host and share the fun!
    </Typography>
    <QuizTableFilter
      filter={filter}
      onChange={(options) => onChangeSearchParams({ ...options, offset: 0 })}
    />
    {!isLoading && !isError && results ? (
      <QuizTable
        items={results}
        pagination={{
          total: pagination.total,
          limit: pagination.limit,
          offset: pagination.offset,
        }}
        onPagination={(newLimit, newOffset) =>
          onChangeSearchParams({ limit: newLimit, offset: newOffset })
        }
        isPublic
      />
    ) : (
      <LoadingSpinner />
    )}
  </Page>
)

export default QuizDiscoverPageUI
