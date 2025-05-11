import {
  QuestionMultiChoiceOptionDto,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
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

export interface MultiChoiceOptionsProps {
  values?: QuestionMultiChoiceOptionDto[]
  onChange: (value: QuestionMultiChoiceOptionDto[]) => void
  onValid: (valid: boolean) => void
}

const MultiChoiceOptions: FC<MultiChoiceOptionsProps> = ({
  values,
  onChange,
  onValid,
}) => {
  const options = useMemo<QuestionMultiChoiceOptionDto[]>(
    () =>
      Array.from(Array(QUIZ_MULTI_CHOICE_OPTIONS_MAX).keys()).map((index) => ({
        value: values?.[index]?.value || '',
        correct: !!values?.[index]?.correct,
      })),
    [values],
  )

  const isRequired = useCallback(
    (index: number): boolean => (values?.length || 2) > index,
    [values],
  )

  const handleAdditionalValidation = useCallback(
    (index: number): boolean | string => {
      const someCorrect = values?.some((option) => option.correct)
      if (isRequired(index) && !someCorrect) {
        return 'At least one option must be marked correct'
      }
      return true
    },
    [values, isRequired],
  )

  const handleChange = useCallback(
    (updatedIndex: number, newValue?: string, newCorrect?: boolean) => {
      let newValues = [...options]

      if (newValue !== undefined) {
        newValues[updatedIndex].value = newValue
      }
      if (newCorrect !== undefined) {
        newValues[updatedIndex].correct = newCorrect
      }

      const reversedIndexToRemove = [...newValues]
        .reverse()
        .findIndex((option) => option.value.length || option.correct)

      const indexToRemove =
        reversedIndexToRemove >= 0
          ? Math.max(options.length - reversedIndexToRemove, 2)
          : 2

      if (indexToRemove < options.length) {
        newValues = newValues.slice(0, indexToRemove)
      }

      onChange(newValues)
    },
    [options, onChange],
  )

  const [validOptions, setValidOptions] = useState<boolean[]>(
    Array(QUIZ_MULTI_CHOICE_OPTIONS_MAX).fill(false),
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

  const previousValid = useRef<boolean>()

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
        <div key={`multi-choice-option-${index}`} className={styles.option}>
          <TextField
            id={`multi-choice-option-${index}-textfield`}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option.value}
            checked={option.correct}
            regex={QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX}
            onChange={(newValue) =>
              handleChange(index, newValue as string, undefined)
            }
            onCheck={(newChecked) => handleChange(index, undefined, newChecked)}
            onValid={(newValid) => handleValidChange(index, newValid)}
            onAdditionalValidation={() => handleAdditionalValidation(index)}
            required={isRequired(index)}
            forceValidate
          />
        </div>
      ))}
    </div>
  )
}

export default MultiChoiceOptions
