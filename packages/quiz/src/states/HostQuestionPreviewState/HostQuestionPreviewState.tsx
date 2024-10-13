import { GameEventGameQuestionPreviewHost } from '@quiz/common'
import React, { FC } from 'react'

import { HostGameFooter, Page, ProgressBar, Typography } from '../../components'

import styles from './HostQuestionPreviewState.module.scss'

export interface HostQuestionPreviewStateProps {
  event: GameEventGameQuestionPreviewHost
}

const HostQuestionPreviewState: FC<HostQuestionPreviewStateProps> = ({
  event: {
    game: { pin: gamePIN },
    question: { type: questionType, question: questionValue },
    progress: { value: progressValue },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <Page
    footer={
      <HostGameFooter
        gamePIN={gamePIN}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
    }>
    <div className={styles.main}>
      <div>{questionType}</div>
      <Typography variant="title" size="medium">
        {questionValue}
      </Typography>
      <ProgressBar value={progressValue} />
    </div>
  </Page>
)

export default HostQuestionPreviewState
