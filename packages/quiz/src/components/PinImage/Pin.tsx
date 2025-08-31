import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC } from 'react'

import { getPinColorColor } from './pin-utils.ts'
import styles from './PinImage.module.scss'
import { PinColor } from './types.ts'

interface PinProps {
  width: number
  height: number
  x: number
  y: number
  toleranceDiameterPx?: number
  color?: PinColor
  disabled?: boolean
}

const Pin: FC<PinProps> = ({
  width,
  height,
  x,
  y,
  toleranceDiameterPx = 0,
  color = PinColor.Blue,
  disabled,
}) => (
  <div
    className={styles.pin}
    style={{
      width,
      height,
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      ...(disabled ? { cursor: 'default' } : {}),
    }}>
    {toleranceDiameterPx > 0 && (
      <div
        className={styles.tolerance}
        style={{
          width: `${toleranceDiameterPx}px`,
          height: `${toleranceDiameterPx}px`,
        }}
      />
    )}
    <div className={styles.dot}>
      <FontAwesomeIcon icon={faLocationDot} color={getPinColorColor(color)} />
    </div>
  </div>
)

export default Pin
