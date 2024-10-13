import { GameEventType } from '@quiz/common'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ConnectionStatusBanner, LoadingSpinner, Page } from '../../components'
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
import { useEventSource } from '../../utils/use-event-source.tsx'

const GamePage = () => {
  const [searchParams] = useSearchParams()

  const [gameID, setGameID] = useState<string>()

  const [event, connectionStatus] = useEventSource(gameID)

  useEffect(() => {
    setGameID(searchParams.get('gameID') ?? undefined)
  }, [searchParams])

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
      <ConnectionStatusBanner status={connectionStatus} />
    </>
  )
}

export default GamePage
