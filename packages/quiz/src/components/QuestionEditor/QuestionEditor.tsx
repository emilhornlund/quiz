import {
  GameMode,
  QuizClassicModeRequestDto,
  QuizZeroToOneHundredModeRequestDto,
} from '@quiz/common'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import Textarea from '../Textarea'

import { parseQuestionsJson } from './helpers'
import styles from './QuestionEditor.module.scss'

export type QuestionEditorProps = {
  onChange: (
    args:
      | {
          mode: GameMode.Classic
          questions: QuizClassicModeRequestDto['questions']
        }
      | {
          mode: GameMode.ZeroToOneHundred
          questions: QuizZeroToOneHundredModeRequestDto['questions']
        },
  ) => void
  onValid: (valid: boolean) => void
} & (
  | {
      mode: GameMode.Classic
      questions: QuizClassicModeRequestDto['questions']
    }
  | {
      mode: GameMode.ZeroToOneHundred
      questions: QuizZeroToOneHundredModeRequestDto['questions']
    }
)

const QuestionEditor: FC<QuestionEditorProps> = ({
  mode,
  questions,
  onChange,
  onValid,
}) => {
  const [questionsJson, setQuestionsJson] = useState(() =>
    JSON.stringify(questions, null, 2),
  )
  const [jsonError, setJsonError] = useState<string>()

  const lastPropJsonRef = useRef<string>(JSON.stringify(questions, null, 2))

  useEffect(() => {
    const newPropJson = JSON.stringify(questions, null, 2)

    if (newPropJson !== lastPropJsonRef.current) {
      lastPropJsonRef.current = newPropJson
      setQuestionsJson(newPropJson)

      try {
        parseQuestionsJson(questions, mode)
        setJsonError(undefined)
        onValid(true)
      } catch (err) {
        setJsonError((err as Error).message)
        onValid(false)
      }
    }
  }, [mode, questions, onValid])

  const handleChange = useCallback(
    (newValue: string) => {
      setQuestionsJson(newValue)
      setJsonError(undefined)

      try {
        const parsed = JSON.parse(newValue)

        onChange(
          mode === GameMode.Classic
            ? {
                mode: GameMode.Classic,
                questions: parseQuestionsJson(parsed, GameMode.Classic),
              }
            : {
                mode: GameMode.ZeroToOneHundred,
                questions: parseQuestionsJson(
                  parsed,
                  GameMode.ZeroToOneHundred,
                ),
              },
        )
        onValid(true)
      } catch (err) {
        setJsonError((err as Error).message)
        onValid(false)
      }
    },
    [mode, onChange, onValid],
  )

  return (
    <div className={styles.questionEditor}>
      <Textarea
        id="quiz-question-editor-textarea"
        type="code"
        placeholder="Questions"
        value={questionsJson}
        onChange={handleChange}
        onAdditionalValidation={() => jsonError || true}
        forceValidate
      />
    </div>
  )
}

export default QuestionEditor
