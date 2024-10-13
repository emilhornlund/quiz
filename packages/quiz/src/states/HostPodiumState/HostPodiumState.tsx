import { GameEventPodiumHost } from '@quiz/common'
import React, { FC } from 'react'

import { Leaderboard, Page, Podium, Typography } from '../../components'

import styles from './HostPodiumState.module.scss'

export interface HostPodiumStateProps {
  event: GameEventPodiumHost
}

const HostPodiumState: FC<HostPodiumStateProps> = ({
  event: { leaderboard },
}) => (
  <Page>
    <div className={styles.main}>
      <Typography variant="subtitle">Podium</Typography>
      <Podium values={leaderboard} />
      <Leaderboard values={leaderboard} includePodium={false} />
    </div>
  </Page>
)

export default HostPodiumState
