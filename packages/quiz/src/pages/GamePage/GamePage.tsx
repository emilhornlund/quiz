import { GameEventType } from '@quiz/common'
import React, { useEffect, useMemo, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client'
import { LoadingSpinner, Page } from '../../components'
import { useAuthContext } from '../../context/auth'
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
import { useGameIDQueryParam } from '../../utils/use-game-id-query-param.tsx'

const GamePage = () => {
  const [gameID] = useGameIDQueryParam()
  const { token } = useAuthContext()

  const [event, connectionStatus] = useEventSource(gameID, token)
  const [hasReconnected, setHasReconnected] = useState(false)

  const { completeTask, submitQuestionAnswer } = useQuizServiceClient()

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

  const stateComponent = useMemo(() => {
    switch (event?.type) {
      case GameEventType.GameLobbyHost:
        return (
          <HostLobbyState event={event} onStart={() => completeTask(gameID!)} />
        )
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
        return (
          <HostQuestionState
            event={event}
            onSkip={() => completeTask(gameID!)}
          />
        )
      case GameEventType.GameQuestionPlayer:
        return (
          <PlayerQuestionState
            event={event}
            onSubmitQuestionAnswer={(request) =>
              submitQuestionAnswer(gameID!, request)
            }
          />
        )
      case GameEventType.GameAwaitingResultPlayer:
        return <PlayerAwaitingResultState event={event} />
      case GameEventType.GameLeaderboardHost:
        return (
          <HostLeaderboardState
            event={event}
            onNext={() => completeTask(gameID!)}
          />
        )
      case GameEventType.GameResultHost:
        return (
          <HostResultState event={event} onNext={() => completeTask(gameID!)} />
        )
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
  }, [event, gameID, completeTask, submitQuestionAnswer])

  return <>{stateComponent}</>
}

export default GamePage
