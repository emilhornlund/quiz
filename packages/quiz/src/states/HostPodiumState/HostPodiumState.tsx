import { GamePodiumHostEvent } from '@quiz/common'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  const { gameID, completeTask } = useGameContext()

  const navigate = useNavigate()

  const handleCompletingGame = () => {
    setIsCompletingGame(true)
    completeTask?.().finally(() => {
      setIsCompletingGame(false)
      navigate(`/game/results/${gameID}`)
    })
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
      <Typography variant="subtitle">Podium</Typography>
      <Podium values={leaderboard} />
      <Leaderboard values={leaderboard} includePodium={false} />
    </GamePage>
  )
}

export default HostPodiumState
