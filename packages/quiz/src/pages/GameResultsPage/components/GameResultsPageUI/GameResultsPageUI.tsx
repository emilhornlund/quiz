import { GameResultDto } from '@quiz/common'
import React, { FC, useState } from 'react'

import { Page, SegmentedControl, Typography } from '../../../../components'

import styles from './GameResultsPageUI.module.scss'
import { PlayerSection, QuestionSection, SummarySection } from './sections'

export type GameResultsPageUIProps = {
  results: GameResultDto
  currentParticipantId: string
}

enum GameResultSection {
  Summary = 'SUMMARY',
  Players = 'PLAYERS',
  Questions = 'QUESTIONS',
}

const GameResultSectionLabels: { [key in GameResultSection]: string } = {
  [GameResultSection.Summary]: 'Summary',
  [GameResultSection.Players]: 'Players',
  [GameResultSection.Questions]: 'Questions',
}

const GameResultsPageUI: FC<GameResultsPageUIProps> = ({
  results,
  currentParticipantId,
}) => {
  const [selectedSection, setSelectedSection] = useState<GameResultSection>(
    GameResultSection.Summary,
  )
  return (
    <Page align="start" height="normal" discover profile>
      <div className={styles.gameResultsPage}>
        <Typography variant="subtitle">{results.name}</Typography>

        <Typography variant="text">
          A quick look at how this game unfolded — see how players performed,
          how fast they answered, and who stood out.
        </Typography>

        <SegmentedControl
          id="section-segmented-control"
          value={selectedSection}
          values={Object.values(GameResultSection).map((section) => ({
            key: section,
            value: section,
            valueLabel: GameResultSectionLabels[section],
          }))}
          onChange={(section) =>
            setSelectedSection(section as GameResultSection)
          }
        />

        {selectedSection === GameResultSection.Summary && (
          <SummarySection
            mode={results.mode}
            hostNickname={results.host.nickname || 'N/A'}
            playerMetrics={results.playerMetrics}
            questionMetrics={results.questionMetrics}
            duration={results.duration}
            created={results.created}
          />
        )}

        {selectedSection === GameResultSection.Players && (
          <PlayerSection
            mode={results.mode}
            playerMetrics={results.playerMetrics}
            currentParticipantId={currentParticipantId}
          />
        )}

        {selectedSection === GameResultSection.Questions && (
          <QuestionSection
            mode={results.mode}
            questionMetrics={results.questionMetrics}
          />
        )}
      </div>
    </Page>
  )
}

export default GameResultsPageUI
