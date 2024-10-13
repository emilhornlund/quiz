import { GamePodiumHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import { Leaderboard, Page, Podium, Typography } from '../../components'

export interface HostPodiumStateProps {
  event: GamePodiumHostEvent
}

const HostPodiumState: FC<HostPodiumStateProps> = ({
  event: { leaderboard },
}) => (
  <Page width="medium" height="full" align="start">
    <Typography variant="subtitle">Podium</Typography>
    <Podium values={leaderboard} />
    <Leaderboard values={leaderboard} includePodium={false} />
  </Page>
)

export default HostPodiumState
