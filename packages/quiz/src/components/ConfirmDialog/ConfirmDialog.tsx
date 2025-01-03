import React, { FC } from 'react'

import { Button } from '../index.ts'
import Modal from '../Modal'

import styles from './ConfirmDialog.module.scss'

export interface ConfirmDialogProps {
  title: string
  message: string
  open?: boolean
  destructive?: boolean
  confirmTitle?: string
  onConfirm?: () => void
  onClose?: () => void
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  message,
  open = false,
  destructive = false,
  confirmTitle = 'Confirm',
  onConfirm,
  onClose,
}) => (
  <Modal title={title} open={open}>
    {message}
    <div className={styles.actions}>
      <Button
        id="confirm-button"
        type="button"
        kind={destructive ? 'destructive' : 'call-to-action'}
        size="small"
        value={confirmTitle}
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
  </Modal>
)

export default ConfirmDialog
