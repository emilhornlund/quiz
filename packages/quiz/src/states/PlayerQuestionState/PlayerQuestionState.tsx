import { GameEventQuestionPlayer } from '@quiz/common'
import React, { FC } from 'react'

import { Page, PlayerGameFooter } from '../../components'

import styles from './PlayerQuestionState.module.scss'

export interface PlayerQuestionStateProps {
  event: GameEventQuestionPlayer
}

const PlayerQuestionState: FC<PlayerQuestionStateProps> = ({
  event: {
    nickname,
    question: { type: questionType, question, duration },
    time,
    score: { total: totalScore },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  return (
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
        <div className={styles.question}>{question}</div>
        <div className={styles.answer}>WIP component for: {questionType}</div>
        <div className={styles.timer}>
          <span style={{ width: `${(time / duration) * 100}%` }} />
        </div>
      </div>
    </Page>
  )
}

export default PlayerQuestionState
