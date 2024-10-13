import { GameQuestionPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  Page,
  PlayerGameFooter,
  ProgressBar,
  QuestionAnswerPicker,
  Typography,
} from '../../components'

export interface PlayerQuestionStateProps {
  event: GameQuestionPlayerEvent
}

const PlayerQuestionState: FC<PlayerQuestionStateProps> = ({
  event: {
    nickname,
    question,
    time,
    score: { total: totalScore },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <Page
    height="full"
    footer={
      <PlayerGameFooter
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        nickname={nickname}
        totalScore={totalScore}
      />
    }>
    <Typography variant="subtitle" size="medium">
      {question.question}
    </Typography>
    <ProgressBar value={time / question.duration} />
    <QuestionAnswerPicker question={question} />
  </Page>
)

export default PlayerQuestionState
