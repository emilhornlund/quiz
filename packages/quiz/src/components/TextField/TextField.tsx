import {
  faCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './TextField.module.scss'

export interface TextFieldProps {
  id: string
  name?: string
  type: 'text' | 'number'
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
  onChange?: (value?: string | number) => void
  onValid?: (valid: boolean) => void
  onCheck?: (checked: boolean) => void
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  type,
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
  onChange,
  onValid,
  onCheck,
}) => {
  const [internalValue, setInternalValue] = useState<string | number>(
    value ?? '',
  )

  useEffect(() => {
    setInternalValue(value ?? '')
  }, [value])

  const [valid, setValid] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [hasFocus, setHasFocus] = useState<boolean>(false)
  const [lostFocus, setLostFocus] = useState<boolean>(false)

  useEffect(() => {
    let tmpValid = true
    let tmpErrorMessage: string | undefined
    if (type === 'number') {
      if (typeof internalValue !== 'number' || Number.isNaN(internalValue)) {
        tmpValid = false
        tmpErrorMessage = 'Is not a valid number'
      } else if (min !== undefined && internalValue < min) {
        tmpValid = false
        tmpErrorMessage = 'Cannot be less than ' + min
      } else if (max !== undefined && internalValue > max) {
        tmpValid = false
        tmpErrorMessage = 'Cannot be greater than ' + max
      }
    } else if (type === 'text') {
      if (typeof internalValue !== 'string') {
        tmpValid = false
      } else if (required && !internalValue) {
        tmpValid = false
        tmpErrorMessage =
          typeof required === 'string' ? required : 'This field is required'
      } else if (
        internalValue &&
        minLength &&
        internalValue.length < minLength
      ) {
        tmpValid = false
        tmpErrorMessage = 'Minimum length must be greater than ' + minLength
      } else if (
        internalValue &&
        maxLength &&
        internalValue.length > maxLength
      ) {
        tmpValid = false
        tmpErrorMessage = 'Maximum length must be less than ' + maxLength
      } else if (
        internalValue &&
        regex &&
        !(regex instanceof RegExp ? regex : regex.value).test(internalValue)
      ) {
        tmpValid = false
        tmpErrorMessage =
          regex instanceof RegExp
            ? "Can't contain illegal character"
            : regex.message
      }
    }
    onValid?.(tmpValid)
    setValid(tmpValid)
    setErrorMessage(tmpErrorMessage)
  }, [
    internalValue,
    type,
    min,
    max,
    minLength,
    maxLength,
    regex,
    required,
    onValid,
  ])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = event.target.value
    if (type === 'number') {
      const parsedValue = parseInt(newValue, 10)
      newValue = isNaN(parsedValue) ? '' : parsedValue
    }
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className={styles.inputContainer}>
      <div
        className={classNames(
          styles.textFieldInputContainer,
          size === 'small' ? styles.small : undefined,
          disabled ? styles.disabled : undefined,
          !valid && (lostFocus || hasFocus) ? styles.error : undefined,
        )}>
        <input
          id={id}
          name={name ?? id}
          type={type}
          value={internalValue}
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
      {!valid && (lostFocus || hasFocus) && (
        <div className={styles.errorContainer}>
          <FontAwesomeIcon icon={faTriangleExclamation} />{' '}
          {errorMessage ?? 'Unknown error'}
        </div>
      )}
    </div>
  )
}

export default TextField
