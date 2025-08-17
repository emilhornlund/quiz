import { GameQuestionPreviewPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import { PlayerGameFooter, ProgressBar, Typography } from '../../components'
import QuestionTypePointsBar, { GamePage } from '../common'

export interface PlayerQuestionPreviewStateProps {
  event: GameQuestionPreviewPlayerEvent
}

const PlayerQuestionPreviewState: FC<PlayerQuestionPreviewStateProps> = ({
  event: {
    game: { mode },
    player: { nickname: playerNickname, score: playerTotalScore },
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
      <PlayerGameFooter
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        nickname={playerNickname}
        totalScore={playerTotalScore}
      />
    }>
    <QuestionTypePointsBar
      mode={mode}
      questionType={questionType}
      questionPoints={questionPoints}
    />

    <Typography variant="subtitle" size="medium">
      {questionValue}
    </Typography>

    <ProgressBar countdown={countdown} />
  </GamePage>
)

export default PlayerQuestionPreviewState
