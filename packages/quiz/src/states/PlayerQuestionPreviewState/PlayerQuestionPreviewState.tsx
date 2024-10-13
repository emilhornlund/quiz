import { GameEventGameQuestionPreviewPlayer } from '@quiz/common'
import React, { FC } from 'react'

import {
  Page,
  PlayerGameFooter,
  ProgressBar,
  Typography,
} from '../../components'

import styles from './PlayerQuestionPreviewState.module.scss'

export interface PlayerQuestionPreviewStateProps {
  event: GameEventGameQuestionPreviewPlayer
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
    footer={
      <PlayerGameFooter
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        nickname={playerNickname}
        totalScore={playerTotalScore}
      />
    }>
    <div className={styles.main}>
      <div>{questionType}</div>
      <Typography variant="subtitle" size="medium">
        {questionValue}
      </Typography>
      <ProgressBar value={progressValue} />
    </div>
  </Page>
)

export default PlayerQuestionPreviewState
