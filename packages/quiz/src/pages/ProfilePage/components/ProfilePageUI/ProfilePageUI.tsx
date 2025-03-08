import {
  GameMode,
  LanguageCode,
  QuizCategory,
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
  onNicknameChange: (nickname: string) => void
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
  onCreateQuiz: () => void
}

const ProfilePageUI: FC<ProfilePageUIProps> = ({
  player,
  quizzes,
  pagination,
  isLoading,
  isError,
  onNicknameChange,
  onChangeSearchParams,
  onCreateQuiz,
}) => (
  <Page align="start" discover profile>
    <ProfileDetails nickname={player?.nickname} onChange={onNicknameChange} />
    <PageDivider />
    <ProfileQuizzes
      quizzes={quizzes}
      pagination={pagination}
      isLoading={isLoading}
      isError={isError}
      onChangeSearchParams={onChangeSearchParams}
      onCreateQuiz={onCreateQuiz}
    />
  </Page>
)

export default ProfilePageUI
