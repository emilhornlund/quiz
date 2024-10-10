import { GameEventQuestion, GameEventQuestionType } from '@quiz/common'
import React, { FC } from 'react'

import AnswerInput from './components/AnswerInput'
import AnswerPicker from './components/AnswerPicker/AnswerPicker.tsx'
import AnswerSlider from './components/AnswerSlider'
import styles from './QuestionAnswerPicker.module.scss'

export type Answer =
  | { type: GameEventQuestionType.Multi; index: number }
  | { type: GameEventQuestionType.TrueFalse; value: boolean }
  | { type: GameEventQuestionType.Slider; value: number }
  | { type: GameEventQuestionType.TypeAnswer; value: string }

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
      {question.type === GameEventQuestionType.Multi && (
        <AnswerPicker
          answers={question.answers.map(({ value }) => value)}
          interactive={interactive}
          onClick={(index) =>
            onChange?.({
              type: GameEventQuestionType.Multi,
              index,
            })
          }
        />
      )}
      {question.type === GameEventQuestionType.TrueFalse && (
        <AnswerPicker
          answers={['True', 'False']}
          interactive={interactive}
          onClick={(index) =>
            onChange?.({
              type: GameEventQuestionType.TrueFalse,
              value: index === 0,
            })
          }
        />
      )}
      {question.type === GameEventQuestionType.Slider && (
        <AnswerSlider
          min={question.min}
          max={question.max}
          step={question.step}
          interactive={interactive}
          onSubmit={(value) =>
            onChange?.({ type: GameEventQuestionType.Slider, value })
          }
        />
      )}
      {question.type === GameEventQuestionType.TypeAnswer && (
        <AnswerInput
          interactive={interactive}
          onSubmit={(value) =>
            onChange?.({ type: GameEventQuestionType.TypeAnswer, value })
          }
        />
      )}
    </div>
  )
}

export default QuestionAnswerPicker
