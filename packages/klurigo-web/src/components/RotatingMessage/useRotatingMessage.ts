import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Represents the current animation stage of a rotating message.
 *
 * These values are intended to be mapped to CSS classes (e.g. CSS Modules)
 * to drive enter/exit transitions.
 */
export type RotatingMessageAnimationStage = 'visible' | 'entering' | 'exiting'

/**
 * Resolves the next message from a list, given the currently displayed message.
 *
 * - If `messages` is empty, returns an empty string.
 * - If `currentMessage` is missing or not found in the list, returns the first message.
 * - Otherwise, returns the next message in sequence (wrapping to the start).
 *
 * @param messages - The ordered list of messages to rotate through.
 * @param currentMessage - The currently displayed message.
 * @returns The next message to display.
 */
function getNextMessage(messages: string[], currentMessage?: string): string {
  if (messages.length === 0) return ''
  if (!currentMessage) return messages[0] || ''

  const currentIndex = messages.indexOf(currentMessage)
  if (currentIndex === -1) return messages[0] || ''

  const nextIndex = (currentIndex + 1) % messages.length
  return messages[nextIndex] || ''
}

/**
 * Configuration options for `useRotatingMessage`.
 */
export type UseRotatingMessageOptions = {
  /**
   * The cadence for rotating messages, in milliseconds.
   *
   * Default: 8000ms.
   */
  rotateEveryMs?: number

  /**
   * The time spent in the `exiting` stage before switching to the next message, in milliseconds.
   *
   * Default: 200ms.
   */
  exitDurationMs?: number

  /**
   * The time spent in the `entering` stage before settling on `visible`, in milliseconds.
   *
   * Default: 300ms.
   */
  enterDurationMs?: number

  /**
   * The initial animation stage when the hook mounts.
   *
   * Default: `visible`.
   */
  startStage?: RotatingMessageAnimationStage
}

type TimeoutHandle = ReturnType<typeof setTimeout>
type IntervalHandle = ReturnType<typeof setInterval>

/**
 * Hook for rotating through a list of messages with staged animation state.
 *
 * The hook exposes:
 * - `message`: the currently active message string
 * - `animation`: one of `visible`, `entering`, `exiting` to drive CSS transitions
 *
 * Rotation behavior:
 * - If `messages` is empty, `message` is an empty string and rotation is disabled.
 * - If `messages` has one item, the message is shown without rotating.
 * - When rotating, the hook transitions `visible -> exiting -> entering -> visible`.
 *
 * The hook clears any intervals/timeouts on unmount and when timing options change.
 *
 * @param messages - The ordered list of messages to rotate through.
 * @param options - Optional timing and staging configuration.
 * @returns The current message and animation stage.
 */
export const useRotatingMessage = (
  messages: string[],
  options: UseRotatingMessageOptions = {},
) => {
  const {
    rotateEveryMs = 8000,
    exitDurationMs = 200,
    enterDurationMs = 300,
    startStage = 'visible',
  } = options

  const messagesRef = useRef<string[]>(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const [message, setMessage] = useState<string>(() => getNextMessage(messages))
  const [animation, setAnimation] =
    useState<RotatingMessageAnimationStage>(startStage)

  const intervalRef = useRef<IntervalHandle | null>(null)
  const exitTimeoutRef = useRef<TimeoutHandle | null>(null)
  const enterTimeoutRef = useRef<TimeoutHandle | null>(null)

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current)
      enterTimeoutRef.current = null
    }
  }

  useEffect(() => {
    setMessage((prev) => {
      if (messages.length === 0) return ''
      if (prev && messages.includes(prev)) return prev
      return messages[0] || ''
    })
  }, [messages])

  useEffect(() => {
    clearTimers()

    if (messagesRef.current.length <= 1) {
      setAnimation('visible')
      return () => clearTimers()
    }

    const rotate = () => {
      if (messagesRef.current.length === 0) {
        setMessage('')
        setAnimation('visible')
        return
      }

      setAnimation('exiting')

      exitTimeoutRef.current = setTimeout(() => {
        setMessage((prev) => getNextMessage(messagesRef.current, prev))
        setAnimation('entering')

        enterTimeoutRef.current = setTimeout(() => {
          setAnimation('visible')
        }, enterDurationMs)
      }, exitDurationMs)
    }

    intervalRef.current = setInterval(rotate, rotateEveryMs)

    return () => clearTimers()
  }, [rotateEveryMs, exitDurationMs, enterDurationMs])

  return useMemo(() => ({ message, animation }), [message, animation])
}
