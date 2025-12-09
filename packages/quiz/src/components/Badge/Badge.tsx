import React, { FC, ReactNode, useEffect, useState } from 'react'

import colors from '../../styles/colors.module.scss'
import { classNames } from '../../utils/helpers.ts'

import styles from './Badge.module.scss'

export type BadgeSize = 'small' | 'large'

const BadgeSizeClassName: { [key in BadgeSize]: string } = {
  small: styles.small,
  large: styles.large,
}

export type BadgeColor =
  | 'green'
  | 'red'
  | 'orange'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'white'
  | 'black'

const BadgeColorClassName: { [key in BadgeColor]: string } = {
  green: colors.green2,
  red: colors.red2,
  orange: colors.orange2,
  gold: colors.gold,
  silver: colors.silver,
  bronze: colors.bronze,
  white: colors.white,
  black: colors.black1,
}

export type BadgeCelebration = 'none' | 'normal' | 'major' | 'epic'

const BadgeCelebrationClassName: { [key in BadgeCelebration]: string } = {
  none: '',
  normal: styles.celebrationNormal,
  major: styles.celebrationMajor,
  epic: styles.celebrationEpic,
}

export interface BadgeProps {
  size?: BadgeSize
  backgroundColor?: BadgeColor
  borderColor?: BadgeColor
  textColor?: BadgeColor
  celebration?: BadgeCelebration
  onAnimationEnd?: () => void
  children?: ReactNode
}

const Badge: FC<BadgeProps> = ({
  size = 'small',
  backgroundColor = 'white',
  borderColor = 'white',
  textColor = 'white',
  celebration = 'none',
  onAnimationEnd,
  children,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (celebration && celebration !== 'none') {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        onAnimationEnd?.()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [celebration, onAnimationEnd])

  return (
    <div
      className={classNames(
        styles.badge,
        BadgeSizeClassName[size],
        isAnimating ? BadgeCelebrationClassName[celebration] : '',
        borderColor ? styles.border : undefined,
      )}
      style={{
        backgroundColor: BadgeColorClassName[backgroundColor],
        outlineColor: BadgeColorClassName[borderColor],
        color: BadgeColorClassName[textColor],
      }}>
      {children}
    </div>
  )
}

export default Badge
