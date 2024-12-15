import {
  FloatingFocusManager,
  FloatingOverlay,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import React, { FC, useId } from 'react'

import { Button } from '../index.ts'

import styles from './ConfirmDialog.module.scss'

export interface ConfirmDialogProps {
  title: string
  message: string
  open?: boolean
  destructive?: boolean
  onConfirm?: () => void
  onClose?: () => void
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  message,
  open = false,
  destructive = false,
  onConfirm,
  onClose,
}) => {
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
  const descriptionId = useId()

  return (
    <>
      {open && (
        <FloatingOverlay lockScroll className={styles.floatingOverlay}>
          <FloatingFocusManager context={context}>
            <div
              className={styles.confirmDialog}
              ref={refs.setFloating}
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              {...getFloatingProps()}>
              <div id={titleId} className={styles.title}>
                {title}
              </div>
              <div id={descriptionId} className={styles.message}>
                {message}
              </div>
              <div className={styles.actions}>
                <Button
                  id="confirm-button"
                  type="button"
                  kind={destructive ? 'destructive' : 'call-to-action'}
                  size="small"
                  value="Confirm"
                  onClick={() => onConfirm?.()}
                />
                <Button
                  id="close-button"
                  type="button"
                  kind="secondary"
                  size="small"
                  value="Close"
                  onClick={() => onClose?.()}
                />
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </>
  )
}

export default ConfirmDialog
