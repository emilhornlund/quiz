import React, { FC, useMemo } from 'react'

import { classNames } from '../../utils/helpers'
import { DeviceType, useDeviceSizeType } from '../../utils/use-device-size'

import styles from './CircularProgressBar.module.scss'
import { CircularProgressBarKind, CircularProgressBarSize } from './types'

const getCircularProgressBarKindClass = (
  kind: CircularProgressBarKind,
): string => {
  switch (kind) {
    case CircularProgressBarKind.Default:
      return styles.default
    case CircularProgressBarKind.Correct:
      return styles.correct
    case CircularProgressBarKind.Secondary:
      return styles.secondary
  }
}

const getCircularProgressBarSizeClass = (
  size: CircularProgressBarSize,
): string => {
  switch (size) {
    case CircularProgressBarSize.Small:
      return styles.small
    case CircularProgressBarSize.Medium:
      return styles.medium
    case CircularProgressBarSize.Large:
      return styles.large
  }
}

export interface CircularProgressBarProps {
  progress: number
  kind?: CircularProgressBarKind
  size?: CircularProgressBarSize
  showPercentage?: boolean
}

const CircularProgressBar: FC<CircularProgressBarProps> = ({
  progress,
  kind = CircularProgressBarKind.Default,
  size = CircularProgressBarSize.Medium,
  showPercentage = true,
}) => {
  const deviceType = useDeviceSizeType()

  const diameter: number = useMemo(() => {
    if (deviceType === DeviceType.Mobile) {
      switch (size) {
        case CircularProgressBarSize.Small:
          return 40
        case CircularProgressBarSize.Medium:
          return 70
        case CircularProgressBarSize.Large:
          return 100
      }
    }
    if (deviceType === DeviceType.Tablet) {
      switch (size) {
        case CircularProgressBarSize.Small:
          return 50
        case CircularProgressBarSize.Medium:
          return 80
        case CircularProgressBarSize.Large:
          return 110
      }
    }
    if (deviceType === DeviceType.Desktop) {
      switch (size) {
        case CircularProgressBarSize.Small:
          return 60
        case CircularProgressBarSize.Medium:
          return 100
        case CircularProgressBarSize.Large:
          return 120
      }
    }
    return 0
  }, [size, deviceType])

  const strokeWidth: number = useMemo(() => {
    if (deviceType === DeviceType.Mobile) {
      switch (size) {
        case CircularProgressBarSize.Small:
          return 2
        case CircularProgressBarSize.Medium:
          return 6
        case CircularProgressBarSize.Large:
          return 10
      }
    }
    if (deviceType === DeviceType.Tablet) {
      switch (size) {
        case CircularProgressBarSize.Small:
          return 4
        case CircularProgressBarSize.Medium:
          return 8
        case CircularProgressBarSize.Large:
          return 12
      }
    }
    if (deviceType === DeviceType.Desktop) {
      switch (size) {
        case CircularProgressBarSize.Small:
          return 6
        case CircularProgressBarSize.Medium:
          return 10
        case CircularProgressBarSize.Large:
          return 14
      }
    }
    return 0
  }, [size, deviceType])

  const normalizedRadius = useMemo(
    () => (diameter - strokeWidth) / 2,
    [diameter, strokeWidth],
  )

  const strokeDasharray = useMemo(
    () => 2 * Math.PI * normalizedRadius,
    [normalizedRadius],
  )

  const strokeDashoffset = useMemo(
    () => strokeDasharray - (progress / 100) * strokeDasharray,
    [strokeDasharray, progress],
  )

  return (
    <svg
      className={classNames(
        styles.circularProgressBar,
        getCircularProgressBarKindClass(kind),
        getCircularProgressBarSizeClass(size),
      )}
      height={diameter}
      width={diameter}>
      {/* Background circle */}
      <circle
        className={styles.circleBackground}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={diameter / 2}
        cy={diameter / 2}
      />
      {/* Progress circle */}
      <circle
        className={styles.circleProgress}
        fill="transparent"
        strokeWidth={strokeWidth}
        style={{ strokeDasharray, strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={diameter / 2}
        cy={diameter / 2}
      />
      {/* Center text */}
      {showPercentage && (
        <text
          className={styles.progressText}
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle">
          {progress}%
        </text>
      )}
    </svg>
  )
}

export default CircularProgressBar
