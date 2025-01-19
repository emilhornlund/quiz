import { GameLobbyHostEvent } from '@quiz/common'
import React, { FC, useState } from 'react'
import QRCode from 'react-qr-code'

import { IconButtonArrowRight, NicknameChip, Page } from '../../components'
import config from '../../config'
import { useGameContext } from '../../context/game'
import { classNames, extractUrl } from '../../utils/helpers.ts'

import styles from './HostLobbyState.module.scss'

export interface HostLobbyStateProps {
  event: GameLobbyHostEvent
}

const HostLobbyState: FC<HostLobbyStateProps> = ({
  event: {
    game: { id, pin },
    players,
  },
}) => {
  const [isStartingGame, setIsStartingGame] = useState<boolean>(false)

  const { completeTask } = useGameContext()

  const handleStartGame = () => {
    setIsStartingGame(true)
    completeTask?.().finally(() => setIsStartingGame(false))
  }

  return (
    <Page
      width="medium"
      header={
        <IconButtonArrowRight
          id={'start-game-button'}
          type="button"
          kind="call-to-action"
          size="small"
          value="Start"
          loading={isStartingGame}
          onClick={handleStartGame}
        />
      }>
      <div className={styles.header}>
        <div className={classNames(styles.box, styles.info)}>
          Join at <strong>{extractUrl(config.baseUrl)}</strong>
        </div>
        <div className={classNames(styles.box, styles.pin)}>
          <div>Game PIN</div>
          <div>{pin}</div>
        </div>
        <div className={classNames(styles.box, styles.qr)}>
          <QRCode value={`${config.baseUrl}/join?gameID=${id}`} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.players}>
          {players.map(({ nickname }) => (
            <NicknameChip key={nickname} value={nickname} />
          ))}
        </div>
      </div>
    </Page>
  )
}

export default HostLobbyState
