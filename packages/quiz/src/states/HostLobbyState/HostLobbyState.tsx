import { GameLobbyHostEvent } from '@quiz/common'
import React, { FC, useState } from 'react'
import QRCode from 'react-qr-code'

import {
  ConfirmDialog,
  IconButtonArrowRight,
  NicknameChip,
} from '../../components'
import config from '../../config'
import { useGameContext } from '../../context/game'
import { classNames, extractUrl } from '../../utils/helpers.ts'
import GamePage from '../common/GamePage'

import styles from './HostLobbyState.module.scss'

export interface HostLobbyStateProps {
  event: GameLobbyHostEvent
}

const HostLobbyState: FC<HostLobbyStateProps> = ({
  event: {
    game: { id, pin },
    players,
  },
}) => {
  const [showConfirmStartGameDialog, setShowConfirmStartGameDialog] =
    useState(false)
  const [isStartingGame, setIsStartingGame] = useState<boolean>(false)

  const [playerToRemove, setPlayerToRemove] = useState<{
    id: string
    nickname: string
  }>()
  const [isRemovingPlayer, setIsRemovingPlayer] = useState<boolean>(false)

  const { gameID } = useGameContext()
  const { completeTask, leaveGame } = useGameContext()

  const handleStartGame = () => {
    setIsStartingGame(true)
    completeTask?.().finally(() => setIsStartingGame(false))
  }

  const handleRemovePlayer = () => {
    setPlayerToRemove(undefined)
    setIsRemovingPlayer(true)
    if (gameID && playerToRemove) {
      leaveGame?.(playerToRemove.id).finally(() => setIsRemovingPlayer(false))
    }
  }

  return (
    <>
      <GamePage
        width="medium"
        header={
          <IconButtonArrowRight
            id="start-game-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Start"
            loading={isStartingGame}
            onClick={() =>
              !players.length
                ? setShowConfirmStartGameDialog(true)
                : handleStartGame()
            }
          />
        }>
        <div className={styles.header}>
          <div className={classNames(styles.box, styles.info)}>
            Join at <strong>{extractUrl(config.baseUrl)}</strong>
          </div>
          <div className={classNames(styles.box, styles.pin)}>
            <div>Game PIN</div>
            <div>{pin}</div>
          </div>
          <div className={classNames(styles.box, styles.qr)}>
            <QRCode value={`${config.baseUrl}/join?gameID=${id}`} />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.players}>
            {players.map(({ id, nickname }) => (
              <NicknameChip
                key={nickname}
                value={nickname}
                onDelete={() => setPlayerToRemove({ id, nickname })}
              />
            ))}
          </div>
        </div>
      </GamePage>
      <ConfirmDialog
        title="Confirm Remove Player"
        message={`Are you sure you want to remove ${playerToRemove?.nickname} from the game? Once removed, they will need to rejoin to participate again.`}
        open={!!playerToRemove}
        confirmTitle="Remove Player"
        loading={isRemovingPlayer}
        onConfirm={handleRemovePlayer}
        onClose={() => setPlayerToRemove(undefined)}
        destructive
      />
      <ConfirmDialog
        title="Start Game Without Players?"
        message="There are no players in the game. Are you sure you want to start the game anyway?"
        open={showConfirmStartGameDialog}
        confirmTitle="Start Game"
        onConfirm={handleStartGame}
        onClose={() => setShowConfirmStartGameDialog(false)}
      />
    </>
  )
}

export default HostLobbyState
