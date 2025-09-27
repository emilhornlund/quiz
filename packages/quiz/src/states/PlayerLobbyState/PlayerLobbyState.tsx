import { GameLobbyPlayerEvent } from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HourglassIcon from '../../assets/images/hourglass-icon.svg'
import {
  ConfirmDialog,
  IconButtonArrowLeft,
  NicknameChip,
  PageProminentIcon,
  Typography,
} from '../../components'
import { useAuthContext } from '../../context/auth'
import { useGameContext } from '../../context/game'
import { GamePage } from '../common'

import { getMessage } from './message.utils.ts'

export interface PlayerLobbyStateProps {
  event: GameLobbyPlayerEvent
}

const PlayerLobbyState: FC<PlayerLobbyStateProps> = ({
  event: {
    player: { nickname },
  },
}) => {
  const navigate = useNavigate()

  const [showConfirmLeaveGameDialog, setShowConfirmLeaveGameDialog] =
    useState<boolean>(false)
  const [isLeavingGame, setIsLeavingGame] = useState<boolean>(false)

  const { game } = useAuthContext()
  const { gameID, leaveGame } = useGameContext()

  const handleLeaveGame = () => {
    setShowConfirmLeaveGameDialog(false)
    const participantId = game?.ACCESS.sub
    if (gameID && participantId) {
      setIsLeavingGame(true)
      leaveGame?.(participantId).finally(() => {
        setIsLeavingGame(false)
        navigate('/')
      })
    }
  }

  const message = useMemo(() => getMessage(), [])

  return (
    <>
      <GamePage
        header={
          <IconButtonArrowLeft
            id="leave-game-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Leave"
            loading={isLeavingGame}
            onClick={() => setShowConfirmLeaveGameDialog(true)}
          />
        }>
        <PageProminentIcon src={HourglassIcon} alt="Hourglass" />
        <NicknameChip value={nickname} />
        <Typography variant="title" size="medium">
          You’re in the waiting room
        </Typography>
        <Typography variant="text" size="small">
          {message}
        </Typography>
      </GamePage>
      <ConfirmDialog
        title="Confirm Leave Game"
        message="Are you sure you want to leave the game? Once you leave, you will need to rejoin to participate again."
        open={showConfirmLeaveGameDialog}
        confirmTitle="Leave Game"
        onConfirm={handleLeaveGame}
        onClose={() => setShowConfirmLeaveGameDialog(false)}
        destructive
      />
    </>
  )
}

export default PlayerLobbyState
