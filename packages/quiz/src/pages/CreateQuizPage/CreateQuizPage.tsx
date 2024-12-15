import {
  GameMode,
  LanguageCode,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import { useMutation } from '@tanstack/react-query'
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
    languageCode: LanguageCode.English,
    mode: GameMode.Classic,
    questions: DEFAULT_CLASSIC_MODE_QUESTIONS,
  })

  const [isQuizValid, setIsQuizValid] = useState<boolean>(false)

  const createQuizMutation = useMutation({
    mutationFn: (request: QuizRequestDto) => createQuiz(request),
    onSuccess: () => navigate('/player/profile'),
  })

  const handleSave = (): void => {
    createQuizMutation.mutate(editableData)
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
          disabled={!isQuizValid}
          onClick={handleSave}
        />
      }>
      <QuizEditor
        quiz={editableData}
        onChange={setEditableData}
        onValid={setIsQuizValid}
      />
    </Page>
  )
}

export default CreateQuizPage
