import { GameMode } from '@quiz/common'
import React, { FC, useEffect, useRef, useState } from 'react'

import Textarea from '../../../../../../components/Textarea'
import { QuestionData } from '../../../../utils/QuestionDataSource/question-data-source.types.ts'

import styles from './AdvancedQuestionEditor.module.scss'
import { parseQuestionsJson } from './utils'

export interface AdvancedQuestionEditorProps {
  gameMode: GameMode
  questions: QuestionData[]
  onChange: (questions: QuestionData[]) => void
}

const AdvancedQuestionEditor: FC<AdvancedQuestionEditorProps> = ({
  gameMode,
  questions,
  onChange,
}) => {
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(
      questions.map(({ data }) => data),
      null,
      2,
    ),
  )
  const [jsonError, setJsonError] = useState<string>()

  const lastPropJsonRef = useRef<string>(
    JSON.stringify(
      questions.map(({ data }) => data),
      null,
      2,
    ),
  )

  useEffect(() => {
    const newQuestions = questions.map(({ data }) => data)
    const newPropJson = JSON.stringify(newQuestions, null, 2)

    if (newPropJson !== lastPropJsonRef.current) {
      lastPropJsonRef.current = newPropJson
      setJsonText(newPropJson)

      try {
        parseQuestionsJson(newQuestions, gameMode)
        setJsonError(undefined)
      } catch (err) {
        setJsonError((err as Error).message)
      }
    }
  }, [gameMode, questions])

  const handleChange = (text: string) => {
    setJsonText(text)
    setJsonError(undefined)

    try {
      const parsedJson = JSON.parse(text)
      const parsedQuestionsData = parseQuestionsJson(parsedJson, gameMode)
      onChange(parsedQuestionsData)
    } catch (err) {
      setJsonError((err as Error).message)
    }
  }

  return (
    <div className={styles.advancedQuestionEditor}>
      <Textarea
        id="json-textarea"
        type="code"
        placeholder="Questions"
        value={jsonText}
        onChange={handleChange}
        onAdditionalValidation={() => jsonError || true}
        forceValidate
      />
    </div>
  )
}

export default AdvancedQuestionEditor
