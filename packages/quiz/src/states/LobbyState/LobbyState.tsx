import { GameEventLobby } from '@quiz/common'
import React, { FC } from 'react'
import QRCode from 'react-qr-code'

import { Button, Page } from '../../components'
import { classNames } from '../../utils/helpers.ts'

import styles from './LobbyState.module.scss'

export interface LobbyStateProps {
  event: GameEventLobby
}

const LobbyState: FC<LobbyStateProps> = ({ event: { url, pin, players } }) => {
  return (
    <Page
      header={
        <Button
          id={'start-game-button'}
          type="button"
          kind="secondary"
          size="small"
          value="Start"
          arrow="right"
        />
      }>
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={classNames(styles.box, styles.info)}>
            Join at <strong>quiz.emilhornlund.com</strong>
          </div>
          <div className={classNames(styles.box, styles.pin)}>
            <div>Game PIN</div>
            <div>{pin}</div>
          </div>
          <div className={classNames(styles.box, styles.qr)}>
            <QRCode value={url} />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.players}>
            {players.map((nickname) => (
              <div key={nickname} className={styles.nickname}>
                {nickname}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default LobbyState
