import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX,
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
  const options = useMemo<string[]>(
    () =>
      Array.from(Array(QUIZ_TYPE_ANSWER_OPTIONS_MAX).keys()).map(
        (index) => values?.[index] || '',
      ),
    [values],
  )

  const isRequired = useCallback(
    (index: number): boolean => (values?.length || 1) > index,
    [values],
  )

  const handleChange = useCallback(
    (updatedIndex: number, newValue?: string) => {
      let newValues = [...options]

      if (newValue !== undefined) {
        newValues[updatedIndex] = newValue
      }

      const reversedIndexToRemove = [...newValues]
        .reverse()
        .findIndex((option) => option.length)

      const indexToRemove =
        reversedIndexToRemove >= 0
          ? Math.max(options.length - reversedIndexToRemove, 1)
          : 1

      if (indexToRemove < options.length) {
        newValues = newValues.slice(0, indexToRemove)
      }

      onChange(newValues)
    },
    [options, onChange],
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
    const isValid = validOptions.every((valid) => valid)
    if (previousValid.current !== isValid) {
      previousValid.current = isValid
      onValid(isValid)
    }
  }, [validOptions, onValid])

  return (
    <div className={styles.optionsContainer}>
      {options.map((option, index) => (
        <div key={`type-answer-option-${index}`} className={styles.option}>
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
      ))}
    </div>
  )
}

export default TypeAnswerOptions
