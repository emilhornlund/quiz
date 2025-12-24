import type { GameLobbyPlayerEvent } from '@quiz/common'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
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
import { classNames } from '../../utils/helpers.ts'
import { GamePage } from '../common'

import { getMessage, getNextMessage } from './message.utils.ts'
import styles from './PlayerLobbyState.module.scss'

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

  const [currentMessage, setCurrentMessage] = useState<string>(() =>
    getMessage(),
  )
  const [messageAnimationState, setMessageAnimationState] = useState<
    'visible' | 'entering' | 'exiting'
  >('visible')
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Rotate messages every 8 seconds with smooth transitions
  useEffect(() => {
    const rotateMessage = () => {
      setMessageAnimationState('exiting')

      // Change message after fade out
      setTimeout(() => {
        setCurrentMessage((prev) => getNextMessage(prev))
        setMessageAnimationState('entering')

        // Set to visible after fade in
        setTimeout(() => {
          setMessageAnimationState('visible')
        }, 300)
      }, 200)
    }

    // Set up interval for message rotation
    messageIntervalRef.current = setInterval(rotateMessage, 8000)

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current)
      }
    }
  }, [])

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

        <div className={styles.messageContainer}>
          <div
            className={classNames(
              styles.message,
              styles[messageAnimationState],
            )}>
            <Typography variant="text" size="small">
              {currentMessage}
            </Typography>
          </div>
        </div>
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
