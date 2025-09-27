import {
  faChevronDown,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { classNames } from '../../utils/helpers.ts'
import { DeviceType, useDeviceSizeType } from '../../utils/useDeviceSizeType'
import { isCallbackValid } from '../../utils/validation.ts'

import styles from './Select.module.scss'

export interface SelectProps {
  id: string
  name?: string
  kind?: 'primary' | 'secondary'
  size?: 'normal' | 'small'
  value?: string | undefined
  values?: { key: string; value: string; valueLabel: string }[]
  required?: boolean | string
  disabled?: boolean
  forceValidate?: boolean
  onChange?: (value: string) => void
  onValid?: (valid: boolean) => void
  onAdditionalValidation?: (value: string) => boolean | string
}

const Select: FC<SelectProps> = ({
  id,
  name = id,
  kind = 'primary',
  size = 'normal',
  value,
  values,
  required,
  disabled = false,
  forceValidate = false,
  onChange,
  onValid,
  onAdditionalValidation,
}) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const [hasFocus, setHasFocus] = useState<boolean>(false)
  const [lostFocus, setLostFocus] = useState<boolean>(false)

  const [valid, errorMessage] = useMemo<[boolean, string | undefined]>(() => {
    let tmpValid = true
    let tmpErrorMessage: string | undefined

    if (!disabled) {
      if (required && (!internalValue || !internalValue.length)) {
        tmpValid = false
        tmpErrorMessage =
          typeof required === 'string' ? required : 'This field is required'
      }
    }

    if (tmpValid) {
      ;[tmpValid, tmpErrorMessage] = isCallbackValid(
        internalValue,
        onAdditionalValidation,
      )
    }

    return [tmpValid, tmpErrorMessage]
  }, [internalValue, disabled, required, onAdditionalValidation])

  const prevValid = useRef<boolean | undefined>(undefined)

  const handleValidChange = useCallback(() => {
    if (prevValid.current !== valid) {
      prevValid.current = valid
      onValid?.(valid)
    }
  }, [valid, onValid])

  useEffect(() => {
    handleValidChange()
  }, [handleValidChange])

  const showError = useMemo(
    () => !valid && (lostFocus || hasFocus || forceValidate),
    [valid, lostFocus, hasFocus, forceValidate],
  )

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const deviceType = useDeviceSizeType()

  const deviceSize = useMemo(
    () => (deviceType === DeviceType.Mobile ? 'small' : size),
    [size, deviceType],
  )

  return (
    <div className={styles.inputContainer}>
      <div
        className={classNames(
          styles.selectInputContainer,
          kind === 'primary' ? styles.selectInputKindPrimary : undefined,
          kind === 'secondary' ? styles.selectInputKindSecondary : undefined,
          deviceSize === 'small' ? styles.selectInputSizeSmall : undefined,
        )}>
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => {
            setHasFocus(false)
            setLostFocus(true)
          }}
          data-testid={`test-${id}-select`}>
          {values?.map(({ key, value, valueLabel }) => (
            <option key={key} value={value}>
              {valueLabel}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          color="black"
          className={styles.selectIcon}
        />
      </div>
      {showError && (
        <div className={styles.errorContainer}>
          <FontAwesomeIcon icon={faTriangleExclamation} />{' '}
          {errorMessage ?? 'Unknown error'}
        </div>
      )}
    </div>
  )
}

export default Select
