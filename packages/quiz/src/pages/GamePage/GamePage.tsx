import { GameEventType } from '@quiz/common'
import React, { useEffect, useMemo, useState } from 'react'
import { Bounce, toast, ToastOptions } from 'react-toastify'

import { LoadingSpinner, Page } from '../../components'
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
  PlayerLobbyState,
  PlayerPodiumState,
  PlayerQuestionPreviewState,
  PlayerQuestionState,
  PlayerResultState,
} from '../../states'
import {
  ConnectionStatus,
  useEventSource,
} from '../../utils/use-event-source.tsx'
import { useGameTokenQueryParam } from '../../utils/use-game-token-query-param.tsx'
import { useQuizService } from '../../utils/use-quiz-service.tsx'

const GamePage = () => {
  const [token, gameID] = useGameTokenQueryParam()

  const [event, connectionStatus] = useEventSource(gameID, token)
  const [hasReconnected, setHasReconnected] = useState(false)

  const { completeTask, submitQuestionAnswer } = useQuizService()

  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.INITIALIZED) {
      const options: ToastOptions = {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
      }
      switch (connectionStatus) {
        case 'CONNECTED':
          if (hasReconnected) {
            toast.success('Connected', options)
            setHasReconnected(false)
          }
          break
        case 'RECONNECTING':
          setHasReconnected(true)
          toast.warning('Reconnecting', options)
          break
        case 'RECONNECTING_FAILED':
          setHasReconnected(true)
          toast.error('Reconnecting failed', options)
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
          <HostLobbyState
            event={event}
            onStart={() => completeTask(gameID!, token!)}
          />
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
            onSkip={() => completeTask(gameID!, token!)}
          />
        )
      case GameEventType.GameQuestionPlayer:
        return (
          <PlayerQuestionState
            event={event}
            onSubmitQuestionAnswer={(request) =>
              submitQuestionAnswer(gameID!, token!, request)
            }
          />
        )
      case GameEventType.GameAwaitingResultPlayer:
        return <PlayerAwaitingResultState event={event} />
      case GameEventType.GameLeaderboardHost:
        return (
          <HostLeaderboardState
            event={event}
            onNext={() => completeTask(gameID!, token!)}
          />
        )
      case GameEventType.GameResultHost:
        return (
          <HostResultState
            event={event}
            onNext={() => completeTask(gameID!, token!)}
          />
        )
      case GameEventType.GameResultPlayer:
        return <PlayerResultState event={event} />
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
  }, [event, gameID, token, completeTask, submitQuestionAnswer])

  return <>{stateComponent}</>
}

export default GamePage
