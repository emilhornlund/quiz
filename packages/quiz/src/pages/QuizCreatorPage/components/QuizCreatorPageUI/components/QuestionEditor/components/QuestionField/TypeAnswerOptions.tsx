import {
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
} from '@quiz/common'
import React, { FC, useCallback, useEffect, useState } from 'react'

import { TextField } from '../../../../../../../../components'
import { QuizQuestionValidationResult } from '../../../../../../utils/QuestionDataSource'
import { getValidationErrorMessage } from '../../../../../../validation-rules'

import styles from './QuestionField.module.scss'

export interface TypeAnswerOptionsProps {
  values?: string[]
  validation: QuizQuestionValidationResult
  onChange: (values?: string[]) => void
}

const TypeAnswerOptions: FC<TypeAnswerOptionsProps> = ({
  values,
  validation,
  onChange,
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
              customErrorMessage={
                getValidationErrorMessage(validation, `options[${index}]`) ||
                getValidationErrorMessage(validation, 'options')
              }
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
