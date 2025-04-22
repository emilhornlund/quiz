import {
  faCircleQuestion,
  faClock,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  GameMode,
  GameResultClassicModeQuestionMetricDto,
  GameResultDto,
  GameResultParticipantDto,
  GameResultZeroToOneHundredModeQuestionMetricDto,
} from '@quiz/common'
import React, { FC, useMemo } from 'react'

import {
  CircularProgressBar,
  CircularProgressBarKind,
  CircularProgressBarSize,
} from '../../../../../components'
import { classNames } from '../../../../../utils/helpers.ts'
import styles from '../GameResultsPageUI.module.scss'
import {
  formatRoundedDuration,
  formatRoundedSeconds,
  getAveragePrecision,
  getCorrectPercentage,
  getQuizDifficultyMessage,
} from '../utils'

export type Metric = { value: number; player: GameResultParticipantDto }

const MetricCard: FC<{ title: string; value: string; nickname: string }> = ({
  title,
  value,
  nickname,
}) => (
  <div className={classNames(styles.card, styles.metric)}>
    <div className={styles.title}>{title}</div>
    <div className={styles.value}>{value}</div>
    <div className={styles.nickname}>{nickname}</div>
  </div>
)

export interface SummarySectionProps {
  mode: GameMode
  playerMetrics: GameResultDto['playerMetrics']
  questionMetrics: GameResultDto['questionMetrics']
  duration: number
}

const SummarySection: FC<SummarySectionProps> = ({
  mode,
  playerMetrics,
  questionMetrics,
  duration,
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

  const averageResponseTimeMetric = useMemo<Metric | undefined>(
    () =>
      playerMetrics.reduce<Metric | undefined>(
        (prev, { averageResponseTime: value, player }) =>
          prev === undefined || value < prev.value ? { value, player } : prev,
        undefined,
      ),
    [playerMetrics],
  )

  const longestCorrectStreakMetric = useMemo<Metric | undefined>(
    () =>
      playerMetrics.reduce<Metric | undefined>(
        (prev, { longestCorrectStreak: value, player }) =>
          prev === undefined || value > prev.value ? { value, player } : prev,
        undefined,
      ),
    [playerMetrics],
  )

  return (
    <section>
      <div className={styles.cards}>
        <div className={classNames(styles.card, styles.progress)}>
          <CircularProgressBar
            kind={CircularProgressBarKind.Correct}
            size={CircularProgressBarSize.Medium}
            progress={percentage}
          />
          <div className={styles.text}>
            {getQuizDifficultyMessage(percentage)}
          </div>
        </div>

        <div className={classNames(styles.card, styles.details)}>
          <div className={styles.title}>
            <FontAwesomeIcon icon={faUser} />
            Players
          </div>
          <div className={styles.value}>{playerMetrics.length}</div>
          <div className={styles.title}>
            <FontAwesomeIcon icon={faCircleQuestion} />
            Questions
          </div>
          <div className={styles.value}>{questionMetrics.length}</div>
          <div className={styles.title}>
            <FontAwesomeIcon icon={faClock} />
            Time
          </div>
          <div className={styles.value}>{formatRoundedDuration(duration)}</div>
        </div>

        {averageResponseTimeMetric && (
          <MetricCard
            title="Fastest Overall Player"
            value={formatRoundedSeconds(averageResponseTimeMetric.value)}
            nickname={averageResponseTimeMetric.player.nickname}
          />
        )}

        {longestCorrectStreakMetric && (
          <MetricCard
            title="Longest Correct Streak"
            value={`${longestCorrectStreakMetric.value}`}
            nickname={longestCorrectStreakMetric.player.nickname}
          />
        )}
      </div>
    </section>
  )
}

export default SummarySection
