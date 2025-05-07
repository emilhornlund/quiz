import { GameBeginHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import { LoadingSpinner, Typography } from '../../components'
import { GamePage } from '../common'

export interface HostGameBeginStateProps {
  event: GameBeginHostEvent
}

const HostGameBeginState: FC<HostGameBeginStateProps> = () => (
  <GamePage>
    <Typography variant="title" size="medium">
      Loading Game
    </Typography>
    <Typography variant="text" size="small">
      The game starts any second
    </Typography>
    <LoadingSpinner />
  </GamePage>
)

export default HostGameBeginState
