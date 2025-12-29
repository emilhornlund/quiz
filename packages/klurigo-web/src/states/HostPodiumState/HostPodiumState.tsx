import type { GamePodiumHostEvent } from '@klurigo/common'
import type { FC } from 'react'
import { useState } from 'react'

import {
  IconButtonArrowRight,
  Leaderboard,
  Podium,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'
import { GamePage } from '../common'

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
    <GamePage
      width="medium"
      align="center"
      header={
        <IconButtonArrowRight
          id="game-results-button"
          type="button"
          kind="call-to-action"
          size="small"
          value="Game Results"
          loading={isCompletingGame}
          onClick={handleCompletingGame}
        />
      }>
      <Typography variant="title">Podium</Typography>
      <Podium values={leaderboard} />
      <Leaderboard values={leaderboard} includePodium={false} />
    </GamePage>
  )
}

export default HostPodiumState
