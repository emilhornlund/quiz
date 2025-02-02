import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { QuizResponseDto } from '@quiz/common'
import React, { FC } from 'react'

import {
  Button,
  LoadingSpinner,
  QuizTable,
  Typography,
} from '../../../../../../components'
import QuizTableFilter from '../../../../../../components/QuizTableFilter'

export interface ProfileQuizzesProps {
  playerId?: string
  quizzes: QuizResponseDto[]
  pagination: { total: number; limit: number; offset: number }
  isLoading: boolean
  isError: boolean
  onChangeSearchParams: (params: {
    search?: string
    limit?: number
    offset?: number
  }) => void
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
  onChangeSearchParams,
  onCreateQuiz,
  onEditQuiz,
  onHostGame,
}) => {
  return (
    <>
      <Typography variant="subtitle">
        {quizzes.length
          ? 'Your Quizzes'
          : "You Haven't Created Any Quizzes Yet"}
      </Typography>
      <Typography variant="text" size="medium">
        {quizzes.length
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
      <QuizTableFilter
        onSearch={(searchTerm) =>
          onChangeSearchParams({ search: searchTerm, offset: 0 })
        }
      />
      {!isLoading && !isError && quizzes ? (
        <QuizTable
          items={quizzes}
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
    </>
  )
}

export default ProfileQuizzes
