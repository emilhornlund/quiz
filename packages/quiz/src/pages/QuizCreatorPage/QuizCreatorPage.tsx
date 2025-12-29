import type {
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
  QuizRequestDto,
} from '@quiz/common'
import {
  GameMode,
  LanguageCode,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api'
import { LoadingSpinner, Page } from '../../components'
import { notifyError } from '../../utils/notification.ts'
import {
  isClassicMultiChoiceQuestion,
  isClassicPinQuestion,
  isClassicPuzzleQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeQuestion,
} from '../../utils/questions'

import QuizCreatorPageUI from './components/QuizCreatorPageUI'
import { useQuestionDataSource } from './utils/QuestionDataSource'
import { useQuizSettingsDataSource } from './utils/QuizSettingsDataSource'

const QuizCreatorPage: FC = () => {
  const { quizId } = useParams<{ quizId: string }>()

  const navigate = useNavigate()

  const { createQuiz, getQuiz, getQuizQuestions, updateQuiz } =
    useQuizServiceClient()

  const {
    settings: quizSettings,
    setSettings: setQuizSettings,
    settingsValidation: quizSettingsValidation,
    allSettingsValid: allQuizSettingsValid,
    updateSettingsField: onQuizSettingsValueChange,
  } = useQuizSettingsDataSource()

  const {
    gameMode,
    setGameMode,
    questions,
    setQuestions,
    questionValidations,
    allQuestionsValid,
    selectedQuestion,
    selectedQuestionIndex,
    selectQuestion,
    addQuestion,
    updateSelectedQuestionField,
    moveSelectedQuestionTo,
    duplicateQuestion,
    deleteQuestion,
    replaceQuestion,
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
  }, [originalQuiz, isQuizLoading, isQuizError, setQuizSettings, setGameMode])

  const {
    data: originalQuizQuestions,
    isLoading: isQuizQuestionsLoading,
    isError: isQuizQuestionsError,
  } = useQuery({
    queryKey: ['quiz_questions', quizId],
    queryFn: () => getQuizQuestions(quizId as string),
    enabled: !!quizId && !!gameMode,
  })

  useEffect(() => {
    if (
      gameMode &&
      originalQuizQuestions &&
      !isQuizQuestionsLoading &&
      !isQuizQuestionsError
    ) {
      setQuestions(originalQuizQuestions)
      selectQuestion(0)
    }
  }, [
    gameMode,
    originalQuizQuestions,
    isQuizQuestionsLoading,
    isQuizQuestionsError,
    setQuestions,
    selectQuestion,
  ])

  const handleAddQuestion = (): void => {
    if (gameMode === GameMode.Classic) {
      addQuestion(QuestionType.MultiChoice)
    }
    if (gameMode === GameMode.ZeroToOneHundred) {
      addQuestion(QuestionType.Range)
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
            questions: questions.filter(
              (question) =>
                isClassicMultiChoiceQuestion(GameMode.Classic, question) ||
                isClassicRangeQuestion(GameMode.Classic, question) ||
                isClassicTrueFalseQuestion(GameMode.Classic, question) ||
                isClassicTypeAnswerQuestion(GameMode.Classic, question) ||
                isClassicPinQuestion(GameMode.Classic, question) ||
                isClassicPuzzleQuestion(GameMode.Classic, question),
            ),
          }
        : {
            mode: GameMode.ZeroToOneHundred,
            questions: questions.filter((question) =>
              isZeroToOneHundredRangeQuestion(
                GameMode.ZeroToOneHundred,
                question,
              ),
            ),
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
      onSelectGameMode={setGameMode}
      quizSettings={quizSettings}
      quizSettingsValidation={quizSettingsValidation}
      allQuizSettingsValid={allQuizSettingsValid}
      onQuizSettingsValueChange={onQuizSettingsValueChange}
      questions={questions}
      questionValidations={questionValidations}
      allQuestionsValid={allQuestionsValid}
      selectedQuestion={selectedQuestion}
      selectedQuestionIndex={selectedQuestionIndex}
      onSetQuestions={setQuestions}
      onSelectedQuestionIndex={selectQuestion}
      onAddQuestion={handleAddQuestion}
      onQuestionValueChange={updateSelectedQuestionField}
      onDropQuestionIndex={moveSelectedQuestionTo}
      onDuplicateQuestionIndex={duplicateQuestion}
      onDeleteQuestionIndex={deleteQuestion}
      onReplaceQuestion={replaceQuestion}
      isSavingQuiz={isSavingQuiz}
      onSaveQuiz={handleSaveQuiz}
    />
  )
}

export default QuizCreatorPage
