import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameResultPlayerEvent } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import {
  Badge,
  Confetti,
  PlayerGameFooter,
  StreakBadge,
  Typography,
} from '../../components'
import { GamePage, PointsBehindIndicator } from '../common'

import { getPositionMessage } from './message.utils.ts'
import styles from './PlayerResultState.module.scss'

type CelebrationLevel = 'none' | 'normal' | 'major' | 'epic'

const getCelebrationLevel = (
  correct: boolean,
  streak: number,
  position: number,
): CelebrationLevel => {
  if (!correct) return 'none'

  // Epic celebrations (major milestones)
  if (streak >= 10 || position === 1) return 'epic'
  if (streak >= 7 || position === 2) return 'epic'

  // Major celebrations (good achievements)
  if (streak >= 5 || position === 3) return 'major'

  // Normal celebrations (building momentum)
  if (streak >= 3 || position <= 10) return 'normal'

  return 'none' // No celebration for simple correct answers
}

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
  const message = useMemo(
    () => getPositionMessage(position, correct),
    [position, correct],
  )

  const celebrationLevel = useMemo(
    () => getCelebrationLevel(correct, streak, position),
    [correct, streak, position],
  )

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

      <Badge
        size="large"
        backgroundColor={correct ? 'green' : 'red'}
        celebration={correct ? celebrationLevel : 'none'}>
        <FontAwesomeIcon icon={correct ? faCheck : faXmark} />
      </Badge>

      <StreakBadge streak={streak}>Streak</StreakBadge>

      <div className={styles.score}>{lastScore}</div>

      <Typography variant="text" size="small">
        {message}
      </Typography>

      {behind && <PointsBehindIndicator {...behind} />}

      {celebrationLevel !== 'none' && (
        <Confetti trigger={true} intensity={celebrationLevel} />
      )}
    </GamePage>
  )
}

export default PlayerResultState
