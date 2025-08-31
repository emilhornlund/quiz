import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameQuestionHostEvent, MediaType, QuestionType } from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  ProgressBar,
  QuestionAnswerPicker,
  Typography,
} from '../../components'
import ResponsiveImage from '../../components/ResponsiveImage'
import ResponsivePlayer from '../../components/ResponsivePlayer'
import { useGameContext } from '../../context/game'
import { classNames } from '../../utils/helpers.ts'
import { GamePage } from '../common'

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

  const imageURL = useMemo(() => {
    if (
      question.type !== QuestionType.Pin &&
      question.media?.type === MediaType.Image
    ) {
      return question.media.url
    }
    return null
  }, [question])

  const audioOrVideoURL = useMemo(() => {
    if (
      question.type !== QuestionType.Pin &&
      (question.media?.type === MediaType.Audio ||
        question.media?.type === MediaType.Video)
    ) {
      return question.media?.url
    }
    return null
  }, [question])

  const hasMedia = useMemo(
    () => imageURL || audioOrVideoURL,
    [imageURL, audioOrVideoURL],
  )

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
      {hasMedia && (
        <div
          className={classNames(
            styles.row,
            styles.fullHeight,
            styles.fullWidth,
          )}>
          {imageURL && (
            <ResponsiveImage imageURL={imageURL} alt={question.question} />
          )}
          {audioOrVideoURL && <ResponsivePlayer url={audioOrVideoURL} />}
        </div>
      )}
      <div
        className={classNames(
          styles.row,
          styles.fullWidth,
          question.type === QuestionType.Pin || !hasMedia
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
