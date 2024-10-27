import { GameGameBeginPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  LoadingSpinner,
  NicknameChip,
  Page,
  Typography,
} from '../../components'

export interface PlayerGameBeginStateProps {
  event: GameGameBeginPlayerEvent
}

const PlayerGameBeginState: FC<PlayerGameBeginStateProps> = ({
  event: {
    player: { nickname },
  },
}) => (
  <Page>
    <Typography variant="title" size="medium">
      Get ready!
    </Typography>
    <Typography variant="text" size="small">
      The game starts any second
    </Typography>
    <NicknameChip value={nickname} />
    <LoadingSpinner />
  </Page>
)

export default PlayerGameBeginState
