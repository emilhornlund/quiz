import { GameQuestionPreviewHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import { HostGameFooter, Page, ProgressBar, Typography } from '../../components'

export interface HostQuestionPreviewStateProps {
  event: GameQuestionPreviewHostEvent
}

const HostQuestionPreviewState: FC<HostQuestionPreviewStateProps> = ({
  event: {
    game: { pin: gamePIN },
    question: { type: questionType, question: questionValue },
    progress: { value: progressValue },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <Page
    align="space-between"
    footer={
      <HostGameFooter
        gamePIN={gamePIN}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
    }>
    <div>{questionType}</div>
    <Typography variant="title" size="medium">
      {questionValue}
    </Typography>
    <ProgressBar value={progressValue} />
  </Page>
)

export default HostQuestionPreviewState
