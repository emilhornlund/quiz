import { GameEventQuestionPlayer } from '@quiz/common'
import React, { FC } from 'react'

import QuestionAnswerPicker, { Page, PlayerGameFooter } from '../../components'

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
      <div className={styles.question}>{question.question}</div>
      <div className={styles.timer}>
        <span style={{ width: `${(time / question.duration) * 100}%` }} />
      </div>
      <QuestionAnswerPicker question={question} />
    </div>
  </Page>
)

export default PlayerQuestionState
