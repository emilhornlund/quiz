import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { GameResultPlayerEvent } from '@klurigo/common'
import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'

import {
  Badge,
  Confetti,
  getBadgePositionBackgroundColor,
  StreakBadge,
  Typography,
} from '../../components'
import { getBadgePositionTextColor } from '../../components/Badge/badge-utils.ts'
import { classNames } from '../../utils/helpers.ts'
import { GamePage, PlayerGameFooter, PointsBehindIndicator } from '../common'

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
  const [showPosition, setShowPosition] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPosition(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

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
      <div
        className={classNames(
          styles.contentContainer,
          showPosition ? styles.shrink : undefined,
        )}>
        <div
          className={classNames(
            styles.correctnessBatch,
            showPosition ? styles.slideOutLeft : undefined,
          )}>
          <Typography variant="title">
            {correct ? 'Correct' : 'Incorrect'}
          </Typography>

          <Badge
            size="large"
            backgroundColor={correct ? 'green' : 'red'}
            celebration={correct ? celebrationLevel : 'none'}>
            <FontAwesomeIcon icon={correct ? faCheck : faXmark} />
          </Badge>
        </div>

        <div
          className={classNames(
            styles.positionBatch,
            showPosition ? styles.slideInRight : styles.hidden,
          )}>
          <Badge
            size="large"
            backgroundColor={getBadgePositionBackgroundColor(position)}
            textColor={getBadgePositionTextColor(position)}>
            {position}
          </Badge>
        </div>
      </div>

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
