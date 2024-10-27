import { GameLobbyPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import {
  LeaveButton,
  NicknameChip,
  Page,
  RocketImage,
  Typography,
} from '../../components'

const MESSAGES = [
  'Get ready, the questions are coming! Sharpen your mind.',
  'Hold tight! The challenge awaits. Are you ready to ace it?',
  'A few moments before the fun begins. Get your thinking cap on!',
]

export interface PlayerLobbyStateProps {
  event: GameLobbyPlayerEvent
}

const PlayerLobbyState: FC<PlayerLobbyStateProps> = ({
  event: {
    player: { nickname },
  },
}) => {
  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [],
  )

  return (
    <Page header={<LeaveButton />}>
      <RocketImage />
      <NicknameChip value={nickname} />
      <Typography variant="title" size="medium">
        You’re in the waiting room
      </Typography>
      <Typography variant="text" size="small">
        {message}
      </Typography>
    </Page>
  )
}

export default PlayerLobbyState
