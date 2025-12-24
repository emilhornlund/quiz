import { GameMode, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockAuth } from '../../../../../.storybook/mockAuthContext.tsx'
import type { QuizQuestionValidationResult } from '../../utils/QuestionDataSource'
import { useQuestionDataSource } from '../../utils/QuestionDataSource'
import type { QuizSettingsValidationResult } from '../../utils/QuizSettingsDataSource'
import { useQuizSettingsDataSource } from '../../utils/QuizSettingsDataSource'

import QuizCreatorPageUI, {
  type QuizCreatorPageUIProps,
} from './QuizCreatorPageUI'

const QuizCreatorPageUIStoryComponent: FC<QuizCreatorPageUIProps> = () => {
  const {
    settings: quizSettings,
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

  const handleAddQuestion = (): void => {
    if (gameMode === GameMode.Classic) {
      addQuestion(QuestionType.MultiChoice)
    }
    if (gameMode === GameMode.ZeroToOneHundred) {
      addQuestion(QuestionType.Range)
    }
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
    quizSettingsValidation: {} as QuizSettingsValidationResult,
    allQuizSettingsValid: false,
    questions: [],
    questionValidations: [] as QuizQuestionValidationResult[],
    allQuestionsValid: false,
    selectedQuestion: undefined,
    selectedQuestionIndex: -1,
    onSetQuestions: () => undefined,
    onQuizSettingsValueChange: () => undefined,
    onSelectedQuestionIndex: () => undefined,
    onAddQuestion: () => undefined,
    onQuestionValueChange: () => undefined,
    onDropQuestionIndex: () => undefined,
    onDuplicateQuestionIndex: () => undefined,
    onDeleteQuestionIndex: () => undefined,
    onReplaceQuestion: () => undefined,
    onSaveQuiz: () => undefined,
  },
} satisfies Story
