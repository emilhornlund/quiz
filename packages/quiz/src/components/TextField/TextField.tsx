import {
  faCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { classNames } from '../../utils/helpers.ts'
import { DeviceType, useDeviceSizeType } from '../../utils/useDeviceSizeType'
import {
  isCallbackValid,
  isValidNumber,
  isValidString,
} from '../../utils/validation.ts'

import styles from './TextField.module.scss'

export interface TextFieldProps {
  id: string
  name?: string
  type: 'text' | 'number' | 'password'
  kind?: 'primary' | 'secondary'
  size?: 'normal' | 'small'
  placeholder?: string
  value?: string | number
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  regex?: RegExp | { value: RegExp; message: string }
  checked?: boolean
  required?: boolean | string
  disabled?: boolean
  readOnly?: boolean
  showErrorMessage?: boolean
  forceValidate?: boolean
  onChange?: (value?: string | number) => void
  onValid?: (valid: boolean) => void
  onAdditionalValidation?: (value: string | number) => boolean | string
  onCheck?: (checked: boolean) => void
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  type,
  kind = 'primary',
  size = 'normal',
  placeholder,
  value,
  min,
  max,
  minLength,
  maxLength,
  regex,
  checked,
  required,
  disabled,
  readOnly,
  showErrorMessage = true,
  forceValidate = false,
  onChange,
  onValid,
  onAdditionalValidation,
  onCheck,
}) => {
  const [internalValue, setInternalValue] = useState<string | number>()

  useEffect(() => {
    setInternalValue(value ?? '')
  }, [value])

  const [hasFocus, setHasFocus] = useState<boolean>(false)
  const [lostFocus, setLostFocus] = useState<boolean>(false)

  const [valid, errorMessage] = useMemo<[boolean, string | undefined]>(() => {
    let tmpValid = true
    let tmpErrorMessage: string | undefined

    if (type === 'text' || type === 'password') {
      ;[tmpValid, tmpErrorMessage] = isValidString({
        value: internalValue as string,
        disabled,
        required,
        minLength,
        maxLength,
        regex,
      })
    }

    if (type === 'number') {
      ;[tmpValid, tmpErrorMessage] = isValidNumber({
        value: internalValue as number,
        disabled,
        required,
        min,
        max,
      })
    }

    if (tmpValid) {
      ;[tmpValid, tmpErrorMessage] = isCallbackValid(
        internalValue,
        onAdditionalValidation,
      )
    }

    return [tmpValid, tmpErrorMessage]
  }, [
    type,
    internalValue,
    disabled,
    required,
    min,
    max,
    minLength,
    maxLength,
    regex,
    onAdditionalValidation,
  ])

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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number | undefined = event.target.value
    if (type === 'number') {
      const parsedValue = parseInt(newValue, 10)
      newValue = isNaN(parsedValue) ? undefined : parsedValue
    }
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
          styles.textFieldInputContainer,
          kind === 'primary' ? styles.textFieldInputKindPrimary : undefined,
          kind === 'secondary' ? styles.textFieldInputKindSecondary : undefined,
          deviceSize === 'small' ? styles.small : undefined,
          disabled ? styles.disabled : undefined,
          showError ? styles.error : undefined,
        )}>
        <input
          id={id}
          name={name ?? id}
          type={type}
          value={internalValue ?? ''}
          min={min}
          max={max}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={styles.textfield}
          onChange={handleChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => {
            setHasFocus(false)
            setLostFocus(true)
          }}
          data-testid={`test-${id}-textfield`}
        />
        {checked !== undefined && (
          <label htmlFor={`${id}-checkbox`} className={styles.checkboxLabel}>
            <input
              id={`${id}-checkbox`}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className={styles.checkbox}
              onChange={(event) => onCheck?.(event.target.checked)}
            />
            {checked && (
              <span className={styles.checkboxIcon}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
            )}
          </label>
        )}
      </div>
      {showError && showErrorMessage && (
        <div className={styles.errorContainer}>
          <FontAwesomeIcon icon={faTriangleExclamation} />{' '}
          {errorMessage ?? 'Unknown error'}
        </div>
      )}
    </div>
  )
}

export default TextField
