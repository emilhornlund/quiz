import { createContext, useContext } from 'react'

import { useTooltip } from './use-tooltip.hook'

/**
 * Tooltip context value type.
 *
 * Represents the full return value of {@link useTooltip}, which includes:
 * - open state and setter
 * - Floating UI refs, positioning styles, and context
 * - Interaction prop getters for reference and floating elements
 */
type ContextType = ReturnType<typeof useTooltip> | null

/**
 * React context used by tooltip subcomponents to access tooltip behavior.
 */
export const TooltipContext = createContext<ContextType>(null)

/**
 * Reads the tooltip context.
 *
 * Throws when used outside of a {@link Tooltip} provider to make misuse fail
 * fast and avoid silent runtime errors.
 *
 * @returns The tooltip context value.
 */
export const useTooltipContext = () => {
  const context = useContext(TooltipContext)

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />')
  }

  return context
}
