import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'

import styles from './NicknameChip.module.scss'

export interface NicknameChipProps {
  value: string
  onDelete?: () => void
  animationState?: 'entrance' | 'exit' | 'shake' | 'none'
  staggerDelay?: number
}

const NicknameChip: FC<NicknameChipProps> = ({
  value,
  onDelete,
  animationState = 'none',
  staggerDelay = 0,
}) => {
  const animationClasses = [
    animationState === 'entrance' && styles.entrance,
    animationState === 'exit' && styles.exit,
    animationState === 'shake' && styles.shake,
  ]
    .filter(Boolean)
    .join(' ')

  const inlineStyles =
    staggerDelay > 0
      ? {
          animationDelay: `${staggerDelay}ms`,
        }
      : {}

  return (
    <div className={`${styles.main} ${animationClasses}`} style={inlineStyles}>
      {value}
      {onDelete && (
        <button className={styles.delete} onClick={onDelete}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  )
}

export default NicknameChip
