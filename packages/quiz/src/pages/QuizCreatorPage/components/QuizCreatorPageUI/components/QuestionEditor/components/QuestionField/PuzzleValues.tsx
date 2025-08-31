import {
  QUIZ_PUZZLE_VALUE_REGEX,
  QUIZ_PUZZLE_VALUES_MAX,
  QUIZ_PUZZLE_VALUES_MIN,
} from '@quiz/common'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  const values = useMemo<string[]>(
    () =>
      Array.from(Array(QUIZ_PUZZLE_VALUES_MAX).keys()).map(
        (index) => initialValues?.[index] || '',
      ),
    [initialValues],
  )

  const isRequired = useCallback(
    (index: number): boolean =>
      (initialValues?.length || QUIZ_PUZZLE_VALUES_MIN) > index,
    [initialValues],
  )

  const handleChange = useCallback(
    (updatedIndex: number, newValue?: string) => {
      let newValues = [...values]

      if (newValue !== undefined) {
        newValues[updatedIndex] = newValue
      }

      const reversedIndexToRemove = [...newValues]
        .reverse()
        .findIndex((value) => value.length)

      const indexToRemove =
        reversedIndexToRemove >= 0
          ? Math.max(
              values.length - reversedIndexToRemove,
              QUIZ_PUZZLE_VALUES_MIN,
            )
          : QUIZ_PUZZLE_VALUES_MIN

      if (indexToRemove < values.length) {
        newValues = newValues.slice(0, indexToRemove)
      }

      onChange(newValues)
    },
    [values, onChange],
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

  const previousValid = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    const isValid = validValues.every((valid) => valid)
    if (previousValid.current !== isValid) {
      previousValid.current = isValid
      onValid(isValid)
    }
  }, [validValues, onValid])

  return (
    <div className={styles.optionsContainer}>
      {values.map((value, index) => (
        <div
          key={`puzzle-value--${index}`}
          className={classNames(styles.option, styles.fullWidth)}>
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
      ))}
    </div>
  )
}

export default PuzzleValues
