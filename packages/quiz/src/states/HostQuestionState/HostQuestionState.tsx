import { faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameQuestionHostEvent, MediaType } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Page,
  ProgressBar,
  QuestionAnswerPicker,
  Typography,
} from '../../components'
import ResponsiveImage from '../../components/ResponsiveImage'
import ResponsivePlayer from '../../components/ResponsivePlayer'
import { classNames } from '../../utils/helpers.ts'

import styles from './HostQuestionState.module.scss'

export interface HostQuestionStateProps {
  event: GameQuestionHostEvent
  onSkip: () => void
}

const HostQuestionState: FC<HostQuestionStateProps> = ({
  event: {
    game: { pin },
    question,
    countdown,
    submissions: { current: currentSubmission, total: totalSubmissions },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
  onSkip,
}) => (
  <Page
    height="full"
    align="space-between"
    header={
      <IconButtonArrowRight
        id={'skip-button'}
        type="button"
        kind="secondary"
        size="small"
        value="Skip"
        onClick={onSkip}
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
    <div
      className={classNames(styles.row, styles.fullHeight, styles.fullWidth)}>
      {question.media?.type === MediaType.Image && (
        <ResponsiveImage
          imageURL={question.media.url}
          alt={question.question}
        />
      )}
      {question.media?.type === MediaType.Audio ||
        (question.media?.type === MediaType.Video && (
          <ResponsivePlayer url={question.media.url} />
        ))}
    </div>
    <div
      className={classNames(
        styles.row,
        styles.fullWidth,
        styles.flexibleHeight,
      )}>
      <QuestionAnswerPicker question={question} interactive={false} />
    </div>
    <ProgressBar countdown={countdown} />
  </Page>
)

export default HostQuestionState
