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
import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'

import styles from './IconTooltip.module.scss'

export interface IconTooltipProps {
  icon: IconDefinition
  children: ReactNode | ReactNode[] | string
}

const IconTooltip: FC<IconTooltipProps> = ({ icon, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, { move: false })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, {
    role: 'label',
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  return (
    <>
      <button
        ref={refs.setReference}
        className={styles.iconTooltipButton}
        {...getReferenceProps()}>
        <FontAwesomeIcon icon={icon} />
      </button>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={styles.iconTooltip}
          {...getFloatingProps()}>
          {children}
        </div>
      )}
    </>
  )
}

export default IconTooltip
