import { faQuestionCircle, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameMode, GameQuestionPreviewHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import { HostGameFooter, ProgressBar, Typography } from '../../components'
import { QuestionTypeLabels } from '../../models'
import colors from '../../styles/colors.module.scss'
import { GamePage } from '../common'

import styles from './HostQuestionPreviewState.module.scss'

export interface HostQuestionPreviewStateProps {
  event: GameQuestionPreviewHostEvent
}

const HostQuestionPreviewState: FC<HostQuestionPreviewStateProps> = ({
  event: {
    game: { mode, pin: gamePIN },
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
    align="space-between"
    footer={
      <HostGameFooter
        gamePIN={gamePIN}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
    }>
    {mode === GameMode.Classic && (
      <div className={styles.chip}>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faQuestionCircle} color={colors.white} />
          {QuestionTypeLabels[questionType]}
        </div>
        <div className={styles.item}>
          <FontAwesomeIcon icon={faStar} color={colors.yellow2} />
          {questionPoints === 0 && 'Zero Points'}
          {questionPoints === 1000 && 'Standard Points'}
          {questionPoints === 2000 && 'Double Points'}
        </div>
      </div>
    )}
    <Typography variant="title" size="medium">
      {questionValue}
    </Typography>
    <ProgressBar countdown={countdown} />
  </GamePage>
)

export default HostQuestionPreviewState
