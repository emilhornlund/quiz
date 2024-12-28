import { GamePodiumHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  IconButtonArrowRight,
  Leaderboard,
  Page,
  Podium,
  Typography,
} from '../../components'

export interface HostPodiumStateProps {
  event: GamePodiumHostEvent
  onComplete: () => void
}

const HostPodiumState: FC<HostPodiumStateProps> = ({
  event: { leaderboard },
  onComplete,
}) => (
  <Page
    width="medium"
    height="full"
    align="start"
    header={
      <IconButtonArrowRight
        id={'skip-button'}
        type="button"
        kind="call-to-action"
        size="small"
        value="Quit"
        onClick={onComplete}
      />
    }>
    <Typography variant="subtitle">Podium</Typography>
    <Podium values={leaderboard} />
    <Leaderboard values={leaderboard} includePodium={false} />
  </Page>
)

export default HostPodiumState
