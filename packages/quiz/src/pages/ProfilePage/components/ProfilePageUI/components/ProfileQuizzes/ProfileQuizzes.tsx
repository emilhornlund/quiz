import { faPlus } from '@fortawesome/free-solid-svg-icons'
import {
  GameMode,
  LanguageCode,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  Button,
  LoadingSpinner,
  QuizTable,
  Typography,
} from '../../../../../../components'
import QuizTableFilter from '../../../../../../components/QuizTableFilter'

type SearchParams = {
  search?: string
  visibility?: QuizVisibility
  languageCode?: LanguageCode
  mode?: GameMode
  sort?: 'title' | 'created' | 'updated'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ProfileQuizzesProps {
  playerId?: string
  quizzes: QuizResponseDto[]
  pagination: { total: number; limit: number; offset: number }
  isLoading: boolean
  isError: boolean
  isHostingGame?: boolean
  onChangeSearchParams: (params: SearchParams) => void
  onCreateQuiz: () => void
  onEditQuiz: (quizID: string) => void
  onHostGame: (quizID: string) => void
}

const ProfileQuizzes: FC<ProfileQuizzesProps> = ({
  playerId,
  quizzes,
  pagination,
  isLoading,
  isError,
  isHostingGame = false,
  onChangeSearchParams,
  onCreateQuiz,
  onEditQuiz,
  onHostGame,
}) => {
  const [hasSearchFilter, setHasSearchFilter] = useState<boolean>(false)

  const handleSearchFilterChange = (params: SearchParams) => {
    onChangeSearchParams({ ...params, offset: 0 })
    setHasSearchFilter(
      !!params.search?.length ||
        !!params.mode ||
        !!params.languageCode ||
        !!params.visibility,
    )
  }

  return (
    <>
      <Typography variant="subtitle">
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
          isHostingGame={isHostingGame}
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
    </>
  )
}

export default ProfileQuizzes
