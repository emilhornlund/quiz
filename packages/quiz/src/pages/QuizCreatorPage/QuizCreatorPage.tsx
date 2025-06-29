import {
  GameMode,
  LanguageCode,
  QuestionMultiChoiceDto,
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

import QuizCreatorPageUI from './components/QuizCreatorPageUI'
import { useQuestionDataSource } from './utils/QuestionDataSource'
import { QuestionData } from './utils/QuestionDataSource/question-data-source.types.ts'
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
    if (!allQuizSettingsValid || !allQuestionsValid) {
      return
    }

    const requestData = {
      title: quizSettings.title as string,
      description: quizSettings.description,
      visibility: quizSettings.visibility ?? QuizVisibility.Public,
      category: quizSettings.category ?? QuizCategory.Other,
      imageCoverURL: quizSettings.imageCoverURL,
      languageCode: quizSettings.languageCode ?? LanguageCode.English,
      mode: gameMode as GameMode,
      questions: questions.map(({ data }) => data) as
        | (
            | QuestionMultiChoiceDto
            | QuestionRangeDto
            | QuestionTrueFalseDto
            | QuestionTypeAnswerDto
          )[]
        | QuestionZeroToOneHundredRangeDto[],
    } as QuizRequestDto

    setIsSavingQuiz(true)

    if (quizId) {
      updateQuiz(quizId, requestData)
        .then(() => navigate('/profile/quizzes'))
        .finally(() => setIsSavingQuiz(false))
    } else {
      createQuiz(requestData)
        .then(() => navigate('/profile/quizzes'))
        .finally(() => setIsSavingQuiz(false))
    }
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
