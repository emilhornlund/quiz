import { FloatingPortal, useMergeRefs } from '@floating-ui/react'
import type { HTMLProps } from 'react'
import { forwardRef } from 'react'

import { useTooltipContext } from './use-tooltip.context'

/**
 * Renders the tooltip floating element into a portal when the tooltip is open.
 *
 * Uses Floating UI positioning styles and interaction props from the tooltip
 * context.
 *
 * @returns The tooltip content element when open; otherwise `null`.
 */
const TooltipContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  function TooltipContent({ style, ...props }, propRef) {
    const context = useTooltipContext()
    const ref = useMergeRefs([context.refs.setFloating, propRef])

    if (!context.open) return null

    return (
      <FloatingPortal>
        <div
          ref={ref}
          style={{
            ...context.floatingStyles,
            ...style,
          }}
          {...context.getFloatingProps(props)}
        />
      </FloatingPortal>
    )
  },
)

export default TooltipContent
