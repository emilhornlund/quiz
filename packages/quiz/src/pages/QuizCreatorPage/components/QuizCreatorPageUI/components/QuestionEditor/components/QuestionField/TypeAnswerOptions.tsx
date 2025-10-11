import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
} from '@quiz/common'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import { TextField } from '../../../../../../../../components'

import styles from './QuestionField.module.scss'

export interface TypeAnswerOptionsProps {
  values?: string[]
  onChange: (values?: string[]) => void
  onValid: (valid: boolean) => void
}

const TypeAnswerOptions: FC<TypeAnswerOptionsProps> = ({
  values,
  onChange,
  onValid,
}) => {
  const [options, setOptions] = useState<string[]>(() =>
    Array.from(
      { length: QUIZ_TYPE_ANSWER_OPTIONS_MAX },
      (_, i) => values?.[i] ?? '',
    ),
  )

  useEffect(() => {
    setOptions((prev) => prev.map((_, i) => values?.[i] ?? ''))
  }, [values])

  const isRequired = useCallback(
    (index: number): boolean => {
      const lastFilled = [...options].reverse().findIndex((v) => v.length > 0)
      const cutoff =
        lastFilled >= 0
          ? Math.max(options.length - lastFilled, QUIZ_TYPE_ANSWER_OPTIONS_MIN)
          : QUIZ_TYPE_ANSWER_OPTIONS_MIN
      return index < cutoff
    },
    [options],
  )

  const handleChange = useCallback(
    (updatedIndex: number, newValue?: string) => {
      setOptions((prev) => {
        const next = [...prev]
        if (newValue !== undefined) next[updatedIndex] = newValue

        // compute trimmed length to emit
        const lastFilled = [...next].reverse().findIndex((v) => v.length > 0)
        const cutoff =
          lastFilled >= 0
            ? Math.max(next.length - lastFilled, QUIZ_TYPE_ANSWER_OPTIONS_MIN)
            : QUIZ_TYPE_ANSWER_OPTIONS_MIN

        onChange(next.slice(0, cutoff))
        return next
      })
    },
    [onChange],
  )

  const [validOptions, setValidOptions] = useState<boolean[]>(
    Array(QUIZ_TYPE_ANSWER_OPTIONS_MAX).fill(false),
  )

  const handleValidChange = useCallback(
    (index: number, valid: boolean) => {
      if (validOptions[index] !== valid) {
        setValidOptions((prevOptions) => {
          const newOptions = [...prevOptions]
          newOptions[index] = valid
          return newOptions
        })
      }
    },
    [validOptions],
  )

  const previousValid = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    const allValid = validOptions.every(Boolean)
    if (previousValid.current !== allValid) {
      previousValid.current = allValid
      onValid(allValid)
    }
  }, [validOptions, onValid])

  return (
    <div className={styles.optionsContainer}>
      {options.map((option, index) => (
        <div key={`type-answer-option-${index}`} className={styles.option}>
          <div className={styles.content}>
            <TextField
              id={`type-answer-option-${index}-textfield`}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              regex={QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX}
              onChange={(newValue) => handleChange(index, newValue as string)}
              onValid={(newValid) => handleValidChange(index, newValid)}
              required={isRequired(index)}
              forceValidate
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TypeAnswerOptions
