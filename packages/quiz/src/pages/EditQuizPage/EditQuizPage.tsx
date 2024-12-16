import { faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  GameMode,
  LanguageCode,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import {
  QuestionMultiChoiceDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common/dist/cjs/models/question.dto'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import {
  Button,
  ConfirmDialog,
  IconButtonArrowLeft,
  LoadingSpinner,
  Page,
  QuizEditor,
} from '../../components'

const EditQuizPage: FC = () => {
  const { quizId } = useParams<{ quizId: string }>()

  const navigate = useNavigate()

  const { getQuiz, getQuizQuestions, updateQuiz, deleteQuiz } =
    useQuizServiceClient()

  const {
    data: originalQuiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuiz(quizId as string),
    enabled: !!quizId,
  })

  const {
    data: originalQuizQuestions,
    isLoading: isQuizQuestionsLoading,
    isError: isQuizQuestionsError,
  } = useQuery({
    queryKey: ['quiz_questions', quizId],
    queryFn: () => getQuizQuestions(quizId as string),
    enabled: !!quizId,
  })

  const [editableData, setEditableData] = useState<QuizRequestDto>({
    title: '',
    visibility: QuizVisibility.Public,
    languageCode: LanguageCode.English,
    mode: GameMode.Classic,
    questions: [],
  })

  useEffect(() => {
    if (originalQuiz && originalQuizQuestions) {
      setEditableData({
        title: originalQuiz.title,
        description: originalQuiz.description,
        visibility: originalQuiz.visibility,
        imageCoverURL: originalQuiz.imageCoverURL,
        languageCode: originalQuiz.languageCode,
        ...(originalQuiz.mode === GameMode.Classic
          ? {
              mode: GameMode.Classic,
              questions: originalQuizQuestions as unknown as (
                | QuestionMultiChoiceDto
                | QuestionRangeDto
                | QuestionTrueFalseDto
                | QuestionTypeAnswerDto
              )[],
            }
          : {
              mode: GameMode.ZeroToOneHundred,
              questions:
                originalQuizQuestions as unknown as QuestionZeroToOneHundredRangeDto[],
            }),
      })
    }
  }, [originalQuiz, originalQuizQuestions])

  const [isQuizValid, setIsQuizValid] = useState<boolean>(false)

  const updateQuizMutation = useMutation({
    mutationFn: (request: QuizRequestDto) =>
      updateQuiz(quizId as string, request),
    onSuccess: () => navigate('/player/profile'),
  })

  const deleteQuizMutation = useMutation({
    mutationFn: () => deleteQuiz(quizId as string),
    onSuccess: () => navigate('/player/profile'),
  })

  const handleSaveQuiz = (): void => {
    updateQuizMutation.mutate(editableData)
  }

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false)

  const handleDeleteQuiz = (): void => {
    deleteQuizMutation.mutate()
  }

  if (
    !quizId ||
    isQuizLoading ||
    isQuizQuestionsLoading ||
    isQuizError ||
    isQuizQuestionsError
  ) {
    return (
      <Page profile>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <>
      <Page
        header={
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              columnGap: '1rem',
            }}>
            <Button
              id="delete-quiz-button"
              type="button"
              kind="destructive"
              size="small"
              value="Delete"
              icon={faTrash}
              onClick={() => setShowConfirmDeleteDialog(true)}
            />
            <IconButtonArrowLeft
              id={'save-quiz-button'}
              type="button"
              kind="call-to-action"
              size="small"
              value="Save"
              disabled={!isQuizValid}
              onClick={handleSaveQuiz}
            />
          </div>
        }
        profile>
        <QuizEditor
          quiz={editableData}
          onChange={setEditableData}
          onValid={setIsQuizValid}
        />
      </Page>
      <ConfirmDialog
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz?"
        open={showConfirmDeleteDialog}
        onConfirm={handleDeleteQuiz}
        onClose={() => setShowConfirmDeleteDialog(false)}
        destructive
      />
    </>
  )
}

export default EditQuizPage
