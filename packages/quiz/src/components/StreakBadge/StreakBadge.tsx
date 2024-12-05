import React, { FC } from 'react'

import { Badge } from '../index.ts'

import styles from './StreakBadge.module.scss'

export interface StreakBadgeProps {
  streak?: number
  children?: React.ReactNode | React.ReactNode[]
}

const StreakBadge: FC<StreakBadgeProps> = ({ streak, children }) => {
  if (!streak || streak < 1) return null
  return (
    <div className={styles.streakBadge}>
      {children}
      <Badge size="small" backgroundColor="orange">
        {streak}
      </Badge>
    </div>
  )
}

export default StreakBadge
