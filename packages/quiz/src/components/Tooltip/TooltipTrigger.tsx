import { useMergeRefs } from '@floating-ui/react'
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'
import { isValidElement } from 'react'
import { cloneElement, forwardRef } from 'react'

import { useTooltipContext } from './use-tooltip.context'

/**
 * Utility type for permitting `data-*` attributes on the trigger element.
 *
 * This is required to support attributes like `data-state` in a type-safe way
 * when composing props across `cloneElement` and Floating UI helpers.
 */
type DataAttributes = {
  [key: `data-${string}`]: string | undefined
}

/**
 * Props for {@link TooltipTrigger}.
 *
 * - Accepts standard HTML attributes for the trigger element.
 * - Accepts arbitrary `data-*` attributes for state-based styling.
 * - Supports `asChild` to allow the consumer to provide the trigger element.
 */
type TooltipTriggerProps = HTMLAttributes<HTMLElement> &
  DataAttributes & {
    asChild?: boolean
  }

/**
 * Narrow React element type used for safe `cloneElement` prop spreading.
 *
 * Ensures `children.props` is an object type (required for spreads) and allows
 * reading a possible `ref` for merged refs.
 */
type ReactElementWithObjectProps = ReactElement<Record<string, unknown>> & {
  ref?: Ref<HTMLElement>
}

/**
 * Type guard that narrows a React node into a React element with object props.
 *
 * This allows safe access to `children.props` and an optional `children.ref`
 * without using `any`.
 *
 * @param node - React node to test.
 * @returns True when the node is a valid React element with object props.
 */
const isElementWithObjectProps = (
  node: ReactNode,
): node is ReactElementWithObjectProps => isValidElement(node)

/**
 * Tooltip trigger component that registers the reference element with Floating UI.
 *
 * Behavior:
 * - Default: renders an unstyled `<button type="button">` as the trigger.
 * - `asChild`: clones the single child element and applies trigger props/refs.
 *
 * Adds `data-state="open|closed"` to enable state-based styling.
 *
 * @returns The trigger element wired to the tooltip context.
 */
const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useTooltipContext()

    const childRef = isElementWithObjectProps(children)
      ? children.ref
      : undefined

    const ref = useMergeRefs([context.refs.setReference, propRef, childRef])

    if (asChild && isElementWithObjectProps(children)) {
      const referenceProps = context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
      })

      return cloneElement(children, {
        ...referenceProps,
        'data-state': context.open ? 'open' : 'closed',
      })
    }

    return (
      <button
        ref={ref}
        type="button"
        data-state={context.open ? 'open' : 'closed'}
        style={{
          all: 'unset',
          cursor: 'pointer',
        }}
        {...context.getReferenceProps(props)}>
        {children}
      </button>
    )
  },
)

export default TooltipTrigger
