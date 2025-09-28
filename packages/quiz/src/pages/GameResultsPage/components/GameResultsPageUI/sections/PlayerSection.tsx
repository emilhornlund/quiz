import {
  GameMode,
  GameResultClassicModePlayerMetricDto,
  GameResultDto,
  GameResultZeroToOneHundredModePlayerMetricDto,
} from '@quiz/common'
import React, { FC } from 'react'

import {
  buildPlayerSectionMetricDetails,
  getAveragePrecision,
  getCorrectPercentage,
} from '../utils'

import GameResultTable from './components/GameResultTable'

function getProgress(
  mode: GameMode,
  metric: GameResultDto['playerMetrics'][0],
): number {
  if (mode === GameMode.Classic) {
    return getCorrectPercentage(metric as GameResultClassicModePlayerMetricDto)
  }
  if (mode === GameMode.ZeroToOneHundred) {
    return getAveragePrecision(
      metric as GameResultZeroToOneHundredModePlayerMetricDto,
    )
  }
  return 0
}

export interface PlayerSectionProps {
  mode: GameMode
  playerMetrics: GameResultDto['playerMetrics']
}

const PlayerSection: FC<PlayerSectionProps> = ({ mode, playerMetrics }) => {
  return (
    <section>
      <GameResultTable
        items={playerMetrics.map((metric) => ({
          badge: metric.rank,
          value: metric.player.nickname,
          progress: getProgress(mode, metric),
          details: buildPlayerSectionMetricDetails(mode, metric),
        }))}
      />
    </section>
  )
}

export default PlayerSection
