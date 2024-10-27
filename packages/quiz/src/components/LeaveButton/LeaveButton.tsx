import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGameStorage } from '../../utils/use-game-storage'
import { IconButtonArrowLeft } from '../Button'

const LeaveButton: FC = () => {
  const navigate = useNavigate()

  const [, , leaveGame] = useGameStorage()

  const handleLeaveButtonClicked = () => {
    leaveGame()
    navigate('/')
  }

  return (
    <IconButtonArrowLeft
      id="leave-game-button"
      type="button"
      kind="secondary"
      size="small"
      value="Leave"
      onClick={handleLeaveButtonClicked}
    />
  )
}

export default LeaveButton
