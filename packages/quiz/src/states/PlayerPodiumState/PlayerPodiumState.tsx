import { GameEventPodiumPlayer } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { NicknameChip, Page } from '../../components'
import { classNames } from '../../utils/helpers.ts'

import { getPodiumPositionMessage } from './messages.ts'
import styles from './PlayerPodiumState.module.scss'

const getPositionClassName = (position: number): string | undefined =>
  [styles.gold, styles.silver, styles.bronze][position - 1]

export interface PlayerPodiumStateProps {
  event: GameEventPodiumPlayer
}

const PlayerPodiumState: FC<PlayerPodiumStateProps> = ({
  event: { title, nickname, position, score },
}) => {
  const message = useMemo(() => {
    return getPodiumPositionMessage(position)
  }, [position])

  return (
    <Page>
      <div className={styles.main}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>
          <div
            className={classNames(
              styles.position,
              getPositionClassName(position),
            )}>
            {position}
          </div>
          <NicknameChip value={nickname} />
          <div className={styles.score}>{score}</div>
          <div className={styles.message}>{message}</div>
        </div>
      </div>
    </Page>
  )
}

export default PlayerPodiumState
