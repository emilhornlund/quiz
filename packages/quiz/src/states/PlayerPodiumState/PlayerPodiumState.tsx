import { GamePodiumPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Badge,
  getBadgePositionBackgroundColor,
  IconButtonArrowLeft,
  NicknameChip,
  Typography,
} from '../../components'
import { GamePage } from '../common'

import { getPodiumPositionMessage } from './message.utils.ts'
import styles from './PlayerPodiumState.module.scss'

export interface PlayerPodiumStateProps {
  event: GamePodiumPlayerEvent
}

const PlayerPodiumState: FC<PlayerPodiumStateProps> = ({
  event: {
    game: { name },
    player: {
      nickname,
      score: { total, position },
    },
  },
}) => {
  const navigate = useNavigate()

  const message = useMemo(() => getPodiumPositionMessage(position), [position])

  return (
    <GamePage
      height="full"
      align="start"
      header={
        <IconButtonArrowLeft
          id="end-game-button"
          type="button"
          kind="call-to-action"
          size="small"
          value="End Game"
          onClick={() => navigate('/')}
        />
      }>
      <Typography variant="subtitle" size="medium">
        {name}
      </Typography>
      <div className={styles.content}>
        <Badge
          size="large"
          backgroundColor={getBadgePositionBackgroundColor(position)}>
          {position}
        </Badge>
        <NicknameChip value={nickname} />
        <Typography variant="subtitle" size="small">
          {total}
        </Typography>
        <Typography variant="text" size="small">
          {message}
        </Typography>
      </div>
    </GamePage>
  )
}

export default PlayerPodiumState
