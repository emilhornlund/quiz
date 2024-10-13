import { GameEventResultHost } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Page,
  QuestionResults,
  Typography,
} from '../../components'

import styles from './HostResultState.module.scss'

export interface HostResultStateProps {
  event: GameEventResultHost
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
    <div className={styles.main}>
      <Typography variant="subtitle">{questionValue}</Typography>
      <QuestionResults results={results} />
    </div>
  </Page>
)

export default HostResultState
