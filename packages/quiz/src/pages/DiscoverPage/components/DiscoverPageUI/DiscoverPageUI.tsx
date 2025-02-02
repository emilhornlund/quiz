import {
  GameMode,
  LanguageCode,
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

export interface DiscoverPageUIProps {
  playerId?: string
  results: QuizResponseDto[]
  pagination: { total: number; limit: number; offset: number }
  isLoading: boolean
  isError: boolean
  onChangeSearchParams: (params: {
    search?: string
    visibility?: QuizVisibility
    languageCode?: LanguageCode
    mode?: GameMode
    sort?: 'title' | 'created' | 'updated'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) => void
  onEditQuiz: (quizID: string) => void
  onHostGame: (quizID: string) => void
}

const DiscoverPageUI: FC<DiscoverPageUIProps> = ({
  playerId,
  results,
  pagination,
  isLoading,
  isError,
  onChangeSearchParams,
  onEditQuiz,
  onHostGame,
}) => (
  <Page align="start" discover profile>
    <Typography variant="subtitle">Discover Exciting Quizzes</Typography>
    <Typography variant="text" size="medium">
      Dive into a world of engaging public quizzes. Explore, filter, and find
      the perfect quiz to host and share the fun!
    </Typography>
    <QuizTableFilter
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
        playerId={playerId}
        onPagination={(newLimit, newOffset) =>
          onChangeSearchParams({ limit: newLimit, offset: newOffset })
        }
        onEdit={onEditQuiz}
        onHostGame={onHostGame}
      />
    ) : (
      <LoadingSpinner />
    )}
  </Page>
)

export default DiscoverPageUI
