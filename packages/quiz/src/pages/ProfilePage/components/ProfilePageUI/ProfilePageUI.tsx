import {
  GameMode,
  LanguageCode,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'
import React, { FC } from 'react'

import { Page, PageDivider } from '../../../../components'
import { Player } from '../../../../models'

import ProfileDetails from './components/ProfileDetails'
import ProfileQuizzes from './components/ProfileQuizzes'

export interface ProfilePageUIProps {
  player?: Player
  quizzes: QuizResponseDto[]
  pagination: { total: number; limit: number; offset: number }
  isLoading: boolean
  isError: boolean
  isHostingGame?: boolean
  onNicknameChange: (nickname: string) => void
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
  onCreateQuiz: () => void
  onEditQuiz: (quizID: string) => void
  onHostGame: (quizID: string) => void
}

const ProfilePageUI: FC<ProfilePageUIProps> = ({
  player,
  quizzes,
  pagination,
  isLoading,
  isError,
  isHostingGame = false,
  onNicknameChange,
  onChangeSearchParams,
  onCreateQuiz,
  onEditQuiz,
  onHostGame,
}) => (
  <Page align="start" discover profile>
    <ProfileDetails nickname={player?.nickname} onChange={onNicknameChange} />
    <PageDivider />
    <ProfileQuizzes
      playerId={player?.id}
      quizzes={quizzes}
      pagination={pagination}
      isLoading={isLoading}
      isError={isError}
      isHostingGame={isHostingGame}
      onChangeSearchParams={onChangeSearchParams}
      onCreateQuiz={onCreateQuiz}
      onEditQuiz={onEditQuiz}
      onHostGame={onHostGame}
    />
  </Page>
)

export default ProfilePageUI
