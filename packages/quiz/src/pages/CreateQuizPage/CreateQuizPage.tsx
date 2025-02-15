import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { IconButtonArrowLeft, Page, QuizEditor } from '../../components'
import { DEFAULT_CLASSIC_MODE_QUESTIONS } from '../../utils/questions-template.ts'

const CreateQuizPage: FC = () => {
  const navigate = useNavigate()

  const { createQuiz } = useQuizServiceClient()

  const [editableData, setEditableData] = useState<QuizRequestDto>({
    title: '',
    visibility: QuizVisibility.Public,
    category: QuizCategory.GeneralKnowledge,
    languageCode: LanguageCode.English,
    mode: GameMode.Classic,
    questions: DEFAULT_CLASSIC_MODE_QUESTIONS,
  })

  const [isQuizValid, setIsQuizValid] = useState<boolean>(false)

  const [isSavingQuiz, setIsSavingQuiz] = useState(false)

  const handleSaveQuiz = (): void => {
    setIsSavingQuiz(true)
    createQuiz(editableData)
      .then(() => navigate('/player/profile'))
      .finally(() => setIsSavingQuiz(false))
  }

  return (
    <Page
      header={
        <IconButtonArrowLeft
          id={'save-quiz-button'}
          type="button"
          kind="call-to-action"
          size="small"
          value="Save"
          loading={isSavingQuiz}
          disabled={!isQuizValid}
          onClick={handleSaveQuiz}
        />
      }
      profile>
      <QuizEditor
        quiz={editableData}
        onChange={setEditableData}
        onValid={setIsQuizValid}
      />
    </Page>
  )
}

export default CreateQuizPage
