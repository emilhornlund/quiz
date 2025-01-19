import React, { FC } from 'react'

import styles from './LoadingSpinner.module.scss'

const LoadingSpinner: FC = () => (
  <div className={styles.loadingSpinnerContainer}>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

export default LoadingSpinner
