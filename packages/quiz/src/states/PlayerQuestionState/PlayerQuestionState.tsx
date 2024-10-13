import { GameEventQuestionPlayer } from '@quiz/common'
import React, { FC } from 'react'

import {
  Page,
  PlayerGameFooter,
  ProgressBar,
  QuestionAnswerPicker,
  Typography,
} from '../../components'

import styles from './PlayerQuestionState.module.scss'

export interface PlayerQuestionStateProps {
  event: GameEventQuestionPlayer
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
    footer={
      <PlayerGameFooter
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        nickname={nickname}
        totalScore={totalScore}
      />
    }>
    <div className={styles.main}>
      <Typography variant="subtitle" size="medium">
        {question.question}
      </Typography>
      <ProgressBar value={time / question.duration} />
      <QuestionAnswerPicker question={question} />
    </div>
  </Page>
)

export default PlayerQuestionState
