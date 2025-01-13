import {
  GameMode,
  QuizClassicModeRequestDto,
  QuizZeroToOneHundredModeRequestDto,
} from '@quiz/common'
import React, { FC, useCallback, useEffect, useState } from 'react'

import Textarea from '../Textarea'

import { parseQuestionsJson, QuestionsForMode } from './helpers.ts'
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
  const [questionsJson, setQuestionsJson] = useState<string>('[]')
  const [jsonError, setJsonError] = useState<string>()

  const handleParseQuestionJson = useCallback(
    (value: string, mode: GameMode) => {
      setQuestionsJson(value)
      setJsonError(undefined)

      /* eslint-disable-next-line */
    let parsedJson: any
      let jsonValid = true
      try {
        parsedJson = JSON.parse(value)
      } catch (error) {
        jsonValid = false
        setJsonError((error as Error).message)
      }

      if (jsonValid) {
        if (mode === GameMode.Classic) {
          let parsedQuestions: QuestionsForMode<GameMode.Classic> = []
          try {
            parsedQuestions = parseQuestionsJson(parsedJson, mode)
          } catch (error) {
            jsonValid = false
            setJsonError((error as Error).message)
            onValid(false)
          }
          if (parsedQuestions && jsonValid) {
            onValid(true)
            onChange({ mode, questions: parsedQuestions })
          }
        }
        if (mode === GameMode.ZeroToOneHundred) {
          let parsedQuestions: QuestionsForMode<GameMode.ZeroToOneHundred> = []
          try {
            parsedQuestions = parseQuestionsJson(parsedJson, mode)
          } catch (error) {
            jsonValid = false
            setJsonError((error as Error).message)
            onValid(false)
          }
          if (parsedQuestions && jsonValid) {
            onValid(true)
            onChange({ mode, questions: parsedQuestions })
          }
        }
      }
    },
    [onChange, onValid],
  )

  const handleChangeJSON = useCallback(
    (value: string) => {
      handleParseQuestionJson(value, mode)
    },
    [mode, handleParseQuestionJson],
  )

  useEffect(() => {
    const newQuestionsJson = JSON.stringify(questions, null, 2)
    if (newQuestionsJson !== questionsJson && !jsonError) {
      handleParseQuestionJson(newQuestionsJson, mode)
    }
  }, [mode, questions, questionsJson, jsonError, handleParseQuestionJson])

  return (
    <div className={styles.questionEditor}>
      <Textarea
        id="quiz-question-editor-textarea"
        type="code"
        placeholder="Questions"
        value={questionsJson}
        onChange={handleChangeJSON}
        onAdditionalValidation={() => jsonError || true}
        forceValidate
      />
    </div>
  )
}

export default QuestionEditor
