import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC, MouseEvent } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './Card.module.scss'

export type CardKind = 'primary' | 'call-to-action' | 'success'

export type CardSize = 'small' | 'medium' | 'large' | 'full'

const CardKindClassName: {
  [key in CardKind]: string
} = {
  primary: styles.kindPrimary,
  'call-to-action': styles.kindCallToAction,
  success: styles.kindSuccess,
}

const CardSizeClassName: { [key in CardSize]: string } = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
  full: styles.sizeFull,
}

export interface CardProps {
  kind?: CardKind
  size?: CardSize
  center?: boolean
  onDismiss?: () => void
  children?: React.ReactNode
}

const Card: FC<CardProps> = ({
  kind = 'primary',
  size = 'full',
  center,
  onDismiss,
  children,
}) => {
  const handleDismissClick = (event: MouseEvent): void => {
    event?.preventDefault()
    onDismiss?.()
  }

  return (
    <div
      className={classNames(
        styles.card,
        CardKindClassName[kind],
        CardSizeClassName[size],
        center ? styles.center : undefined,
      )}>
      {onDismiss && (
        <button type="button" onClick={handleDismissClick}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  )
}

export default Card
