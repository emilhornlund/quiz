import { GameQuestionPreviewPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  Page,
  PlayerGameFooter,
  ProgressBar,
  Typography,
} from '../../components'

export interface PlayerQuestionPreviewStateProps {
  event: GameQuestionPreviewPlayerEvent
}

const PlayerQuestionPreviewState: FC<PlayerQuestionPreviewStateProps> = ({
  event: {
    player: { nickname: playerNickname, score: playerTotalScore },
    question: { type: questionType, question: questionValue },
    progress: { value: progressValue },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <Page
    align="space-between"
    footer={
      <PlayerGameFooter
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        nickname={playerNickname}
        totalScore={playerTotalScore}
      />
    }>
    <div>{questionType}</div>
    <Typography variant="subtitle" size="medium">
      {questionValue}
    </Typography>
    <ProgressBar value={progressValue} />
  </Page>
)

export default PlayerQuestionPreviewState
