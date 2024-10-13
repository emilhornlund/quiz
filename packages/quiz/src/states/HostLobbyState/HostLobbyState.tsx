import { GameLobbyHostEvent } from '@quiz/common'
import React, { FC } from 'react'
import QRCode from 'react-qr-code'

import { IconButtonArrowRight, NicknameChip, Page } from '../../components'
import { classNames } from '../../utils/helpers.ts'

import styles from './HostLobbyState.module.scss'

export interface HostLobbyStateProps {
  event: GameLobbyHostEvent
}

const HostLobbyState: FC<HostLobbyStateProps> = ({
  event: { url, pin, players },
}) => {
  return (
    <Page
      width="medium"
      header={
        <IconButtonArrowRight
          id={'start-game-button'}
          type="button"
          kind="secondary"
          size="small"
          value="Start"
        />
      }>
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
            <NicknameChip key={nickname} value={nickname} />
          ))}
        </div>
      </div>
    </Page>
  )
}

export default HostLobbyState
