import { GamePodiumHostEvent } from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  IconButtonArrowRight,
  Leaderboard,
  Page,
  Podium,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'

export interface HostPodiumStateProps {
  event: GamePodiumHostEvent
}

const HostPodiumState: FC<HostPodiumStateProps> = ({
  event: { leaderboard },
}) => {
  const [isCompletingGame, setIsCompletingGame] = useState<boolean>(false)

  const { completeTask } = useGameContext()

  const handleCompletingGame = () => {
    setIsCompletingGame(true)
    completeTask?.().finally(() => setIsCompletingGame(false))
  }

  return (
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
          loading={isCompletingGame}
          onClick={handleCompletingGame}
        />
      }>
      <Typography variant="subtitle">Podium</Typography>
      <Podium values={leaderboard} />
      <Leaderboard values={leaderboard} includePodium={false} />
    </Page>
  )
}

export default HostPodiumState
