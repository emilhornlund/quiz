import {
  GameMode,
  GameResultClassicModeQuestionMetricDto,
  GameResultDto,
  GameResultZeroToOneHundredModeQuestionMetricDto,
} from '@quiz/common'
import React, { FC } from 'react'

import {
  buildQuestionSectionMetricDetails,
  getAveragePrecision,
  getCorrectPercentage,
} from '../utils'

import GameResultTable from './components/GameResultTable'

function getProgress(
  mode: GameMode,
  metric: GameResultDto['questionMetrics'][0],
): number {
  if (mode === GameMode.Classic) {
    return getCorrectPercentage(
      metric as GameResultClassicModeQuestionMetricDto,
    )
  }
  if (mode === GameMode.ZeroToOneHundred) {
    return getAveragePrecision(
      metric as GameResultZeroToOneHundredModeQuestionMetricDto,
    )
  }
  return 0
}

export interface QuestionSectionProps {
  mode: GameMode
  questionMetrics: GameResultDto['questionMetrics']
}

const QuestionSection: FC<QuestionSectionProps> = ({
  mode,
  questionMetrics,
}) => {
  return (
    <section>
      <GameResultTable
        items={questionMetrics.map((metric, index) => ({
          badge: index + 1,
          value: metric.text,
          progress: getProgress(mode, metric),
          details: buildQuestionSectionMetricDetails(mode, metric),
        }))}
      />
    </section>
  )
}

export default QuestionSection
