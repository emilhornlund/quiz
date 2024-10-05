import { GameEventLobbyPlayer } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { Button, NicknameChip, Page, RocketImage } from '../../components'

import styles from './PlayerLobbyState.module.scss'

const MESSAGES = [
  'Get ready, the questions are coming! Sharpen your mind.',
  'Hold tight! The challenge awaits. Are you ready to ace it?',
  'A few moments before the fun begins. Get your thinking cap on!',
]

export interface PlayerLobbyStateProps {
  event: GameEventLobbyPlayer
}

const PlayerLobbyState: FC<PlayerLobbyStateProps> = ({
  event: { nickname },
}) => {
  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [],
  )

  return (
    <Page
      header={
        <Button
          id={'leave-game-button'}
          type="button"
          kind="secondary"
          size="small"
          value="Leave"
          arrow="left"
        />
      }>
      <div className={styles.main}>
        <RocketImage />
        <NicknameChip value={nickname} />
        <div className={styles.title}>You’re in the waiting room</div>
        <div className={styles.message}>{message}</div>
      </div>
    </Page>
  )
}

export default PlayerLobbyState
