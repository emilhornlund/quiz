import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameEventResultPlayer } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { Page, PlayerGameFooter, Typography } from '../../components'
import { classNames } from '../../utils/helpers.ts'

import { getPositionMessage } from './messages.ts'
import styles from './PlayerResultState.module.scss'

export interface PlayerResultStateProps {
  event: GameEventResultPlayer
}

const PlayerResultState: FC<PlayerResultStateProps> = ({
  event: {
    nickname,
    correct,
    score: { last: lastScore, total: totalScore, position, streak },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  const message = useMemo(() => {
    return getPositionMessage(position, correct)
  }, [position, correct])

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
      <Typography variant="subtitle">
        {correct ? 'Correct' : 'Incorrect'}
      </Typography>
      <span
        className={classNames(
          styles.icon,
          correct ? styles.correct : styles.incorrect,
        )}>
        <FontAwesomeIcon icon={correct ? faCheck : faXmark} />
      </span>
      {!!streak && (
        <div className={styles.streak}>
          Answer streak <span>{streak}</span>
        </div>
      )}
      <div className={styles.score}>{lastScore}</div>
      <Typography variant="text" size="small">
        {message}
      </Typography>
    </Page>
  )
}

export default PlayerResultState
