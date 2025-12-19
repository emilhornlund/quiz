import {
  GameMode,
  LanguageCode,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
  QuizCategory,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import React, { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'
import { notifyError } from '../../utils/notification.ts'

import QuizCreatorPageUI from './components/QuizCreatorPageUI'
import { useQuestionDataSource } from './utils/QuestionDataSource'
import { QuestionData } from './utils/QuestionDataSource/question-data-source.types.ts'
import {
  isClassicMultiChoiceQuestion,
  isClassicPinQuestion,
  isClassicPuzzleQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeDto,
} from './utils/QuestionDataSource/question-data-source.utils.ts'
import { useQuizSettingsDataSource } from './utils/QuizSettingsDataSource'

const QuizCreatorPage: FC = () => {
  const { quizId } = useParams<{ quizId: string }>()

  const navigate = useNavigate()

  const { createQuiz, getQuiz, getQuizQuestions, updateQuiz } =
    useQuizServiceClient()

  const [gameMode, setGameMode] = useState<GameMode>()

  const {
    values: quizSettings,
    setValues: setQuizSettings,
    valid: allQuizSettingsValid,
    onValueChange: onQuizSettingsValueChange,
    onValidChange: onQuizSettingsValidChange,
  } = useQuizSettingsDataSource()

  const {
    questions,
    setQuestions,
    allQuestionsValid,
    selectedQuestion,
    selectedQuestionIndex,
    selectQuestion,
    addQuestion,
    setQuestionValue,
    setQuestionValueValid,
    dropQuestion,
    duplicateQuestion,
    deleteQuestion,
    replaceQuestion,
    resetQuestions,
  } = useQuestionDataSource()

  const {
    data: originalQuiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuiz(quizId as string),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (originalQuiz && !isQuizLoading && !isQuizError) {
      setGameMode(originalQuiz.mode)
      setQuizSettings({
        title: originalQuiz.title,
        description: originalQuiz.description,
        imageCoverURL: originalQuiz.imageCoverURL,
        visibility: originalQuiz.visibility,
        category: originalQuiz.category,
        languageCode: originalQuiz.languageCode,
      })
    }
  }, [originalQuiz, isQuizLoading, isQuizError, setQuizSettings])

  const {
    data: originalQuizQuestions,
    isLoading: isQuizQuestionsLoading,
    isError: isQuizQuestionsError,
  } = useQuery({
    queryKey: ['quiz_questions', quizId],
    queryFn: () => getQuizQuestions(quizId as string),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (
      gameMode &&
      originalQuizQuestions &&
      !isQuizQuestionsLoading &&
      !isQuizQuestionsError
    ) {
      setQuestions(
        originalQuizQuestions.map((question) => ({
          mode: gameMode,
          data: question,
          validation: {},
        })) as QuestionData[],
      )
    }
  }, [
    gameMode,
    originalQuizQuestions,
    isQuizQuestionsLoading,
    isQuizQuestionsError,
    setQuestions,
  ])

  const handleSetGameMode = (gameMode: GameMode): void => {
    setGameMode(gameMode)
    resetQuestions(gameMode)
  }

  const handleAddQuestion = (): void => {
    if (gameMode === GameMode.Classic) {
      addQuestion(GameMode.Classic, QuestionType.MultiChoice)
    }
    if (gameMode === GameMode.ZeroToOneHundred) {
      addQuestion(GameMode.ZeroToOneHundred, QuestionType.Range)
    }
  }

  const [isSavingQuiz, setIsSavingQuiz] = useState(false)

  const handleSaveQuiz = () => {
    if (isSavingQuiz) {
      return
    }

    if (!allQuizSettingsValid || !allQuestionsValid) {
      notifyError('Please fix the highlighted fields before saving')
      return
    }

    const title = quizSettings.title?.trim()
    const description = quizSettings.description?.trim() || undefined

    if (!gameMode) {
      notifyError('Game mode is required')
      return
    }

    if (!title) {
      notifyError('Title is required')
      return
    }

    const questionsToSave:
      | {
          mode: GameMode.Classic
          questions: (
            | QuestionMultiChoiceDto
            | QuestionRangeDto
            | QuestionTrueFalseDto
            | QuestionTypeAnswerDto
            | QuestionPinDto
            | QuestionPuzzleDto
          )[]
        }
      | {
          mode: GameMode.ZeroToOneHundred
          questions: QuestionZeroToOneHundredRangeDto[]
        } =
      gameMode === GameMode.Classic
        ? {
            mode: GameMode.Classic,
            questions: questions
              .filter(
                (questionData) =>
                  isClassicMultiChoiceQuestion(questionData) ||
                  isClassicRangeQuestion(questionData) ||
                  isClassicTrueFalseQuestion(questionData) ||
                  isClassicTypeAnswerQuestion(questionData) ||
                  isClassicPinQuestion(questionData) ||
                  isClassicPuzzleQuestion(questionData),
              )
              .map(({ data }) => data),
          }
        : {
            mode: GameMode.ZeroToOneHundred,
            questions: questions
              .filter(isZeroToOneHundredRangeDto)
              .map(({ data }) => data),
          }

    if (questionsToSave.questions.length !== questions.length) {
      notifyError(
        'Some questions are invalid or unsupported. Please review your questions.',
      )
      return
    }

    const requestData: QuizRequestDto = {
      title,
      description,
      visibility: quizSettings.visibility ?? QuizVisibility.Public,
      category: quizSettings.category ?? QuizCategory.Other,
      imageCoverURL: quizSettings.imageCoverURL,
      languageCode: quizSettings.languageCode ?? LanguageCode.English,
      ...questionsToSave,
    }

    setIsSavingQuiz(true)

    const savePromise = quizId
      ? updateQuiz(quizId, requestData)
      : createQuiz(requestData)

    savePromise
      .then(() => navigate('/profile/quizzes'))
      .finally(() => setIsSavingQuiz(false))
  }

  if (
    quizId &&
    (isQuizLoading ||
      isQuizQuestionsLoading ||
      isQuizError ||
      isQuizQuestionsError)
  ) {
    return (
      <Page profile>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <QuizCreatorPageUI
      gameMode={gameMode}
      onSelectGameMode={handleSetGameMode}
      quizSettings={quizSettings}
      allQuizSettingsValid={allQuizSettingsValid}
      onQuizSettingsValueChange={onQuizSettingsValueChange}
      onQuizSettingsValidChange={onQuizSettingsValidChange}
      questions={questions}
      allQuestionsValid={allQuestionsValid}
      selectedQuestion={selectedQuestion}
      selectedQuestionIndex={selectedQuestionIndex}
      onSetQuestions={setQuestions}
      onSelectedQuestionIndex={selectQuestion}
      onAddQuestion={handleAddQuestion}
      onQuestionValueChange={setQuestionValue}
      onQuestionValueValidChange={setQuestionValueValid}
      onDropQuestionIndex={dropQuestion}
      onDuplicateQuestionIndex={duplicateQuestion}
      onDeleteQuestionIndex={deleteQuestion}
      onReplaceQuestion={replaceQuestion}
      isSavingQuiz={isSavingQuiz}
      onSaveQuiz={handleSaveQuiz}
    />
  )
}

export default QuizCreatorPage
