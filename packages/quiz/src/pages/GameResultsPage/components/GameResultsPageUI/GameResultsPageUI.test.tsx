import { GameMode, type GameResultDto, QuestionType } from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it } from 'vitest'

import GameResultsPageUI from './GameResultsPageUI'

const CREATED_DATE = new Date('2025-01-01T12:00:00.000Z')

describe('GameResultsPageUI', () => {
  it('should render GameResultsPageUI for classic game mode', async () => {
    const { container } = render(
      <MemoryRouter>
        <GameResultsPageUI
          results={{
            id: uuidv4(),
            mode: GameMode.Classic,
            name: 'Classic Quiz Debug',
            host: { id: uuidv4(), nickname: 'FrostyBear' },
            numberOfPlayers: 3,
            numberOfQuestions: 4,
            playerMetrics: [
              {
                player: { id: uuidv4(), nickname: 'ShadowCyborg' },
                rank: 1,
                correct: 4,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 1961,
                longestCorrectStreak: 4,
                score: 3891,
              },
              {
                player: { id: uuidv4(), nickname: 'ShadowWhirlwind' },
                rank: 2,
                correct: 3,
                incorrect: 1,
                unanswered: 0,
                averageResponseTime: 5127,
                longestCorrectStreak: 2,
                score: 2742,
              },
              {
                player: { id: uuidv4(), nickname: 'WhiskerFox' },
                rank: 3,
                correct: 1,
                incorrect: 1,
                unanswered: 2,
                averageResponseTime: 16999,
                longestCorrectStreak: 1,
                score: 948,
              },
            ],
            questionMetrics: [
              {
                text: 'What is the capital of Sweden?',
                type: QuestionType.MultiChoice,
                correct: 3,
                incorrect: 0,
                unanswered: 0,
                averageResponseTime: 2085,
              },
              {
                text: 'Guess the temperature of the hottest day ever recorded.',
                type: QuestionType.Range,
                correct: 1,
                incorrect: 1,
                unanswered: 1,
                averageResponseTime: 12252,
              },
              {
                text: 'The earth is flat.',
                type: QuestionType.TrueFalse,
                correct: 2,
                incorrect: 1,
                unanswered: 0,
                averageResponseTime: 2869,
              },
              {
                text: 'What is the capital of Denmark?',
                type: QuestionType.TypeAnswer,
                correct: 2,
                incorrect: 0,
                unanswered: 1,
                averageResponseTime: 14910,
              },
            ],
            duration: 456,
            created: CREATED_DATE,
          }}
          currentParticipantId="participant-id-1"
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render GameResultsPageUI for zero to one hundred game mode', async () => {
    const { container } = render(
      <MemoryRouter>
        <GameResultsPageUI
          results={{
            id: uuidv4(),
            mode: GameMode.ZeroToOneHundred,
            name: '0-100 Quiz Debug',
            host: { id: uuidv4(), nickname: 'FrostyBear' },
            numberOfPlayers: 3,
            numberOfQuestions: 4,
            playerMetrics: [
              {
                player: { id: uuidv4(), nickname: 'ShadowCyborg' },
                rank: 1,
                averagePrecision: 1,
                unanswered: 0,
                averageResponseTime: 4015,
                longestCorrectStreak: 4,
                score: -40,
              },
              {
                player: { id: uuidv4(), nickname: 'ShadowWhirlwind' },
                rank: 2,
                averagePrecision: 0.95,
                unanswered: 0,
                averageResponseTime: 10662,
                longestCorrectStreak: 1,
                score: 10,
              },
              {
                player: { id: uuidv4(), nickname: 'WhiskerFox' },
                rank: 3,
                averagePrecision: 0.72,
                unanswered: 1,
                averageResponseTime: 27251,
                longestCorrectStreak: 0,
                score: 113,
              },
            ],
            questionMetrics: [
              {
                text: '2002 levererades den första Koenigseggbilen av modell CC8S. Hur många tillverkades totalt?',
                type: QuestionType.Range,
                averagePrecision: 0.98,
                unanswered: 0,
                averageResponseTime: 9428,
              },
              {
                text: 'Hur många år blev Kubas förre president Fidel Castro?',
                type: QuestionType.Range,
                averagePrecision: 0.92,
                unanswered: 0,
                averageResponseTime: 11464,
              },
              {
                text: 'Vilka är de två första decimalerna i talet pi?',
                type: QuestionType.Range,
                averagePrecision: 0.67,
                unanswered: 1,
                averageResponseTime: 25265,
              },
              {
                text: 'Hur många klädda kort finns det i en kortlek?',
                type: QuestionType.Range,
                averagePrecision: 0.99,
                unanswered: 0,
                averageResponseTime: 9748,
              },
            ],
            duration: 123.772,
            created: CREATED_DATE,
          }}
          currentParticipantId="participant-id-1"
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  const classicMinimal = (): GameResultDto => ({
    id: uuidv4(),
    mode: GameMode.Classic,
    name: 'Classic Minimal',
    host: { id: uuidv4(), nickname: 'Hosty' },
    numberOfPlayers: 2,
    numberOfQuestions: 2,
    playerMetrics: [
      {
        player: { id: uuidv4(), nickname: 'Alice' },
        rank: 1,
        correct: 2,
        incorrect: 1,
        unanswered: 0,
        averageResponseTime: 1500,
        longestCorrectStreak: 2,
        score: 200,
      },
      {
        player: { id: uuidv4(), nickname: 'Bob' },
        rank: 2,
        correct: 1,
        incorrect: 1,
        unanswered: 1,
        averageResponseTime: 2500,
        longestCorrectStreak: 1,
        score: 120,
      },
    ],
    questionMetrics: [
      {
        text: 'Q1: Capital of Sweden?',
        type: QuestionType.MultiChoice,
        correct: 2,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 1800,
      },
      {
        text: 'Q2: 2 + 2?',
        type: QuestionType.TrueFalse,
        correct: 1,
        incorrect: 1,
        unanswered: 0,
        averageResponseTime: 2200,
      },
    ],
    duration: 300,
    created: CREATED_DATE,
  })

  const z2hMinimal = (): GameResultDto => ({
    id: uuidv4(),
    mode: GameMode.ZeroToOneHundred,
    name: '0-100 Minimal',
    host: { id: uuidv4(), nickname: 'Hosty' },
    numberOfPlayers: 2,
    numberOfQuestions: 2,
    playerMetrics: [
      {
        player: { id: uuidv4(), nickname: 'Carol' },
        rank: 1,
        averagePrecision: 0.8,
        unanswered: 0,
        averageResponseTime: 2100,
        longestCorrectStreak: 2,
        score: 10,
      },
      {
        player: { id: uuidv4(), nickname: 'Dave' },
        rank: 2,
        averagePrecision: 0.6,
        unanswered: 1,
        averageResponseTime: 2600,
        longestCorrectStreak: 1,
        score: 5,
      },
    ],
    questionMetrics: [
      {
        text: 'Q1: Estimate distance',
        type: QuestionType.Range,
        averagePrecision: 0.7,
        unanswered: 0,
        averageResponseTime: 3000,
      },
      {
        text: 'Q2: Estimate height',
        type: QuestionType.Range,
        averagePrecision: 0.5,
        unanswered: 1,
        averageResponseTime: 4000,
      },
    ],
    duration: 90,
    created: CREATED_DATE,
  })

  const clickSegment = (label: string) => {
    const btn = screen.queryByRole('button', {
      name: label,
    }) as HTMLElement | null
    if (btn) {
      fireEvent.click(btn)
      return
    }
    const el = screen.getByText(label)
    const target = (el.closest('button') as HTMLElement) ?? (el as HTMLElement)
    fireEvent.click(target)
  }

  it('shows Summary by default and switches to Players and Questions (Classic)', () => {
    const { container } = render(
      <MemoryRouter>
        <GameResultsPageUI
          results={classicMinimal()}
          currentParticipantId="participant-id-1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(
      screen.getByText(
        /A quick look at how this game unfolded — see how players performed, how fast they answered, and who stood out\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Game Mode')).toBeInTheDocument()
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    clickSegment('Players')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('Q1: Capital of Sweden?')).toBeNull()
    expect(container).toMatchSnapshot()

    clickSegment('Questions')
    expect(screen.getByText('Q1: Capital of Sweden?')).toBeInTheDocument()
    expect(screen.getByText('Q2: 2 + 2?')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).toBeNull()
    expect(container).toMatchSnapshot()

    clickSegment('Summary')
    expect(screen.getByText('Game Mode')).toBeInTheDocument()
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('switches sections and shows 0 to 100 label in Summary (ZeroToOneHundred)', () => {
    const { container } = render(
      <MemoryRouter>
        <GameResultsPageUI
          results={z2hMinimal()}
          currentParticipantId="participant-id-1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Game Mode')).toBeInTheDocument()
    expect(screen.getByText('0 to 100')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    clickSegment('Players')
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.getByText('Dave')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    clickSegment('Questions')
    expect(screen.getByText('Q1: Estimate distance')).toBeInTheDocument()
    expect(screen.getByText('Q2: Estimate height')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    clickSegment('Summary')
    expect(screen.getByText('0 to 100')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
