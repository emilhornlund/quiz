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
  kind?:
    | 'primary'
    | 'secondary'
    | 'call-to-action'
    | 'success'
    | 'destructive'
    | 'plain'
  variant?: 'default' | 'modern'
  size?: 'normal' | 'small'
  value?: React.ReactNode | string | undefined
  hideValue?: 'mobile' | 'never'
  disabled?: boolean
  loading?: boolean
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
  variant = 'default',
  size = 'normal',
  value,
  hideValue = 'never',
  disabled,
  loading,
  icon,
  iconPosition = 'leading',
  iconColor,
  onClick,
  children,
}) => {
  const deviceType = useDeviceSizeType()

  const showValue = useMemo(() => {
    if (hideValue === 'mobile' && deviceType === DeviceType.Mobile) {
      return false
    }
    return !!value || !!children
  }, [value, children, deviceType, hideValue])

  const deviceSize = useMemo(
    () => (deviceType === DeviceType.Mobile ? 'small' : size),
    [size, deviceType],
  )

  return (
    <div
      className={classNames(
        styles.buttonInputContainer,
        kind === 'primary' ? styles.buttonInputKindPrimary : undefined,
        kind === 'secondary' ? styles.buttonInputKindSecondary : undefined,
        kind === 'call-to-action'
          ? styles.buttonInputKindCallToAction
          : undefined,
        kind === 'success' ? styles.buttonInputKindSuccess : undefined,
        kind === 'destructive' ? styles.buttonInputKindDestructive : undefined,
        kind === 'plain' ? styles.buttonInputKindPlain : undefined,
        variant === 'modern' ? styles.buttonInputVariantModern : undefined,
        deviceSize === 'small' ? styles.buttonInputSizeSmall : undefined,
      )}>
      <button
        id={id}
        name={name ?? id}
        type={type}
        disabled={loading || disabled}
        onClick={onClick}
        data-testid={`test-${id}-button`}>
        {loading ? (
          <div className={styles.loadingSpinner}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <>
            {icon && iconPosition === 'leading' && (
              <FontAwesomeIcon icon={icon} color={iconColor} />
            )}
            {showValue && <span>{children || value}</span>}
            {icon && iconPosition === 'trailing' && (
              <FontAwesomeIcon icon={icon} color={iconColor} />
            )}
          </>
        )}
      </button>
    </div>
  )
}

export default Button
