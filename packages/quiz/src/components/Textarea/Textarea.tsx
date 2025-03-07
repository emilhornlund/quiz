import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react'

import { classNames } from '../../utils/helpers.ts'
import { isCallbackValid, isValidString } from '../../utils/validation.ts'

import styles from './Textarea.module.scss'

export interface TextareaProps {
  id: string
  name?: string
  type?: 'text' | 'code'
  kind?: 'primary' | 'secondary'
  value?: string
  placeholder?: string
  regex?: RegExp | { value: RegExp; message: string }
  required?: boolean | string
  minLength?: number
  maxLength?: number
  disabled?: boolean
  forceValidate?: boolean
  onChange?: (value: string) => void
  onValid?: (valid: boolean) => void
  onAdditionalValidation?: (value: string) => boolean | string
}

const Textarea: FC<TextareaProps> = ({
  id,
  name = id,
  type = 'text',
  kind = 'primary',
  value,
  placeholder,
  regex,
  required,
  minLength,
  maxLength,
  disabled = false,
  forceValidate = false,
  onChange,
  onValid,
  onAdditionalValidation,
}) => {
  const [internalValue, setInternalValue] = useState<string>(value ?? '')

  useEffect(() => {
    setInternalValue(value ?? '')
  }, [value])

  const [hasFocus, setHasFocus] = useState<boolean>(false)
  const [lostFocus, setLostFocus] = useState<boolean>(false)

  const [valid, errorMessage] = useMemo<[boolean, string | undefined]>(() => {
    let [tmpValid, tmpErrorMessage] = isValidString({
      value: internalValue,
      disabled,
      required,
      minLength,
      maxLength,
      regex,
    })

    if (tmpValid) {
      ;[tmpValid, tmpErrorMessage] = isCallbackValid(
        internalValue,
        onAdditionalValidation,
      )
    }

    return [tmpValid, tmpErrorMessage]
  }, [
    internalValue,
    disabled,
    required,
    minLength,
    maxLength,
    regex,
    onAdditionalValidation,
  ])

  useEffect(() => {
    onValid?.(valid)
  }, [valid, onValid])

  const showError = useMemo(
    () => !valid && (lostFocus || hasFocus || forceValidate),
    [valid, lostFocus, hasFocus, forceValidate],
  )

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className={styles.inputContainer}>
      <div
        className={classNames(
          styles.textareaInputContainer,
          showError ? styles.error : undefined,
          type === 'code' ? styles.code : undefined,
          kind === 'primary' ? styles.textareaInputKindPrimary : undefined,
          kind === 'secondary' ? styles.textareaInputKindSecondary : undefined,
        )}>
        <textarea
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => {
            setHasFocus(false)
            setLostFocus(true)
          }}
          data-testid={`test-${id}-textarea`}
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

export default Textarea
