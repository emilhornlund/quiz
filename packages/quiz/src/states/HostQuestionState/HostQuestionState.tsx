import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  GameQuestionHostEvent,
  MediaType,
  QuestionMediaEvent,
  QuestionType,
} from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  ProgressBar,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'
import { classNames } from '../../utils/helpers.ts'
import { GamePage, QuestionAnswerPicker, QuestionMedia } from '../common'

import styles from './HostQuestionState.module.scss'

export interface HostQuestionStateProps {
  event: GameQuestionHostEvent
}

const HostQuestionState: FC<HostQuestionStateProps> = ({
  event: {
    game: { pin },
    question,
    countdown,
    submissions: { current: currentSubmission, total: totalSubmissions },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  const [isSkippingQuestion, setIsSkippingQuestion] = useState<boolean>(false)

  const { completeTask } = useGameContext()

  const media = useMemo<QuestionMediaEvent | undefined>(() => {
    if (question.type !== QuestionType.Pin) {
      return question.media
    }
    return { type: MediaType.Image, url: question.imageURL }
  }, [question])

  const handleSkipQuestion = () => {
    setIsSkippingQuestion(true)
    completeTask?.().finally(() => setIsSkippingQuestion(false))
  }

  return (
    <GamePage
      height="full"
      align="space-between"
      header={
        <IconButtonArrowRight
          id={'skip-button'}
          type="button"
          kind="call-to-action"
          size="small"
          value="Skip"
          loading={isSkippingQuestion}
          onClick={handleSkipQuestion}
        />
      }
      footer={
        <HostGameFooter
          gamePIN={pin}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />
      }>
      <div className={classNames(styles.row, styles.flexibleHeight)}>
        <div className={styles.column}>
          <Typography variant="subtitle">{question.question}</Typography>
        </div>
      </div>
      <div className={classNames(styles.row, styles.flexibleHeight)}>
        <div className={styles.column}>
          <div className={classNames(styles.iconInfo)}>
            <FontAwesomeIcon icon={faUserGroup} />
            <span>
              {currentSubmission} / {totalSubmissions}
            </span>
          </div>
        </div>
      </div>
      <QuestionMedia
        type={question.type}
        media={media}
        alt={question.question}
      />
      <div
        className={classNames(
          styles.row,
          styles.fullWidth,
          question.type === QuestionType.Pin || !media
            ? styles.fullHeight
            : styles.flexibleHeight,
        )}>
        <QuestionAnswerPicker question={question} interactive={false} />
      </div>
      <ProgressBar countdown={countdown} />
    </GamePage>
  )
}

export default HostQuestionState
