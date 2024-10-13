import { GameEvent } from '@quiz/common'
import { useCallback, useEffect, useRef, useState } from 'react'

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  RECONNECTING_FAILED = 'RECONNECTING_FAILED',
}

export const useEventSource = (
  gameID?: string,
): [GameEvent | undefined, ConnectionStatus] => {
  const eventSourceRef = useRef<EventSource>()

  const [gameEvent, setGameEvent] = useState<GameEvent>()

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.CONNECTED,
  )

  const MAX_RETRIES = 10

  const createEventSource = useCallback((gameID: string, retryCount = 0) => {
    if (retryCount >= MAX_RETRIES) {
      console.error(
        'Max retry attempts reached. Stopping reconnection attempts.',
      )
      setConnectionStatus(ConnectionStatus.RECONNECTING_FAILED)
      return
    }

    const eventSource = new EventSource(
      `http://localhost:3000/api/game/${gameID}/events`,
    )

    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      setGameEvent(JSON.parse(event.data) as GameEvent)
      retryCount = 0
      setConnectionStatus(ConnectionStatus.CONNECTED)
    }

    eventSource.onerror = () => {
      setConnectionStatus(ConnectionStatus.RECONNECTING)
      eventSource.close()

      const nextRetryDelay = Math.min(1000 * 2 ** retryCount, 30000)
      console.error(
        `Connection failed, retrying in ${nextRetryDelay / 1000} seconds...`,
      )

      setTimeout(() => {
        createEventSource(gameID, retryCount + 1)
      }, nextRetryDelay)
    }
  }, [])

  useEffect(() => {
    if (gameID) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      createEventSource(gameID)

      return () => {
        eventSourceRef.current?.close()
      }
    }
  }, [createEventSource, gameID])

  return [gameEvent, connectionStatus]
}
