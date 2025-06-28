import React, { FC } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import { ProfilePageUI } from './components'

const ProfilePage: FC = () => {
  const { updateCurrentPlayer } = useQuizServiceClient()

  const handleNicknameChange = (nickname: string): void => {
    updateCurrentPlayer(nickname).then(() => {})
  }

  return <ProfilePageUI onNicknameChange={handleNicknameChange} />
}

export default ProfilePage
