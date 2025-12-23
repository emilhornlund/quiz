import React, { ReactNode } from 'react'
import { FC } from 'react'

import { TooltipOptions } from './tooltip.types'
import { TooltipContext } from './use-tooltip.context'
import { useTooltip } from './use-tooltip.hook'

/**
 * Props for the Tooltip provider component.
 *
 * Extends {@link TooltipOptions} to support both controlled and uncontrolled
 * tooltip state and Floating UI placement configuration.
 */
export interface TooltipProps extends TooltipOptions {
  children: ReactNode
}

/**
 * Tooltip provider component that wires Floating UI tooltip behavior into a
 * React context.
 *
 * This component must wrap any Tooltip subcomponents that call
 * {@link useTooltipContext}.
 *
 * @param children - Tooltip subtree, typically trigger + content.
 * @param options - Tooltip configuration and optional controlled state.
 * @returns A context provider that enables tooltip trigger/content composition.
 */
const Tooltip: FC<TooltipProps> = ({ children, ...options }) => {
  const tooltip = useTooltip(options)
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  )
}

export default Tooltip
