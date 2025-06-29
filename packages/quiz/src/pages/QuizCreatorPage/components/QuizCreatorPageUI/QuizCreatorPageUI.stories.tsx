import { GameMode, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockAuth } from '../../../../../.storybook/mockAuthContext.tsx'
import { useQuestionDataSource } from '../../utils/QuestionDataSource'
import { useQuizSettingsDataSource } from '../../utils/QuizSettingsDataSource'

import QuizCreatorPageUI, { QuizCreatorPageUIProps } from './QuizCreatorPageUI'

const QuizCreatorPageUIStoryComponent: FC<QuizCreatorPageUIProps> = () => {
  const [gameMode, setGameMode] = useState<GameMode>()

  const {
    values: quizSettings,
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
      onSaveQuiz={() => undefined}
    />
  )
}

const meta = {
  title: 'Pages/QuizCreatorPage',
  component: QuizCreatorPageUI,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <QuizCreatorPageUIStoryComponent {...args} />,
} satisfies Meta<typeof QuizCreatorPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    quizSettings: {},
    allQuizSettingsValid: false,
    questions: [],
    allQuestionsValid: false,
    selectedQuestion: undefined,
    selectedQuestionIndex: -1,
    onSetQuestions: () => undefined,
    onQuizSettingsValueChange: () => undefined,
    onQuizSettingsValidChange: () => undefined,
    onSelectedQuestionIndex: () => undefined,
    onAddQuestion: () => undefined,
    onQuestionValueChange: () => undefined,
    onQuestionValueValidChange: () => undefined,
    onDropQuestionIndex: () => undefined,
    onDuplicateQuestionIndex: () => undefined,
    onDeleteQuestionIndex: () => undefined,
    onReplaceQuestion: () => undefined,
    onSaveQuiz: () => undefined,
  },
} satisfies Story
