import {
  deepEqual,
  GameEvent,
  GameEventType,
  HEARTBEAT_INTERVAL,
} from '@quiz/common'
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

  const eventSourceRef = useRef<InstanceType<
    typeof EventSourcePolyfill
  > | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const instanceIdRef = useRef(0)
  const isShuttingDownRef = useRef(false)
  const lastEventRef = useRef<GameEvent | undefined>(undefined)

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }

  const cleanupEventSource = () => {
    clearReconnectTimeout()

    const current = eventSourceRef.current
    if (current) {
      current.onopen = null
      current.onmessage = null
      current.onerror = null
      current.close()
    }

    eventSourceRef.current = null
  }

  const getRetryDelay = (retryCount: number) =>
    Math.min(1000 * 2 ** retryCount, 30000)

  const createEventSource = useCallback(
    (gameIdValue: string, tokenValue: string, retryCount = 0) => {
      if (retryCount >= MAX_RETRIES) {
        console.error(
          'Max retry attempts reached. Stopping reconnection attempts.',
        )
        cleanupEventSource()
        setConnectionStatus(ConnectionStatus.RECONNECTING_FAILED)
        return
      }

      const instanceId = ++instanceIdRef.current

      cleanupEventSource()
      lastEventRef.current = undefined

      const eventSource = new EventSourcePolyfill(
        `${config.quizServiceUrl}/games/${gameIdValue}/events`,
        {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
            'Content-Type': 'application/json',
          },
          heartbeatTimeout: HEARTBEAT_INTERVAL * 1.5,
        },
      )

      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        if (instanceId !== instanceIdRef.current) return
        setConnectionStatus(ConnectionStatus.CONNECTED)
      }

      eventSource.onmessage = (event) => {
        if (instanceId !== instanceIdRef.current) return

        const data = JSON.parse(event.data) as GameEvent
        if (data.type !== GameEventType.GameHeartbeat) {
          // Only update state if the event has actually changed
          if (!deepEqual(data, lastEventRef.current)) {
            lastEventRef.current = data
            setGameEvent(data)
          }
        }
      }

      eventSource.onerror = () => {
        if (instanceId !== instanceIdRef.current || isShuttingDownRef.current) {
          return
        }

        if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
          return
        }

        console.error('Connection error, retrying...')
        setConnectionStatus(ConnectionStatus.RECONNECTING)

        eventSource.onopen = null
        eventSource.onmessage = null
        eventSource.onerror = null
        eventSource.close()

        const delay = getRetryDelay(retryCount)

        clearReconnectTimeout()
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (isShuttingDownRef.current) return
          createEventSource(gameIdValue, tokenValue, retryCount + 1)
        }, delay)
      }
    },
    [],
  )

  useEffect(() => {
    if (gameID && token) {
      isShuttingDownRef.current = false
      setConnectionStatus(ConnectionStatus.INITIALIZED)
      createEventSource(gameID, token)
    }

    return () => {
      isShuttingDownRef.current = true
      cleanupEventSource()
    }
  }, [createEventSource, gameID, token])

  return [gameEvent, connectionStatus]
}
