import type { GameEvent } from '@quiz/common'
import { deepEqual, GameEventType, GameStatus } from '@quiz/common'
import { setContext } from '@sentry/react'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BlockerFunction } from 'react-router-dom'
import { useBlocker, useNavigate } from 'react-router-dom'

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
import { ConnectionStatus } from '../../utils/event-source.types.ts'
import {
  notifyError,
  notifySuccess,
  notifyWarning,
} from '../../utils/notification.ts'
import { useEventSource } from '../../utils/useEventSource.tsx'

import styles from './GamePage.module.scss'

const LoadingOverlay: FC = () => (
  <div className={styles.loadingOverlay} data-testid="loading-overlay">
    <LoadingSpinner />
  </div>
)

/**
 * Represents the main game page.
 *
 * Displays the current game state, handles reconnection logic, and renders
 * the appropriate game state component based on the `GameEventType`.
 *
 * @returns A React component rendering the game state.
 */
const GamePage: FC = () => {
  const navigate = useNavigate()

  const { isUserAuthenticated, revokeGame } = useAuthContext()

  const { gameID, gameToken, participantId, participantType, leaveGame } =
    useGameContext()

  const [event, connectionStatus] = useEventSource(gameID, gameToken)

  const [lastNonLoadingEvent, setLastNonLoadingEvent] = useState<GameEvent>()
  const [isLoading, setIsLoading] = useState(false)

  const hasReconnectedRef = useRef<boolean>(false)
  const loadingTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!event) return

    if (event.type === GameEventType.GameLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current !== null) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Add 500ms delay to prevent flashing
      loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(true)
      }, 500)
    } else {
      // Clear any existing timeout
      if (loadingTimeoutRef.current !== null) {
        clearTimeout(loadingTimeoutRef.current)
      }

      setIsLoading(false)
      // Only update if this is a different non-loading event
      if (!deepEqual(event, lastNonLoadingEvent)) {
        setLastNonLoadingEvent(event)
      }
    }
  }, [event, lastNonLoadingEvent])

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
      revokeGame()

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
  }, [event, gameID, isUserAuthenticated, navigate, revokeGame])

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

      // Cleanup loading timeout
      if (loadingTimeoutRef.current !== null) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Dynamically determines the appropriate component to render
   * based on the last non-loading game event type.
   */
  const stateComponent = useMemo(() => {
    const eventToRender = lastNonLoadingEvent

    switch (eventToRender?.type) {
      case GameEventType.GameLobbyHost:
        return <HostLobbyState event={eventToRender} />
      case GameEventType.GameLobbyPlayer:
        return <PlayerLobbyState event={eventToRender} />
      case GameEventType.GameBeginHost:
        return <HostGameBeginState event={eventToRender} />
      case GameEventType.GameBeginPlayer:
        return <PlayerGameBeginState event={eventToRender} />
      case GameEventType.GameQuestionPreviewHost:
        return <HostQuestionPreviewState event={eventToRender} />
      case GameEventType.GameQuestionPreviewPlayer:
        return <PlayerQuestionPreviewState event={eventToRender} />
      case GameEventType.GameQuestionHost:
        return <HostQuestionState event={eventToRender} />
      case GameEventType.GameQuestionPlayer:
        return <PlayerQuestionState event={eventToRender} />
      case GameEventType.GameLeaderboardHost:
        return <HostLeaderboardState event={eventToRender} />
      case GameEventType.GameResultHost:
        return <HostResultState event={eventToRender} />
      case GameEventType.GameResultPlayer:
        return <PlayerResultState event={eventToRender} />
      case GameEventType.GamePodiumHost:
        return <HostPodiumState event={eventToRender} />
      default:
        // Show LoadingSpinner only if we have no previous event
        if (!lastNonLoadingEvent) {
          return (
            <Page hideLogin>
              <LoadingSpinner />
            </Page>
          )
        }
        return null // No content if we have a previous event but no current one
    }
  }, [lastNonLoadingEvent])

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
      {isLoading && <LoadingOverlay />}
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
