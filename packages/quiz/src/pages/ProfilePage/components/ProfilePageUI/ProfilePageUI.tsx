import { QuizResponseDto } from '@quiz/common'
import React, { FC } from 'react'

import { Page } from '../../../../components'

import ProfileQuizzes from './components/ProfileQuizzes'

export interface ProfilePageUIProps {
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

const ProfilePageUI: FC<ProfilePageUIProps> = ({
  playerId,
  quizzes,
  pagination,
  isLoading,
  isError,
  onChangeSearchParams,
  onCreateQuiz,
  onEditQuiz,
  onHostGame,
}) => (
  <Page align="start" discover profile>
    <ProfileQuizzes
      playerId={playerId}
      quizzes={quizzes}
      pagination={pagination}
      isLoading={isLoading}
      isError={isError}
      onChangeSearchParams={onChangeSearchParams}
      onCreateQuiz={onCreateQuiz}
      onEditQuiz={onEditQuiz}
      onHostGame={onHostGame}
    />
  </Page>
)

export default ProfilePageUI
