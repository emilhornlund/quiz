import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { classNames, isValidNumber } from '../../utils/helpers.ts'

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
  regex?: RegExp
  checked?: boolean
  required?: boolean
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
  const [hasFocus, setHasFocus] = useState<boolean>(false)

  useEffect(() => {
    let tmpValid = true
    if (type === 'number') {
      if (
        typeof internalValue !== 'number' ||
        !isValidNumber(internalValue, min, max)
      ) {
        tmpValid = false
      }
    } else if (type === 'text') {
      if (typeof internalValue !== 'string') {
        tmpValid = false
      } else if (required && !internalValue) {
        tmpValid = false
      } else if (internalValue && regex && !regex.test(internalValue)) {
        tmpValid = false
      }
    }
    onValid?.(tmpValid)
    setValid(tmpValid)
  }, [internalValue, type, min, max, regex, required, onValid])

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
    <div
      className={classNames(
        styles.textFieldInputContainer,
        size === 'small' ? styles.small : undefined,
        disabled ? styles.disabled : undefined,
        !valid && hasFocus ? styles.error : undefined,
      )}>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={internalValue}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={styles.textfield}
        onChange={handleChange}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
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
  )
}

export default TextField
