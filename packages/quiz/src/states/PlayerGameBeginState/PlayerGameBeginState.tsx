import { GameBeginPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import { LoadingSpinner, NicknameChip, Typography } from '../../components'
import { GamePage } from '../common'

export interface PlayerGameBeginStateProps {
  event: GameBeginPlayerEvent
}

const PlayerGameBeginState: FC<PlayerGameBeginStateProps> = ({
  event: {
    player: { nickname },
  },
}) => (
  <GamePage>
    <Typography variant="title" size="medium">
      Get ready!
    </Typography>
    <Typography variant="text" size="small">
      The game starts any second
    </Typography>
    <NicknameChip value={nickname} />
    <LoadingSpinner />
  </GamePage>
)

export default PlayerGameBeginState
