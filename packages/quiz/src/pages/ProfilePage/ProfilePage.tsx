import React, { FC } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../../context/auth'

import { ProfilePageUI } from './components'

const ProfilePage: FC = () => {
  const { player, setPlayer } = useAuthContext()

  const { updateCurrentPlayer } = useQuizServiceClient()

  const handleNicknameChange = (nickname: string): void => {
    if (player) {
      updateCurrentPlayer(nickname).then(() => {
        setPlayer({ ...player, nickname })
      })
    }
  }

  return (
    <ProfilePageUI player={player} onNicknameChange={handleNicknameChange} />
  )
}

export default ProfilePage
