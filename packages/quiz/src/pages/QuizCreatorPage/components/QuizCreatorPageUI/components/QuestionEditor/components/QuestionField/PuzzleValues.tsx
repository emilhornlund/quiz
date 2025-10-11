import {
  QUIZ_PUZZLE_VALUE_REGEX,
  QUIZ_PUZZLE_VALUES_MAX,
  QUIZ_PUZZLE_VALUES_MIN,
} from '@quiz/common'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import { TextField } from '../../../../../../../../components'
import { classNames } from '../../../../../../../../utils/helpers.ts'

import styles from './QuestionField.module.scss'

export interface PuzzleValuesProps {
  value?: string[]
  onChange: (values?: string[]) => void
  onValid: (valid: boolean) => void
}

const PuzzleValues: FC<PuzzleValuesProps> = ({
  value: initialValues,
  onChange,
  onValid,
}) => {
  const [values, setValues] = useState<string[]>(() =>
    Array.from(
      { length: QUIZ_PUZZLE_VALUES_MAX },
      (_, i) => initialValues?.[i] ?? '',
    ),
  )

  useEffect(() => {
    setValues((prev) => prev.map((_, i) => initialValues?.[i] ?? ''))
  }, [initialValues])

  const isRequired = useCallback(
    (index: number): boolean => {
      const lastFilled = [...values].reverse().findIndex((v) => v.length > 0)
      const cutoff =
        lastFilled >= 0
          ? Math.max(values.length - lastFilled, QUIZ_PUZZLE_VALUES_MIN)
          : QUIZ_PUZZLE_VALUES_MIN
      return index < cutoff
    },
    [values],
  )

  const handleChange = useCallback(
    (updatedIndex: number, newValue?: string) => {
      setValues((prev) => {
        const next = [...prev]
        if (newValue !== undefined) next[updatedIndex] = newValue

        const lastFilled = [...next].reverse().findIndex((v) => v.length > 0)
        const cutoff =
          lastFilled >= 0
            ? Math.max(next.length - lastFilled, QUIZ_PUZZLE_VALUES_MIN)
            : QUIZ_PUZZLE_VALUES_MIN

        onChange(next.slice(0, cutoff))
        return next
      })
    },
    [onChange],
  )

  const [validValues, setValidValues] = useState<boolean[]>(
    Array(QUIZ_PUZZLE_VALUES_MAX).fill(false),
  )

  const handleValidChange = useCallback(
    (index: number, valid: boolean) => {
      if (validValues[index] !== valid) {
        setValidValues((prevValues) => {
          const newValues = [...prevValues]
          newValues[index] = valid
          return newValues
        })
      }
    },
    [validValues],
  )

  const wasAllValid = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    const allValid = validValues.every(Boolean)
    if (wasAllValid.current !== allValid) {
      wasAllValid.current = allValid
      onValid(allValid)
    }
  }, [validValues, onValid])

  return (
    <div className={classNames(styles.optionsContainer, styles.fullWidth)}>
      {values.map((value, index) => (
        <div key={`puzzle-value--${index}`} className={styles.option}>
          <div className={styles.content}>
            <TextField
              id={`puzzle-value--${index}-textfield`}
              type="text"
              placeholder={`Value ${index + 1}`}
              value={value}
              regex={QUIZ_PUZZLE_VALUE_REGEX}
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

export default PuzzleValues
