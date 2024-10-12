import { GameEventGameBeginPlayer } from '@quiz/common'
import React, { FC } from 'react'

import { LoadingSpinner, NicknameChip, Page } from '../../components'

import styles from './PlayerGameBeginState.module.scss'

export interface PlayerGameBeginStateProps {
  event: GameEventGameBeginPlayer
}

const PlayerGameBeginState: FC<PlayerGameBeginStateProps> = ({
  event: { nickname },
}) => (
  <Page>
    <div className={styles.main}>
      <div className={styles.title}>Get ready!</div>
      <div className={styles.message}>The game starts any second</div>
      <NicknameChip value={nickname} />
      <LoadingSpinner />
    </div>
  </Page>
)

export default PlayerGameBeginState
