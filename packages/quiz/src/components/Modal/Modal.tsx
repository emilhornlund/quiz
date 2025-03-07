import {
  FloatingFocusManager,
  FloatingOverlay,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import React, { FC, ReactNode, useId } from 'react'

import Button from '../Button'

import styles from './Modal.module.scss'

export interface ModalProps {
  title: string
  open?: boolean
  onClose?: () => void
  children?: ReactNode | ReactNode[]
}

const Modal: FC<ModalProps> = ({ title, open = false, onClose, children }) => {
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
          <div className={styles.header}>
            <div id={titleId} className={styles.title}>
              {title}
            </div>
            {onClose && (
              <Button
                id="close-modal-button"
                type="button"
                kind="plain"
                icon={faXmark}
                iconColor="gray"
                onClick={onClose}
              />
            )}
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  )
}

export default Modal
