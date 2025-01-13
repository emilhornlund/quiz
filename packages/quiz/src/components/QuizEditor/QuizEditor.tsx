import {
  GameMode,
  LanguageCode,
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_DESCRIPTION_REGEX,
  QUIZ_TITLE_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QUIZ_TITLE_REGEX,
  QuizRequestDto,
  QuizVisibility,
  URL_REGEX,
} from '@quiz/common'
import React, { FC, useEffect, useState } from 'react'

import {
  GameModeLabels,
  LanguageLabels,
  QuizVisibilityLabels,
} from '../../models/labels.ts'
import {
  DEFAULT_CLASSIC_MODE_QUESTIONS,
  DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
} from '../../utils/questions-template.ts'
import QuestionEditor, { QuestionEditorProps } from '../QuestionEditor'
import Select from '../Select'
import Textarea from '../Textarea'
import TextField from '../TextField'

import styles from './QuizEditor.module.scss'

export interface QuizEditorProps {
  quiz: QuizRequestDto
  onChange: (request: QuizRequestDto) => void
  onValid: (valid: boolean) => void
}

const QuizEditor: FC<QuizEditorProps> = ({ quiz, onChange, onValid }) => {
  const [validity, setValidity] = useState<{
    [key in keyof QuizRequestDto]: boolean
  }>({
    title: false,
    description: false,
    mode: true,
    visibility: true,
    imageCoverURL: false,
    languageCode: true,
    questions: true,
  })

  useEffect(() => {
    onValid(Object.values(validity).every((valid) => valid))
  }, [validity, onValid])

  const handleValueChange = <K extends keyof QuizRequestDto>(
    key: K,
    value: QuizRequestDto[K],
  ): void => {
    if (quiz[key] !== value) {
      if (key === 'mode') {
        if (value === GameMode.Classic) {
          onChange({
            ...quiz,
            mode: GameMode.Classic,
            questions: DEFAULT_CLASSIC_MODE_QUESTIONS,
          })
        } else if (value === GameMode.ZeroToOneHundred) {
          onChange({
            ...quiz,
            mode: GameMode.ZeroToOneHundred,
            questions: DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
          })
        }
      } else {
        onChange({ ...quiz, [key]: value })
      }
    }
  }

  const handleValidChange = <K extends keyof QuizRequestDto>(
    key: K,
    valid: boolean,
  ): void => {
    setValidity((prev) => {
      if (prev?.[key] === valid) {
        return prev
      }
      return { ...prev, [key]: valid }
    })
  }

  const handleQuestionsChange: QuestionEditorProps['onChange'] = ({
    mode,
    questions,
  }) => {
    if (mode === GameMode.Classic) {
      if (quiz.mode !== GameMode.Classic || quiz.questions !== questions) {
        onChange({ ...quiz, mode: GameMode.Classic, questions })
      }
    } else if (mode === GameMode.ZeroToOneHundred) {
      if (
        quiz.mode !== GameMode.ZeroToOneHundred ||
        quiz.questions !== questions
      ) {
        onChange({ ...quiz, mode: GameMode.ZeroToOneHundred, questions })
      }
    }
  }

  return (
    <div className={styles.quizEditor}>
      <div className={styles.details}>
        <div className={styles.column}>
          <TextField
            id="quiz-title-textfield"
            type="text"
            placeholder="Title"
            value={quiz.title}
            minLength={QUIZ_TITLE_MIN_LENGTH}
            maxLength={QUIZ_TITLE_MAX_LENGTH}
            regex={QUIZ_TITLE_REGEX}
            onChange={(value) => handleValueChange('title', value as string)}
            onValid={(valid) => handleValidChange('title', valid)}
            required
            forceValidate
          />
          <Textarea
            id="quiz-description-textarea"
            placeholder="Description"
            value={quiz.description}
            maxLength={QUIZ_DESCRIPTION_MAX_LENGTH}
            regex={QUIZ_DESCRIPTION_REGEX}
            onChange={(value) =>
              handleValueChange('description', value as string)
            }
            onValid={(valid) => handleValidChange('description', valid)}
            forceValidate
          />
        </div>
        <div className={styles.column}>
          <Select
            id="quiz-mode-select"
            values={Object.values(GameMode).map((gameMode) => ({
              key: gameMode,
              value: gameMode,
              valueLabel: GameModeLabels[gameMode],
            }))}
            value={quiz.mode}
            onChange={(value) => handleValueChange('mode', value as GameMode)}
            required
            forceValidate
          />
          <Select
            id="quiz-visibility-select"
            values={Object.values(QuizVisibility).map((visibility) => ({
              key: visibility,
              value: visibility,
              valueLabel: QuizVisibilityLabels[visibility],
            }))}
            value={quiz.visibility}
            onChange={(value) =>
              handleValueChange('visibility', value as QuizVisibility)
            }
            required
            forceValidate
          />
          <TextField
            id="quiz-image-cover-textfield"
            type="text"
            placeholder="Image Cover URL"
            value={quiz.imageCoverURL}
            regex={URL_REGEX}
            onChange={(value) =>
              handleValueChange('imageCoverURL', value as string)
            }
            onValid={(valid) => handleValidChange('imageCoverURL', valid)}
            forceValidate
          />
          <Select
            id="quiz-language-select"
            values={Object.values(LanguageCode).map((languageCode) => ({
              key: languageCode,
              value: languageCode,
              valueLabel: LanguageLabels[languageCode],
            }))}
            value={quiz.languageCode}
            onChange={(value) =>
              handleValueChange('languageCode', value as LanguageCode)
            }
            required
            forceValidate
          />
        </div>
      </div>
      <QuestionEditor
        onChange={handleQuestionsChange}
        onValid={(valid) => handleValidChange('questions', valid)}
        {...(quiz.mode === GameMode.Classic
          ? { ...{ mode: GameMode.Classic, questions: quiz.questions } }
          : {
              ...{
                mode: GameMode.ZeroToOneHundred,
                questions: quiz.questions,
              },
            })}
      />
    </div>
  )
}

export default QuizEditor
