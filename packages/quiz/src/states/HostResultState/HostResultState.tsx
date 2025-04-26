import { GameResultHostEvent, QuestionCorrectAnswerDto } from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Page,
  QuestionResults,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'

export interface HostResultStateProps {
  event: GameResultHostEvent
}

const HostResultState: FC<HostResultStateProps> = ({
  event: {
    game: { pin: gamePIN },
    question: { question: questionValue },
    pagination: { current: currentQuestion, total: totalQuestions },
    results,
  },
}) => {
  const [isInitiatingLeaderboardTask, setIsInitiatingLeaderboardTask] =
    useState<boolean>(false)
  const [isProcessingCorrectAnswer, setIsProcessingCorrectAnswer] =
    useState(false)

  const { completeTask, addCorrectAnswer, deleteCorrectAnswer } =
    useGameContext()

  const handleInitiatingLeaderboardTask = () => {
    setIsInitiatingLeaderboardTask(true)
    completeTask?.().finally(() => setIsInitiatingLeaderboardTask(false))
  }

  const handleAddCorrectAnswer = (answer: QuestionCorrectAnswerDto) => {
    setIsProcessingCorrectAnswer(true)
    addCorrectAnswer?.(answer).finally(() =>
      setIsProcessingCorrectAnswer(false),
    )
  }

  const handleDeleteCorrectAnswer = (answer: QuestionCorrectAnswerDto) => {
    setIsProcessingCorrectAnswer(true)
    deleteCorrectAnswer?.(answer).finally(() =>
      setIsProcessingCorrectAnswer(false),
    )
  }

  return (
    <Page
      height="full"
      align="start"
      header={
        <IconButtonArrowRight
          id={'next-button'}
          type="button"
          kind="call-to-action"
          size="small"
          value="Next"
          loading={isInitiatingLeaderboardTask}
          onClick={handleInitiatingLeaderboardTask}
        />
      }
      footer={
        <HostGameFooter
          gamePIN={gamePIN}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />
      }>
      <Typography variant="subtitle">{questionValue}</Typography>
      <QuestionResults
        results={results}
        loading={isProcessingCorrectAnswer}
        onAddCorrectAnswer={handleAddCorrectAnswer}
        onDeleteCorrectAnswer={handleDeleteCorrectAnswer}
      />
    </Page>
  )
}

export default HostResultState
