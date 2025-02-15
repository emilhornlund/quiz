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

export interface TrueFalseOptionsProps {
  value?: boolean
  onChange: (value?: boolean) => void
  onValid: (valid: boolean) => void
}

const TrueFalseOptions: FC<TrueFalseOptionsProps> = ({
  value,
  onChange,
  onValid,
}) => {
  const options = useMemo<{ value: string; correct: boolean }[]>(
    () => [
      {
        value: 'True',
        correct: value === true,
      },
      {
        value: 'False',
        correct: value === false,
      },
    ],
    [value],
  )

  const handleChange = useCallback(
    (updatedIndex: number, checked: boolean) => {
      if (updatedIndex === 0) {
        onChange(checked ? true : undefined)
      } else {
        onChange(checked ? false : undefined)
      }
    },
    [onChange],
  )

  const handleAdditionalValidation = useCallback((): boolean | string => {
    const someCorrect = options.some((option) => option.correct)
    if (!someCorrect) {
      return 'At least one option must be marked correct'
    }
    return true
  }, [options])

  const [validOptions, setValidOptions] = useState<boolean[]>([false, false])

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
        <div key={`true-false-option-${index}`} className={styles.option}>
          <TextField
            id={`true-false-option-${index}-textfield`}
            type="text"
            value={option.value}
            checked={option.correct}
            onCheck={(checked) => handleChange(index, checked)}
            onValid={(newValid) => handleValidChange(index, newValid)}
            onAdditionalValidation={() => handleAdditionalValidation()}
            forceValidate
            readOnly
          />
        </div>
      ))}
    </div>
  )
}

export default TrueFalseOptions
