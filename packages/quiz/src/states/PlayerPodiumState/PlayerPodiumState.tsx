import { GamePodiumPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import {
  Badge,
  BadgeBackgroundColor,
  NicknameChip,
  Page,
  Typography,
} from '../../components'

import { getPodiumPositionMessage } from './messages.ts'
import styles from './PlayerPodiumState.module.scss'

function getBadgeBackgroundColor(position: number): BadgeBackgroundColor {
  switch (Math.max(position, 1)) {
    case 1:
      return 'gold'
    case 2:
      return 'silver'
    case 3:
      return 'bronze'
    default:
      return 'white'
  }
}

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
  const message = useMemo(() => {
    return getPodiumPositionMessage(position)
  }, [position])

  return (
    <Page height="full" align="start">
      <Typography variant="subtitle" size="medium">
        {name}
      </Typography>
      <div className={styles.content}>
        <Badge size="large" backgroundColor={getBadgeBackgroundColor(position)}>
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
    </Page>
  )
}

export default PlayerPodiumState
