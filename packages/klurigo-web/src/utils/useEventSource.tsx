import type { GameEvent } from '@klurigo/common'
import { deepEqual, GameEventType, HEARTBEAT_INTERVAL } from '@klurigo/common'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useCallback, useEffect, useRef, useState } from 'react'

import config from '../config'

import type { ConnectionStatus } from './event-source.types'
import { ConnectionStatus as ConnectionStatusValue } from './event-source.types'

/**
 * Subscribes to server-sent events (SSE) for a given game and token, returning
 * the most recent **non-heartbeat** `GameEvent` and the current connection status.
 *
 * Behavior:
 * - Opens an `EventSource` to: `${config.klurigoServiceUrl}/games/${gameID}/events`.
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
    ConnectionStatusValue.INITIALIZED,
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

  const cleanupEventSource = useCallback(() => {
    clearReconnectTimeout()

    const current = eventSourceRef.current
    if (current) {
      current.onopen = null
      current.onmessage = null
      current.onerror = null
      current.close()
    }

    eventSourceRef.current = null
  }, [])

  const getRetryDelay = (retryCount: number) =>
    Math.min(1000 * 2 ** retryCount, 30000)

  const createEventSource = useCallback(
    (gameIdValue: string, tokenValue: string, retryCount = 0) => {
      if (retryCount >= MAX_RETRIES) {
        console.error(
          'Max retry attempts reached. Stopping reconnection attempts.',
        )
        cleanupEventSource()
        setConnectionStatus(ConnectionStatusValue.RECONNECTING_FAILED)
        return
      }

      const instanceId = ++instanceIdRef.current

      cleanupEventSource()
      lastEventRef.current = undefined

      const eventSource = new EventSourcePolyfill(
        `${config.klurigoServiceUrl}/games/${gameIdValue}/events`,
        {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
            Accept: 'text/event-stream',
          },
          heartbeatTimeout: HEARTBEAT_INTERVAL * 3,
        },
      )

      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        if (instanceId !== instanceIdRef.current) return
        setConnectionStatus(ConnectionStatusValue.CONNECTED)
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
        setConnectionStatus(ConnectionStatusValue.RECONNECTING)

        eventSource.onopen = null
        eventSource.onmessage = null
        eventSource.onerror = null
        eventSource.close()

        const delay = getRetryDelay(retryCount)

        clearReconnectTimeout()
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (isShuttingDownRef.current) return
          // eslint-disable-next-line react-hooks/immutability
          createEventSource(gameIdValue, tokenValue, retryCount + 1)
        }, delay)
      }
    },
    [cleanupEventSource],
  )

  useEffect(() => {
    if (gameID && token) {
      isShuttingDownRef.current = false
      setConnectionStatus(ConnectionStatusValue.INITIALIZED)
      createEventSource(gameID, token)
    }

    return () => {
      isShuttingDownRef.current = true
      cleanupEventSource()
    }
  }, [cleanupEventSource, createEventSource, gameID, token])

  return [gameEvent, connectionStatus]
}
