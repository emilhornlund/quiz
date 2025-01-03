import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useMemo } from 'react'

import { classNames } from '../../utils/helpers'
import { DeviceType, useDeviceSizeType } from '../../utils/use-device-size.tsx'

import styles from './Button.module.scss'

export interface ButtonProps {
  id: string
  name?: string
  type: 'submit' | 'reset' | 'button'
  kind?: 'primary' | 'secondary' | 'call-to-action' | 'plain' | 'destructive'
  size?: 'normal' | 'small'
  value?: React.ReactNode | string | undefined
  hideValue?: 'mobile' | 'never'
  disabled?: boolean
  icon?: IconDefinition
  iconPosition?: 'leading' | 'trailing'
  iconColor?: string
  onClick?: () => void
  children?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  id,
  name,
  type,
  kind = 'primary',
  size = 'normal',
  value,
  hideValue = 'never',
  disabled,
  icon,
  iconPosition = 'leading',
  iconColor,
  onClick,
}) => {
  const deviceType = useDeviceSizeType()

  const showValue = useMemo(() => {
    if (hideValue === 'mobile' && deviceType === DeviceType.Mobile) {
      return false
    }
    return !!value
  }, [value, deviceType, hideValue])

  return (
    <div
      className={classNames(
        styles.main,
        size === 'small' ? styles.small : undefined,
      )}>
      <button
        id={id}
        name={name ?? id}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={classNames(
          kind === 'primary' ? styles.primary : undefined,
          kind === 'secondary' ? styles.secondary : undefined,
          kind === 'call-to-action' ? styles.callToAction : undefined,
          kind === 'plain' ? styles.plain : undefined,
          kind === 'destructive' ? styles.destructive : undefined,
        )}
        data-testid={`test-${id}-button`}>
        {icon && iconPosition === 'leading' && (
          <FontAwesomeIcon icon={icon} color={iconColor} />
        )}
        {showValue && <span>{value}</span>}
        {icon && iconPosition === 'trailing' && (
          <FontAwesomeIcon icon={icon} color={iconColor} />
        )}
      </button>
    </div>
  )
}

export default Button
