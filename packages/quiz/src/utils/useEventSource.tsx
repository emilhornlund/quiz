import { GameEvent, GameEventType } from '@quiz/common'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useCallback, useEffect, useRef, useState } from 'react'

import config from '../config.ts'

/**
 * Connection lifecycle statuses for the EventSource stream.
 *
 * - `INITIALIZED`: Hook is set up or reconnect has just started.
 * - `CONNECTED`: The SSE connection is open.
 * - `RECONNECTING`: A transient error occurred; an automatic retry is scheduled.
 * - `RECONNECTING_FAILED`: Retries exhausted; no further attempts will be made.
 */
export enum ConnectionStatus {
  INITIALIZED = 'INITIALIZED',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  RECONNECTING_FAILED = 'RECONNECTING_FAILED',
}

/**
 * Subscribes to server-sent events (SSE) for a given game and token, returning
 * the most recent **non-heartbeat** `GameEvent` and the current connection status.
 *
 * Behavior:
 * - Opens an `EventSource` to: `${config.quizServiceUrl}/games/${gameID}/events`.
 * - Sends `Authorization: Bearer <token>` via headers (using `EventSourcePolyfill`).
 * - Filters out `GameEventType.GameHeartbeat` messages (they do not update `gameEvent`).
 * - On error, retries with exponential backoff (1s, 2s, 4s, ... capped at 30s) up to 10 attempts.
 * - Cleans up the EventSource on unmount and when `gameID`/`token` change.
 *
 * @param gameID Game identifier to subscribe to (required to connect).
 * @param token  Bearer token for authentication (required to connect).
 * @returns A tuple: `[latestNonHeartbeatEvent, connectionStatus]`.
 */
export const useEventSource = (
  gameID?: string,
  token?: string,
): [GameEvent | undefined, ConnectionStatus] => {
  const [gameEvent, setGameEvent] = useState<GameEvent>()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.INITIALIZED,
  )

  const MAX_RETRIES = 10
  const eventSourceRef = useRef<EventSource | null>(null)

  const createEventSource = useCallback(
    (gameID: string, token: string, retryCount = 0) => {
      if (retryCount >= MAX_RETRIES) {
        console.error(
          'Max retry attempts reached. Stopping reconnection attempts.',
        )
        setConnectionStatus(ConnectionStatus.RECONNECTING_FAILED)
        return
      }

      const eventSource = new EventSourcePolyfill(
        `${config.quizServiceUrl}/games/${gameID}/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setConnectionStatus(ConnectionStatus.CONNECTED)
      }

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data) as GameEvent
        if (data.type !== GameEventType.GameHeartbeat) {
          setGameEvent(data)
        }
      }

      eventSource.onerror = () => {
        console.error('Connection error, retrying...')
        setConnectionStatus(ConnectionStatus.RECONNECTING)
        eventSource.close()
        setTimeout(
          () => {
            createEventSource(gameID, token, retryCount + 1)
          },
          Math.min(1000 * 2 ** retryCount, 30000),
        )
      }
    },
    [],
  )

  useEffect(() => {
    if (gameID && token) {
      setConnectionStatus(ConnectionStatus.INITIALIZED)
      createEventSource(gameID, token)
    }
    return () => {
      eventSourceRef.current?.close()
    }
  }, [createEventSource, gameID, token])

  return [gameEvent, connectionStatus]
}
