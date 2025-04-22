import { GamePodiumHostEvent } from '@quiz/common'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
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
  const navigate = useNavigate()
  const { gameID } = useGameContext()

  const [isCompletingGame, setIsCompletingGame] = useState<boolean>(false)

  const { completeTask } = useGameContext()

  const handleCompletingGame = (navigateToGameResults?: boolean) => {
    setIsCompletingGame(true)
    completeTask?.().finally(() => {
      setIsCompletingGame(false)
      if (navigateToGameResults && gameID) {
        navigate(`/game/results/${gameID}`)
      }
    })
  }

  return (
    <Page
      width="medium"
      height="full"
      align="start"
      header={
        <>
          <Button
            id={'game-results-button'}
            type="button"
            kind="primary"
            size="small"
            value="Results"
            loading={isCompletingGame}
            onClick={() => handleCompletingGame(true)}
          />
          <IconButtonArrowRight
            id={'skip-button'}
            type="button"
            kind="call-to-action"
            size="small"
            value="Quit"
            loading={isCompletingGame}
            onClick={handleCompletingGame}
          />
        </>
      }>
      <Typography variant="subtitle">Podium</Typography>
      <Podium values={leaderboard} />
      <Leaderboard values={leaderboard} includePodium={false} />
    </Page>
  )
}

export default HostPodiumState
