import { GameEventGameBeginPlayer } from '@quiz/common'
import React, { FC } from 'react'

import {
  LoadingSpinner,
  NicknameChip,
  Page,
  Typography,
} from '../../components'

import styles from './PlayerGameBeginState.module.scss'

export interface PlayerGameBeginStateProps {
  event: GameEventGameBeginPlayer
}

const PlayerGameBeginState: FC<PlayerGameBeginStateProps> = ({
  event: { nickname },
}) => (
  <Page>
    <div className={styles.main}>
      <Typography variant="title" size="medium">
        Get ready!
      </Typography>
      <Typography variant="text" size="small">
        The game starts any second
      </Typography>
      <NicknameChip value={nickname} />
      <LoadingSpinner />
    </div>
  </Page>
)

export default PlayerGameBeginState
