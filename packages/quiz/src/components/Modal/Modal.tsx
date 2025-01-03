import {
  FloatingFocusManager,
  FloatingOverlay,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import React, { FC, ReactNode, useId } from 'react'

import styles from './Modal.module.scss'

export interface ModalProps {
  title: string
  open?: boolean
  children?: ReactNode | ReactNode[]
}

const Modal: FC<ModalProps> = ({ title, open = false, children }) => {
  const { refs, context } = useFloating({
    open,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
  })
  const role = useRole(context)

  const { getFloatingProps } = useInteractions([click, dismiss, role])

  const titleId = useId()

  if (!open) {
    return null
  }

  return (
    <FloatingOverlay lockScroll className={styles.floatingOverlay}>
      <FloatingFocusManager context={context}>
        <div
          aria-labelledby={titleId}
          className={styles.modalContainer}
          ref={refs.setFloating}
          {...getFloatingProps()}>
          <div id={titleId} className={styles.title}>
            {title}
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  )
}

export default Modal
