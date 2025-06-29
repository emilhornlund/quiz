import { GameEventType } from '@quiz/common'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  PlayerAwaitingResultState,
  PlayerGameBeginState,
  PlayerLeaderboardState,
  PlayerLobbyState,
  PlayerPodiumState,
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
} from '../../utils/use-event-source.tsx'

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

  const { gameID } = useGameContext()

  const { token } = useAuthContext()

  const [event, connectionStatus] = useEventSource(gameID, token)
  const [hasReconnected, setHasReconnected] = useState(false)

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.INITIALIZED) {
      switch (connectionStatus) {
        case 'CONNECTED':
          if (hasReconnected) {
            setHasReconnected(false)
            notifySuccess('Connected')
          }
          break
        case 'RECONNECTING':
          setHasReconnected(true)
          notifyWarning('Reconnecting')
          break
        case 'RECONNECTING_FAILED':
          setHasReconnected(true)
          notifyError('Reconnecting failed')
          break
        default:
          break
      }
    }
  }, [connectionStatus, hasReconnected])

  const shouldBlock = useCallback<BlockerFunction>(
    () =>
      !(
        event?.type === GameEventType.GamePodiumHost ||
        event?.type === GameEventType.GamePodiumPlayer ||
        event?.type === GameEventType.GameQuitEvent
      ),
    [event],
  )
  const blocker = useBlocker(shouldBlock)

  useEffect(() => {
    if (event?.type === GameEventType.GameQuitEvent) {
      navigate('/')
    }
  }, [event, navigate])

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
      case GameEventType.GameAwaitingResultPlayer:
        return <PlayerAwaitingResultState event={event} />
      case GameEventType.GameLeaderboardHost:
        return <HostLeaderboardState event={event} />
      case GameEventType.GameResultHost:
        return <HostResultState event={event} />
      case GameEventType.GameResultPlayer:
        return <PlayerResultState event={event} />
      case GameEventType.GameLeaderboardPlayer:
        return <PlayerLeaderboardState event={event} />
      case GameEventType.GamePodiumHost:
        return <HostPodiumState event={event} />
      case GameEventType.GamePodiumPlayer:
        return <PlayerPodiumState event={event} />
      default:
        return (
          <Page>
            <LoadingSpinner />
          </Page>
        )
    }
  }, [event])

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
              onClick={() => blocker.proceed()}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

export default GamePage
