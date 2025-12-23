import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useMemo, useState } from 'react'

import { TooltipOptions } from './tooltip.types'

/**
 * Creates and composes Floating UI tooltip behavior.
 *
 * Provides:
 * - Floating UI positioning (`useFloating`) with middleware for offset, flip, and shift.
 * - Interactions for hover, focus, dismiss, and tooltip role.
 * - Controlled and uncontrolled open state support.
 *
 * Controlled behavior:
 * - When `open` is provided, the tooltip becomes controlled.
 * - Hover and focus interactions are disabled so the parent owns state changes.
 *
 * @param options - Tooltip configuration and optional controlled state.
 * @returns Tooltip state, refs, positioning data, and interaction prop getters.
 */
export const useTooltip = ({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 5,
      }),
      shift({ padding: 5 }),
    ],
  })

  const context = data.context

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
  })
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data],
  )
}
