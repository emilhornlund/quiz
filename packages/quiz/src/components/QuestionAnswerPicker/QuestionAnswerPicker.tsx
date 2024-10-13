import { GameEventQuestion, QuestionType } from '@quiz/common'
import React, { FC } from 'react'

import AnswerInput from './components/AnswerInput'
import AnswerPicker from './components/AnswerPicker/AnswerPicker.tsx'
import AnswerSlider from './components/AnswerSlider'
import styles from './QuestionAnswerPicker.module.scss'

export type Answer =
  | { type: QuestionType.Multi; index: number }
  | { type: QuestionType.TrueFalse; value: boolean }
  | { type: QuestionType.Slider; value: number }
  | { type: QuestionType.TypeAnswer; value: string }

export interface QuestionAnswerPickerProps {
  question: GameEventQuestion
  interactive?: boolean
  onChange?: (answer: Answer) => void
}

const QuestionAnswerPicker: FC<QuestionAnswerPickerProps> = ({
  question,
  interactive = true,
  onChange,
}) => {
  return (
    <div className={styles.main}>
      {question.type === QuestionType.Multi && (
        <AnswerPicker
          answers={question.answers.map(({ value }) => value)}
          interactive={interactive}
          onClick={(index) =>
            onChange?.({
              type: QuestionType.Multi,
              index,
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
      {question.type === QuestionType.Slider && (
        <AnswerSlider
          min={question.min}
          max={question.max}
          step={question.step}
          interactive={interactive}
          onSubmit={(value) => onChange?.({ type: QuestionType.Slider, value })}
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
