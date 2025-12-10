import { GameEventType, GameStatus } from '@quiz/common'
import { setContext } from '@sentry/react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { BlockerFunction, useBlocker, useNavigate } from 'react-router-dom'

import { LoadingSpinner, Modal, Page } from '../../components'
import Button from '../../components/Button'
import { useAuthContext } from '../../context/auth'
import { useGameContext } from '../../context/game'
import {
  HostGameBeginState,
  HostLeaderboardState,
  HostLobbyState,
  HostPodiumState,
  HostQuestionPreviewState,
  HostQuestionState,
  HostResultState,
  PlayerGameBeginState,
  PlayerLobbyState,
  PlayerQuestionPreviewState,
  PlayerQuestionState,
  PlayerResultState,
} from '../../states'
import {
  notifyError,
  notifySuccess,
  notifyWarning,
} from '../../utils/notification.ts'
import {
  ConnectionStatus,
  useEventSource,
} from '../../utils/useEventSource.tsx'

import styles from './GamePage.module.scss'

/**
 * Represents the main game page.
 *
 * Displays the current game state, handles reconnection logic, and renders
 * the appropriate game state component based on the `GameEventType`.
 *
 * @returns A React component rendering the game state.
 */
const GamePage = () => {
  const navigate = useNavigate()

  const { isUserAuthenticated } = useAuthContext()

  const { gameID, gameToken, participantId, participantType, leaveGame } =
    useGameContext()

  const [event, connectionStatus] = useEventSource(gameID, gameToken)

  const hasReconnectedRef = useRef<boolean>(false)

  useEffect(() => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        if (hasReconnectedRef.current) {
          hasReconnectedRef.current = false
          notifySuccess('Connected')
        }
        break

      case ConnectionStatus.RECONNECTING:
        hasReconnectedRef.current = true
        notifyWarning('Reconnecting')
        break

      case ConnectionStatus.RECONNECTING_FAILED:
        hasReconnectedRef.current = true
        notifyError('Reconnecting failed')
        break

      default:
        break
    }
  }, [connectionStatus])

  const shouldBlock = useCallback<BlockerFunction>(() => {
    const isAllowedEventType =
      event?.type &&
      [GameEventType.GamePodiumHost, GameEventType.GameQuitEvent].includes(
        event.type,
      )

    const hasGameId = !!gameID

    return !isAllowedEventType && hasGameId
  }, [event, gameID])
  const blocker = useBlocker(shouldBlock)

  useEffect(() => {
    if (event?.type === GameEventType.GameQuitEvent) {
      if (
        event.status === GameStatus.Completed &&
        isUserAuthenticated &&
        gameID
      ) {
        navigate(`/game/results/${gameID}`)
      } else {
        navigate('/')
      }
    }
  }, [event, navigate])

  useEffect(() => {
    if (gameID && gameToken) {
      console.debug('Setting up game context for Sentry...')
      setContext('game', { gameId: gameID, participantId, participantType })
    } else {
      console.debug('Cleaning up game context for Sentry...')
      setContext('game', null)
    }
  }, [gameID, gameToken, participantId, participantType])

  useEffect(() => {
    return () => {
      console.debug('Cleaning up game context for Sentry...')
      setContext('game', null)
    }
  }, [])

  /**
   * Dynamically determines the appropriate component to render
   * based on the current game event type.
   */
  const stateComponent = useMemo(() => {
    switch (event?.type) {
      case GameEventType.GameLobbyHost:
        return <HostLobbyState event={event} />
      case GameEventType.GameLobbyPlayer:
        return <PlayerLobbyState event={event} />
      case GameEventType.GameBeginHost:
        return <HostGameBeginState event={event} />
      case GameEventType.GameBeginPlayer:
        return <PlayerGameBeginState event={event} />
      case GameEventType.GameQuestionPreviewHost:
        return <HostQuestionPreviewState event={event} />
      case GameEventType.GameQuestionPreviewPlayer:
        return <PlayerQuestionPreviewState event={event} />
      case GameEventType.GameQuestionHost:
        return <HostQuestionState event={event} />
      case GameEventType.GameQuestionPlayer:
        return <PlayerQuestionState event={event} />
      case GameEventType.GameLeaderboardHost:
        return <HostLeaderboardState event={event} />
      case GameEventType.GameResultHost:
        return <HostResultState event={event} />
      case GameEventType.GameResultPlayer:
        return <PlayerResultState event={event} />
      case GameEventType.GamePodiumHost:
        return <HostPodiumState event={event} />
      default:
        return (
          <Page hideLogin>
            <LoadingSpinner />
          </Page>
        )
    }
  }, [event])

  const handleLeaveGame = () => {
    if (blocker.state === 'blocked' && participantId && leaveGame) {
      console.log('Leaving game...')
      leaveGame(participantId).finally(() => {
        blocker.proceed()
      })
    }
  }

  return (
    <>
      {stateComponent}
      {blocker.state === 'blocked' && (
        <Modal title="Leave Game" open>
          Leaving now will disconnect you from the game. Are you sure you want
          to continue?
          <div className={styles.leaveModalActionButtons}>
            <Button
              id="cancel-button"
              type="button"
              kind="secondary"
              value="Cancel"
              onClick={() => blocker.reset()}
            />
            <Button
              id="proceed-button"
              type="button"
              kind="call-to-action"
              value="Proceed"
              onClick={handleLeaveGame}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

export default GamePage
