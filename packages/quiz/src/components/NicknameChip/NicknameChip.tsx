import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'

import styles from './NicknameChip.module.scss'

export interface NicknameChipProps {
  value: string
  onDelete?: () => void
}

const NicknameChip: FC<NicknameChipProps> = ({ value, onDelete }) => (
  <div className={styles.main}>
    {value}
    {onDelete && (
      <button className={styles.delete} onClick={onDelete}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    )}
  </div>
)

export default NicknameChip
