import { GameEventGameBeginHost } from '@quiz/common'
import React, { FC } from 'react'

import { LoadingSpinner, Page, Typography } from '../../components'

import styles from './HostGameBeginState.module.scss'

export interface HostGameBeginStateProps {
  event: GameEventGameBeginHost
}

const HostGameBeginState: FC<HostGameBeginStateProps> = () => (
  <Page>
    <div className={styles.main}>
      <Typography variant="title" size="medium">
        Loading Game
      </Typography>
      <Typography variant="text" size="small">
        The game starts any second
      </Typography>
      <LoadingSpinner />
    </div>
  </Page>
)

export default HostGameBeginState
