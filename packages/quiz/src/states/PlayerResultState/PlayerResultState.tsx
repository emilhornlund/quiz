import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameResultPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { Badge, Page, PlayerGameFooter, Typography } from '../../components'

import { getPositionMessage } from './messages.ts'
import styles from './PlayerResultState.module.scss'

export interface PlayerResultStateProps {
  event: GameResultPlayerEvent
}

const PlayerResultState: FC<PlayerResultStateProps> = ({
  event: {
    player: {
      nickname,
      score: { correct, last: lastScore, total: totalScore, position, streak },
    },
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
      <Badge size="large" backgroundColor={correct ? 'green' : 'red'}>
        <FontAwesomeIcon icon={correct ? faCheck : faXmark} />
      </Badge>
      {!!streak && streak > 1 && (
        <div className={styles.streak}>
          Streak{' '}
          <Badge size="small" backgroundColor="orange">
            {streak}
          </Badge>
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
