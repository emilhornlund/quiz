import { GameLobbyPlayerEvent } from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import HourglassIcon from '../../assets/images/hourglass-icon.svg'
import {
  ConfirmDialog,
  IconButtonArrowLeft,
  NicknameChip,
  PageProminentIcon,
  Typography,
} from '../../components'
import { GamePage } from '../common'

const MESSAGES = [
  'Get ready, the questions are coming! Sharpen your mind.',
  'Hold tight! The challenge awaits. Are you ready to ace it?',
  'A few moments before the fun begins. Get your thinking cap on!',
]

export interface PlayerLobbyStateProps {
  event: GameLobbyPlayerEvent
}

const PlayerLobbyState: FC<PlayerLobbyStateProps> = ({
  event: {
    player: { nickname },
  },
}) => {
  // const navigate = useNavigate()

  const [showConfirmLeaveGameDialog, setShowConfirmLeaveGameDialog] =
    useState<boolean>(false)
  const [isLeavingGame, setIsLeavingGame] = useState<boolean>(false)

  // const { gameID } = useGameContext()
  // const { leaveGame } = useQuizServiceClient()

  const handleLeaveGame = () => {
    setShowConfirmLeaveGameDialog(false)
    setIsLeavingGame(true)
    // TODO: fix this later
    // if (gameID && player?.id) {
    //   leaveGame(gameID, player.id).finally(() => {
    //     setIsLeavingGame(false)
    //     navigate('/')
    //   })
    // }
  }

  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [],
  )

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
