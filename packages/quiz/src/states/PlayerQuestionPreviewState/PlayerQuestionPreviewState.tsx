import { GameQuestionPreviewPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import { PlayerGameFooter, ProgressBar, Typography } from '../../components'
import { GamePage } from '../common'

export interface PlayerQuestionPreviewStateProps {
  event: GameQuestionPreviewPlayerEvent
}

const PlayerQuestionPreviewState: FC<PlayerQuestionPreviewStateProps> = ({
  event: {
    player: { nickname: playerNickname, score: playerTotalScore },
    question: { type: questionType, question: questionValue },
    countdown,
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <GamePage
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
    <ProgressBar countdown={countdown} />
  </GamePage>
)

export default PlayerQuestionPreviewState
