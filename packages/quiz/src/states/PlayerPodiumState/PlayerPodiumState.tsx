import { GamePodiumPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { NicknameChip, Page, Typography } from '../../components'
import { classNames } from '../../utils/helpers.ts'

import { getPodiumPositionMessage } from './messages.ts'
import styles from './PlayerPodiumState.module.scss'

const getPositionClassName = (position: number): string | undefined =>
  [styles.gold, styles.silver, styles.bronze][position - 1]

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
        <div
          className={classNames(
            styles.position,
            getPositionClassName(position),
          )}>
          {position}
        </div>
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
