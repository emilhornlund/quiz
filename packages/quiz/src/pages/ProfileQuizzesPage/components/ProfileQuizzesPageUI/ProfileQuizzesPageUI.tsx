import { faPlus } from '@fortawesome/free-solid-svg-icons'
import type { QuizResponseDto } from '@quiz/common'
import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import type { FC } from 'react'
import { useState } from 'react'

import {
  Button,
  LoadingSpinner,
  Page,
  QuizTable,
  Typography,
} from '../../../../components'
import QuizTableFilter from '../../../../components/QuizTableFilter'

export interface ProfileQuizzesPageUISearchParams {
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

export interface ProfileQuizzesPageUIProps {
  quizzes: QuizResponseDto[]
  pagination: { total: number; limit: number; offset: number }
  filter: ProfileQuizzesPageUISearchParams
  isLoading: boolean
  isError: boolean
  onChangeSearchParams: (params: ProfileQuizzesPageUISearchParams) => void
  onCreateQuiz: () => void
}

const ProfileQuizzesPageUI: FC<ProfileQuizzesPageUIProps> = ({
  quizzes,
  pagination,
  filter,
  isLoading,
  isError,
  onChangeSearchParams,
  onCreateQuiz,
}) => {
  const [hasSearchFilter, setHasSearchFilter] = useState<boolean>(false)

  const handleSearchFilterChange = (
    params: ProfileQuizzesPageUISearchParams,
  ) => {
    onChangeSearchParams({ ...params, offset: 0 })
    setHasSearchFilter(
      !!params.search?.length ||
        !!params.mode ||
        !!params.languageCode ||
        !!params.visibility,
    )
  }

  return (
    <Page align="start" discover profile>
      <Typography variant="title">
        {quizzes.length || hasSearchFilter
          ? 'Your Quizzes'
          : "You Haven't Created Any Quizzes Yet"}
      </Typography>
      <Typography variant="text" size="medium">
        {quizzes.length || hasSearchFilter
          ? "Here's a list of your quizzes. You can edit them or host live games as needed."
          : 'Start creating engaging quizzes and share them with your audience.\n' +
            'Your creations will appear here!'}
      </Typography>
      <Button
        id="create-quiz-button"
        type="button"
        kind="call-to-action"
        size="small"
        value="Create New Quiz"
        icon={faPlus}
        iconPosition="leading"
        onClick={onCreateQuiz}
      />
      {(!!quizzes.length || hasSearchFilter) && (
        <QuizTableFilter
          filter={filter}
          onChange={handleSearchFilterChange}
          showVisibilityFilter
        />
      )}
      {!isLoading && !isError && quizzes ? (
        <QuizTable
          items={quizzes}
          pagination={{
            total: pagination.total,
            limit: pagination.limit,
            offset: pagination.offset,
          }}
          onPagination={(newLimit, newOffset) =>
            onChangeSearchParams({ limit: newLimit, offset: newOffset })
          }
        />
      ) : (
        <LoadingSpinner />
      )}
    </Page>
  )
}

export default ProfileQuizzesPageUI
