import { GameMode, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { useQuestionDataSource } from '../../utils/QuestionDataSource'

import QuizCreatorPageUI, { QuizCreatorPageUIProps } from './QuizCreatorPageUI'

const QuizCreatorPageUIStoryComponent: FC<QuizCreatorPageUIProps> = () => {
  const [gameMode, setGameMode] = useState<GameMode>()

  const {
    questions,
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
      questions={questions}
      selectedQuestion={selectedQuestion}
      selectedQuestionIndex={selectedQuestionIndex}
      onSelectedQuestionIndex={selectQuestion}
      onAddQuestion={handleAddQuestion}
      onQuestionValueChange={setQuestionValue}
      onQuestionValueValidChange={setQuestionValueValid}
      onDropQuestionIndex={dropQuestion}
      onDuplicateQuestionIndex={duplicateQuestion}
      onDeleteQuestionIndex={deleteQuestion}
      onReplaceQuestion={replaceQuestion}
    />
  )
}

const meta = {
  title: 'Pages/QuizCreatorPage',
  component: QuizCreatorPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <QuizCreatorPageUIStoryComponent {...args} />,
} satisfies Meta<typeof QuizCreatorPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    questions: [],
    selectedQuestion: undefined,
    selectedQuestionIndex: -1,
    onSelectedQuestionIndex: () => undefined,
    onAddQuestion: () => undefined,
    onQuestionValueChange: () => undefined,
    onQuestionValueValidChange: () => undefined,
    onDropQuestionIndex: () => undefined,
    onDuplicateQuestionIndex: () => undefined,
    onDeleteQuestionIndex: () => undefined,
    onReplaceQuestion: () => undefined,
  },
} satisfies Story
