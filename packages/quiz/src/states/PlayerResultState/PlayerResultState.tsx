import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameResultPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import {
  Badge,
  PlayerGameFooter,
  StreakBadge,
  Typography,
} from '../../components'
import { GamePage, PointsBehindIndicator } from '../common'

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
      behind,
    },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  const message = useMemo(() => {
    return getPositionMessage(position, correct)
  }, [position, correct])

  return (
    <GamePage
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
      <StreakBadge streak={streak}>Streak</StreakBadge>
      <div className={styles.score}>{lastScore}</div>
      <Typography variant="text" size="small">
        {message}
      </Typography>
      {behind && <PointsBehindIndicator {...behind} />}
    </GamePage>
  )
}

export default PlayerResultState
