import { faComment, faHourglass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameEventQuestionHost } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Page,
  QuestionAnswerPicker,
} from '../../components'
import { classNames } from '../../utils/helpers.ts'

import styles from './HostQuestionState.module.scss'

export interface HostQuestionStateProps {
  event: GameEventQuestionHost
}

const HostQuestionState: FC<HostQuestionStateProps> = ({
  event: {
    gamePIN,
    question,
    submissions: { current: currentSubmission, total: totalSubmissions },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <Page
    header={
      <IconButtonArrowRight
        id={'skip-button'}
        type="button"
        kind="secondary"
        size="small"
        value="Skip"
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
      <div className={classNames(styles.row, styles.flexibleHeight)}>
        <div className={styles.column}>
          <div className={classNames(styles.title, styles.large)}>
            {question.question}
          </div>
        </div>
      </div>
      <div className={classNames(styles.row, styles.flexibleHeight)}>
        <div className={styles.column}>
          <div className={classNames(styles.iconInfo)}>
            <FontAwesomeIcon icon={faHourglass} />
            <span>{question.duration}</span>
          </div>
        </div>
        <div className={styles.column}>
          <div className={classNames(styles.iconInfo)}>
            <FontAwesomeIcon icon={faComment} />
            <span>
              {currentSubmission} / {totalSubmissions}
            </span>
          </div>
        </div>
      </div>
      <div className={classNames(styles.row, styles.fullHeight)}>
        <div className={classNames(styles.column, styles.largeWidth)}>
          {question.imageURL && (
            <img
              src={question.imageURL}
              alt={question.question}
              className={styles.image}
            />
          )}
        </div>
      </div>
      <div className={classNames(styles.row, styles.flexibleHeight)}>
        <QuestionAnswerPicker question={question} interactive={false} />
      </div>
    </div>
  </Page>
)

export default HostQuestionState
