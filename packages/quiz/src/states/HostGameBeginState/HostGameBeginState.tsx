import { GameBeginHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import MegaphoneIcon from '../../assets/images/megaphone-icon.svg'
import { LoadingSpinner, PageProminentIcon, Typography } from '../../components'
import { GamePage } from '../common'

export interface HostGameBeginStateProps {
  event: GameBeginHostEvent
}

const HostGameBeginState: FC<HostGameBeginStateProps> = () => (
  <GamePage>
    <PageProminentIcon src={MegaphoneIcon} alt="Megaphone" />
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
