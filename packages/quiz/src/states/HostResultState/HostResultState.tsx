import { GameResultHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Page,
  QuestionResults,
  Typography,
} from '../../components'

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
}) => (
  <Page
    height="full"
    align="start"
    header={
      <IconButtonArrowRight
        id={'next-button'}
        type="button"
        kind="secondary"
        size="small"
        value="Next"
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
    <QuestionResults results={results} />
  </Page>
)

export default HostResultState
