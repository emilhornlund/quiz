import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import {
  faCalendar,
  faCircleQuestion,
  faClock,
  faGamepad,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type {
  GameResultClassicModeQuestionMetricDto,
  GameResultDto,
  GameResultParticipantDto,
  GameResultZeroToOneHundredModeQuestionMetricDto,
} from '@klurigo/common'
import { GameMode } from '@klurigo/common'
import type { FC, ReactElement } from 'react'
import { useMemo } from 'react'

import {
  CircularProgressBar,
  CircularProgressBarKind,
  CircularProgressBarSize,
} from '../../../../../../components'
import { GameModeLabels } from '../../../../../../models'
import {
  DATE_FORMATS,
  formatLocalDate,
} from '../../../../../../utils/date.utils'
import { classNames } from '../../../../../../utils/helpers'
import {
  formatRoundedDuration,
  formatRoundedSeconds,
  getAveragePrecision,
  getCorrectPercentage,
  getQuizDifficultyMessage,
} from '../../utils'

import styles from './SummarySection.module.scss'

export type Metric = { value: number; players: GameResultParticipantDto[] }

const DetailsItem: FC<{
  title: string
  icon: IconDefinition
  children: ReactElement | string | number
}> = ({ title, icon, children }) => (
  <div className={styles.item}>
    <div className={styles.icon}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className={styles.title}>{title}</div>
    <div className={styles.value}>{children}</div>
  </div>
)

const MetricCard: FC<{ title: string; value: string; nicknames: string[] }> = ({
  title,
  value,
  nicknames,
}) => (
  <div className={classNames(styles.card, styles.metric)}>
    <div className={styles.title}>{title}</div>
    <div className={styles.value}>{value}</div>
    <div className={styles.nicknames}>
      {nicknames.map((nickname, index) => (
        <div key={`${nickname}_${index}`} className={styles.nickname}>
          {nickname}
        </div>
      ))}
    </div>
  </div>
)

export interface SummarySectionProps {
  mode: GameMode
  hostNickname: string
  numberOfPlayers: number
  numberOfQuestions: number
  playerMetrics: GameResultDto['playerMetrics']
  questionMetrics: GameResultDto['questionMetrics']
  duration: number
  created: Date
}

const SummarySection: FC<SummarySectionProps> = ({
  mode,
  hostNickname,
  numberOfPlayers,
  numberOfQuestions,
  playerMetrics,
  questionMetrics,
  duration,
  created,
}) => {
  const percentage = useMemo<number>(
    () =>
      Math.ceil(
        questionMetrics.reduce((prev, metric) => {
          if (mode === GameMode.Classic) {
            return (
              prev +
              getCorrectPercentage(
                metric as GameResultClassicModeQuestionMetricDto,
              )
            )
          }
          if (mode === GameMode.ZeroToOneHundred) {
            return (
              prev +
              getAveragePrecision(
                metric as GameResultZeroToOneHundredModeQuestionMetricDto,
              )
            )
          }
          return prev
        }, 0) / questionMetrics.length,
      ),
    [mode, questionMetrics],
  )

  const averageResponseTimeMetric = useMemo<Metric>(() => {
    const value = Math.min(
      ...playerMetrics.map(({ averageResponseTime }) => averageResponseTime),
    )

    const players = playerMetrics
      .filter(({ averageResponseTime }) => averageResponseTime === value)
      .map(({ player }) => player)
      .sort((a, b) => a.nickname.localeCompare(b.nickname))

    return { value, players }
  }, [playerMetrics])

  const longestCorrectStreakMetric = useMemo<Metric>(() => {
    const value = Math.max(
      ...playerMetrics.map(({ longestCorrectStreak }) => longestCorrectStreak),
    )

    const players = playerMetrics
      .filter(({ longestCorrectStreak }) => longestCorrectStreak === value)
      .map(({ player }) => player)
      .sort((a, b) => a.nickname.localeCompare(b.nickname))

    return { value, players }
  }, [playerMetrics])

  return (
    <section>
      <div className={styles.cards}>
        <div className={classNames(styles.card, styles.full, styles.progress)}>
          <CircularProgressBar
            kind={CircularProgressBarKind.Correct}
            size={CircularProgressBarSize.Medium}
            progress={percentage}
          />
          <div className={styles.text}>
            {getQuizDifficultyMessage(percentage)}
          </div>
        </div>

        <div className={classNames(styles.card, styles.full, styles.details)}>
          <div className={styles.column}>
            <DetailsItem title="Game Mode" icon={faGamepad}>
              {GameModeLabels[mode]}
            </DetailsItem>

            <DetailsItem title="Players" icon={faUser}>
              {numberOfPlayers}
            </DetailsItem>

            <DetailsItem title="Questions" icon={faCircleQuestion}>
              {numberOfQuestions}
            </DetailsItem>
          </div>

          <div className={styles.separator} />

          <div className={styles.column}>
            <DetailsItem title="Host" icon={faUserTie}>
              {hostNickname}
            </DetailsItem>

            <DetailsItem title="Date" icon={faCalendar}>
              {formatLocalDate(created, DATE_FORMATS.DATE_TIME)}
            </DetailsItem>

            <DetailsItem title="Duration" icon={faClock}>
              {formatRoundedDuration(duration)}
            </DetailsItem>
          </div>
        </div>

        {averageResponseTimeMetric.players.length > 0 && (
          <MetricCard
            title="Fastest Overall Player"
            value={formatRoundedSeconds(averageResponseTimeMetric.value)}
            nicknames={averageResponseTimeMetric.players.map(
              ({ nickname }) => nickname,
            )}
          />
        )}

        {longestCorrectStreakMetric.players.length > 0 && (
          <MetricCard
            title="Longest Correct Streak"
            value={`${longestCorrectStreakMetric.value}`}
            nicknames={longestCorrectStreakMetric.players.map(
              ({ nickname }) => nickname,
            )}
          />
        )}
      </div>
    </section>
  )
}

export default SummarySection
