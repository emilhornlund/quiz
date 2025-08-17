import { GameQuestionPreviewHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import { HostGameFooter, ProgressBar, Typography } from '../../components'
import QuestionTypePointsBar, { GamePage } from '../common'

export interface HostQuestionPreviewStateProps {
  event: GameQuestionPreviewHostEvent
}

const HostQuestionPreviewState: FC<HostQuestionPreviewStateProps> = ({
  event: {
    game: { mode, pin: gamePIN },
    question: {
      type: questionType,
      question: questionValue,
      points: questionPoints,
    },
    countdown,
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <GamePage
    height="full"
    align="space-between"
    footer={
      <HostGameFooter
        gamePIN={gamePIN}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
    }>
    <QuestionTypePointsBar
      mode={mode}
      questionType={questionType}
      questionPoints={questionPoints}
    />

    <Typography variant="title" size="medium">
      {questionValue}
    </Typography>

    <ProgressBar countdown={countdown} />
  </GamePage>
)

export default HostQuestionPreviewState
