import {
  GameEventQuestion,
  QuestionType,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import React, { FC } from 'react'

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
  return (
    <div className={styles.main}>
      {question.type === QuestionType.MultiChoice && (
        <AnswerPicker
          answers={question.answers.map(({ value }) => value)}
          interactive={interactive}
          onClick={(optionIndex) =>
            onChange?.({
              type: QuestionType.MultiChoice,
              optionIndex,
            })
          }
        />
      )}
      {question.type === QuestionType.TrueFalse && (
        <AnswerPicker
          answers={['True', 'False']}
          interactive={interactive}
          onClick={(index) =>
            onChange?.({
              type: QuestionType.TrueFalse,
              value: index === 0,
            })
          }
        />
      )}
      {question.type === QuestionType.Range && (
        <AnswerRange
          min={question.min}
          max={question.max}
          step={question.step}
          interactive={interactive}
          onSubmit={(value) => onChange?.({ type: QuestionType.Range, value })}
        />
      )}
      {question.type === QuestionType.TypeAnswer && (
        <AnswerInput
          interactive={interactive}
          onSubmit={(value) =>
            onChange?.({ type: QuestionType.TypeAnswer, value })
          }
        />
      )}
    </div>
  )
}

export default QuestionAnswerPicker
