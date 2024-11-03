import { GameBeginHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import { LoadingSpinner, Page, Typography } from '../../components'

export interface HostGameBeginStateProps {
  event: GameBeginHostEvent
}

const HostGameBeginState: FC<HostGameBeginStateProps> = () => (
  <Page>
    <Typography variant="title" size="medium">
      Loading Game
    </Typography>
    <Typography variant="text" size="small">
      The game starts any second
    </Typography>
    <LoadingSpinner />
  </Page>
)

export default HostGameBeginState
