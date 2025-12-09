import React, { FC } from 'react'

import { Badge, BadgeColor } from '../index.ts'

import styles from './StreakBadge.module.scss'

export type StreakBadgeStyle = 'default' | 'gold' | 'silver' | 'bronze'

export interface StreakBadgeProps {
  streak?: number
  style?: StreakBadgeStyle
  children?: React.ReactNode | React.ReactNode[]
}

const getBackgroundColor = (style: StreakBadgeStyle): BadgeColor => {
  switch (style) {
    case 'gold':
    case 'bronze':
      return 'white'
    case 'silver':
    case 'default':
      return 'orange'
  }
}

const getBorderColor = (style: StreakBadgeStyle): BadgeColor => {
  switch (style) {
    case 'gold':
    case 'bronze':
      return 'white'
    case 'silver':
    case 'default':
      return 'orange'
  }
}

const getTextColor = (style: StreakBadgeStyle): BadgeColor => {
  switch (style) {
    case 'gold':
    case 'bronze':
      return 'orange'
    case 'silver':
    case 'default':
      return 'white'
  }
}

const StreakBadge: FC<StreakBadgeProps> = ({
  streak,
  style = 'default',
  children,
}) => {
  if (!streak || streak < 2) return null
  return (
    <div className={styles.streakBadge}>
      {children}
      <Badge
        size="small"
        backgroundColor={getBackgroundColor(style)}
        borderColor={getBorderColor(style)}
        textColor={getTextColor(style)}>
        {streak}
      </Badge>
    </div>
  )
}

export default StreakBadge
