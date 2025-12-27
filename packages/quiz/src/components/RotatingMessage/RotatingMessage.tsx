import type { ReactNode } from 'react'

import { classNames } from '../../utils/helpers'

import styles from './RotatingMessage.module.scss'
import {
  useRotatingMessage,
  type UseRotatingMessageOptions,
} from './useRotatingMessage'

/**
 * Props for the `RotatingMessage` component.
 *
 * Renders a message that automatically rotates through a provided list with
 * staged enter/exit animations (`entering`, `exiting`, `visible`) applied via
 * CSS module class names.
 */
export type RotatingMessageProps = {
  /**
   * The messages to rotate through.
   *
   * When the list is empty, nothing is rendered.
   * When the list contains a single message, the message is rendered without rotating.
   */
  messages: string[]

  /**
   * Optional class name applied to the outer container.
   *
   * This is useful for layout adjustments (spacing, alignment, width constraints)
   * without altering the component’s internal styling.
   */
  className?: string

  /**
   * Optional class name applied to the inner message wrapper.
   *
   * This can be used to tweak typography, spacing, or styling of the message content
   * while preserving the component’s animation stage classes.
   */
  messageClassName?: string

  /**
   * Optional configuration for rotation timing and animation staging.
   *
   * Passed through to `useRotatingMessage` to control:
   * - rotation cadence (`rotateEveryMs`)
   * - exit duration (`exitDurationMs`)
   * - enter duration (`enterDurationMs`)
   * - initial stage (`startStage`)
   */
  options?: UseRotatingMessageOptions

  /**
   * Optional render function for customizing how the message is displayed.
   *
   * If not provided, the raw message string is rendered.
   *
   * @param message - The currently active message string.
   * @returns The rendered message content.
   */
  renderMessage?: (message: string) => ReactNode
}

/**
 * Displays a rotating message with animation stages controlled by `useRotatingMessage`.
 *
 * This component is responsible for:
 * - Applying the container and message wrapper structure.
 * - Binding the current animation stage to CSS module classes.
 * - Allowing the message content rendering to be customized via `renderMessage`.
 *
 * If `messages` is empty (or the resolved message is empty), the component renders nothing.
 */
const RotatingMessage = ({
  messages,
  className,
  messageClassName,
  options,
  renderMessage,
}: RotatingMessageProps) => {
  const { message, animation } = useRotatingMessage(messages, options)

  if (!message) return null

  return (
    <div className={classNames(styles.messageContainer, className)}>
      <div
        className={classNames(
          styles.message,
          styles[animation],
          messageClassName,
        )}>
        {renderMessage ? renderMessage(message) : message}
      </div>
    </div>
  )
}

export default RotatingMessage
