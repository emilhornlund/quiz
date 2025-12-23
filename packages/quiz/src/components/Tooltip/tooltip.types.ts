import type { Placement } from '@floating-ui/react'

/**
 * Configuration options for the tooltip system.
 *
 * Supports both uncontrolled and controlled usage patterns:
 * - Uncontrolled: omit `open` and use internal state (initialized via `initialOpen`).
 * - Controlled: provide `open` and `onOpenChange` to manage state externally.
 */
export interface TooltipOptions {
  /**
   * Initial open state when used uncontrolled.
   *
   * Ignored when `open` is provided.
   */
  initialOpen?: boolean

  /**
   * Floating UI placement for the tooltip content.
   */
  placement?: Placement

  /**
   * Controlled open state.
   *
   * When provided, hover/focus interactions are disabled and the tooltip state
   * is owned by the parent.
   */
  open?: boolean

  /**
   * Callback invoked when the tooltip requests an open state change.
   *
   * Used for controlled mode. When not provided, internal state is used.
   */
  onOpenChange?: (open: boolean) => void
}
