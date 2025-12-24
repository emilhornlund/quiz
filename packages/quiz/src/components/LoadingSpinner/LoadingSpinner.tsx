import type { FC } from 'react'

import styles from './LoadingSpinner.module.scss'

const LoadingSpinner: FC = () => (
  <div className={styles.loadingSpinnerContainer} data-testid="loading-spinner">
    <div></div>
    <div></div>
    <div></div>
  </div>
)

export default LoadingSpinner
