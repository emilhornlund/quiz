import type { FC } from 'react'

import styles from './PointsBehindIndicator.module.scss'

export interface PointBehindIndicatorProps {
  points: number
  nickname: string
}

const PointBehindIndicator: FC<PointBehindIndicatorProps> = ({
  points,
  nickname,
}) => (
  <div className={styles.pointsBehindIndicator}>
    <strong>{points}</strong> points behind <strong>{nickname}</strong>
  </div>
)

export default PointBehindIndicator
