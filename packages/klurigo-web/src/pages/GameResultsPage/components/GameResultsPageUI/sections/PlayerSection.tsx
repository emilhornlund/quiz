import type {
  GameResultClassicModePlayerMetricDto,
  GameResultDto,
  GameResultZeroToOneHundredModePlayerMetricDto,
} from '@klurigo/common'
import { GameMode } from '@klurigo/common'
import type { FC } from 'react'
import { useMemo } from 'react'

import {
  buildPlayerSectionMetricDetails,
  getAveragePrecision,
  getCorrectPercentage,
} from '../utils'

import type { TableItem, TableSeparator } from './components'
import { GameResultTable } from './components'

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
  currentParticipantId: string
}

const PlayerSection: FC<PlayerSectionProps> = ({
  mode,
  playerMetrics,
  currentParticipantId,
}) => {
  const items = useMemo<(TableItem | TableSeparator)[]>(() => {
    if (!playerMetrics?.length) return []

    const out: (TableItem | TableSeparator)[] = []
    let prevRank: number | null = null

    for (const metric of playerMetrics) {
      // gap between shown rows (e.g., 5 -> 7)
      if (prevRank !== null && metric.rank !== prevRank + 1) {
        out.push({ type: 'table-separator' as const })
      }

      out.push({
        type: 'table-row' as const,
        badge: metric.rank,
        value: metric.player.nickname,
        label: metric.player.id === currentParticipantId ? 'You' : undefined,
        progress: getProgress(mode, metric),
        details: buildPlayerSectionMetricDetails(mode, metric),
      })

      prevRank = metric.rank
    }

    // trailing separator only if we showed at least top 5
    if (playerMetrics.length >= 5) {
      // guard against accidental double-separator (shouldn’t happen with logic above, but cheap to ensure)
      if (out[out.length - 1]?.type !== 'table-separator') {
        out.push({ type: 'table-separator' as const })
      }
    }

    return out
  }, [playerMetrics, currentParticipantId, mode])

  return (
    <section>
      <GameResultTable items={items} />
    </section>
  )
}

export default PlayerSection
