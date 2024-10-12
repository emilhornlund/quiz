import React, { FC } from 'react'

import styles from './ProgressBar.module.scss'

export interface ProgressBarProps {
  value: number
}

const ProgressBar: FC<ProgressBarProps> = ({ value }) => (
  <div className={styles.progressBar}>
    <span style={{ width: `${Math.max(Math.min(1, value), 0) * 100}%` }} />
  </div>
)

export default ProgressBar
