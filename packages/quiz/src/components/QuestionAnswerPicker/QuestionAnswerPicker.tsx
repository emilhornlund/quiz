import {
  GameEventQuestion,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import React, { FC, useEffect, useState } from 'react'

import { LoadingSpinner } from '../index.ts'

import AnswerInput from './components/AnswerInput'
import AnswerPicker from './components/AnswerPicker'
import AnswerRange from './components/AnswerRange'
import styles from './QuestionAnswerPicker.module.scss'

export interface QuestionAnswerPickerProps {
  question: GameEventQuestion
  interactive?: boolean
  onChange?: (request: SubmitQuestionAnswerRequestDto) => void
}

const QuestionAnswerPicker: FC<QuestionAnswerPickerProps> = ({
  question,
  interactive = true,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleSubmitQuestionAnswer = (
    request: SubmitQuestionAnswerRequestDto,
  ): void => {
    setIsLoading(true)
    onChange?.(request)
  }

  return (
    <div className={styles.main}>
      {isLoading && (
        <div className={styles.loadingWrapper}>
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && question.type === QuestionType.MultiChoice && (
        <AnswerPicker
          answers={question.answers.map(({ value }) => value)}
          interactive={interactive}
          onClick={(optionIndex) =>
            handleSubmitQuestionAnswer({
              type: QuestionType.MultiChoice,
              optionIndex,
            })
          }
        />
      )}
      {!isLoading && question.type === QuestionType.TrueFalse && (
        <AnswerPicker
          answers={['True', 'False']}
          interactive={interactive}
          onClick={(index) =>
            handleSubmitQuestionAnswer({
              type: QuestionType.TrueFalse,
              value: index === 0,
            })
          }
        />
      )}
      {!isLoading && question.type === QuestionType.Range && (
        <AnswerRange
          min={question.min}
          max={question.max}
          step={question.step}
          interactive={interactive}
          onSubmit={(value) =>
            handleSubmitQuestionAnswer({ type: QuestionType.Range, value })
          }
        />
      )}
      {!isLoading && question.type === QuestionType.TypeAnswer && (
        <AnswerInput
          interactive={interactive}
          onSubmit={(value) =>
            handleSubmitQuestionAnswer({ type: QuestionType.TypeAnswer, value })
          }
        />
      )}
    </div>
  )
}

export default QuestionAnswerPicker
