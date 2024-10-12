import { GameEventGameBeginHost } from '@quiz/common'
import React, { FC } from 'react'

import { LoadingSpinner, Page } from '../../components'

import styles from './HostGameBeginState.module.scss'

export interface HostGameBeginStateProps {
  event: GameEventGameBeginHost
}

const HostGameBeginState: FC<HostGameBeginStateProps> = () => (
  <Page>
    <div className={styles.main}>
      <div className={styles.title}>Loading Game</div>
      <div className={styles.message}>The game starts any second</div>
      <LoadingSpinner />
    </div>
  </Page>
)

export default HostGameBeginState
